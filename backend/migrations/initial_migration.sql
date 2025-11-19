-- =====================================================
-- Database Migration: Initial Schema
-- =====================================================
-- IMPORTANT: Always use [dbo] schema in this file.
-- The migration-runner will automatically replace [dbo] with [project_stockbox]
-- at runtime based on the PROJECT_ID environment variable.
-- DO NOT hardcode [project_XXX] - always use [dbo]!
-- DO NOT create schema here - migration-runner creates it programmatically.
--
-- NAMING CONVENTION (CRITICAL):
-- Use camelCase for ALL column names to align with JavaScript/TypeScript frontend
-- CORRECT: [userId], [createdAt], [firstName]
-- WRONG: [user_id], [created_at], [first_name]
-- Exception: [id] is always lowercase
-- =====================================================

-- =====================================================
-- TABLES
-- =====================================================

/**
 * @table stockMovement Stock movement transaction records
 * @multitenancy true
 * @softDelete false
 * @alias stcMov
 */
CREATE TABLE [dbo].[stockMovement] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [idAccount] INT NOT NULL,
  [movementType] VARCHAR(20) NOT NULL,
  [idProduct] INT NOT NULL,
  [quantity] NUMERIC(15,2) NOT NULL,
  [dateTime] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  [idUser] INT NOT NULL,
  [reason] NVARCHAR(255) NULL,
  [referenceDocument] VARCHAR(50) NULL,
  [previousBalance] NUMERIC(15,2) NOT NULL,
  [currentBalance] NUMERIC(15,2) NOT NULL,
  [userName] NVARCHAR(100) NOT NULL,
  [ipAddress] VARCHAR(45) NOT NULL,
  [idOriginalMovement] INT NULL,
  [isReversal] BIT NOT NULL DEFAULT 0
);
GO

/**
 * @primaryKey pkStockMovement
 * @keyType Object
 */
ALTER TABLE [dbo].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([id]);
GO

/**
 * @check chkStockMovement_MovementType Movement type validation
 * @enum {entrada} Entry - adding stock
 * @enum {saída} Exit - removing stock
 * @enum {ajuste} Adjustment - manual correction
 * @enum {criação} Creation - initial product setup
 * @enum {exclusão} Deletion - product removal
 */
ALTER TABLE [dbo].[stockMovement]
ADD CONSTRAINT [chkStockMovement_MovementType] CHECK ([movementType] IN ('entrada', 'saída', 'ajuste', 'criação', 'exclusão'));
GO

/**
 * @index ixStockMovement_Account Account isolation index
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account]
ON [dbo].[stockMovement]([idAccount]);
GO

/**
 * @index ixStockMovement_Product Product lookup index
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Product]
ON [dbo].[stockMovement]([idAccount], [idProduct]);
GO

/**
 * @index ixStockMovement_DateTime Date range queries
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_DateTime]
ON [dbo].[stockMovement]([idAccount], [dateTime] DESC);
GO

/**
 * @index ixStockMovement_User User activity tracking
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_User]
ON [dbo].[stockMovement]([idAccount], [idUser]);
GO

/**
 * @index ixStockMovement_Type Movement type filtering
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Type]
ON [dbo].[stockMovement]([idAccount], [movementType]);
GO

/**
 * @index ixStockMovement_OriginalMovement Reversal tracking
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_OriginalMovement]
ON [dbo].[stockMovement]([idAccount], [idOriginalMovement])
WHERE [idOriginalMovement] IS NOT NULL;
GO

/**
 * @table product Product master data
 * @multitenancy true
 * @softDelete true
 * @alias prd
 */
CREATE TABLE [dbo].[product] (
  [id] INT IDENTITY(1,1) NOT NULL,
  [idAccount] INT NOT NULL,
  [name] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500) NOT NULL DEFAULT '',
  [minimumLevel] NUMERIC(15,2) NOT NULL DEFAULT 0,
  [maximumCapacity] NUMERIC(15,2) NULL,
  [idStorageLocation] INT NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  [dateModified] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
  [deleted] BIT NOT NULL DEFAULT 0
);
GO

/**
 * @primaryKey pkProduct
 * @keyType Object
 */
ALTER TABLE [dbo].[product]
ADD CONSTRAINT [pkProduct] PRIMARY KEY CLUSTERED ([id]);
GO

/**
 * @index ixProduct_Account Account isolation index
 * @type ForeignKey
 * @filter Active products only
 */
CREATE NONCLUSTERED INDEX [ixProduct_Account]
ON [dbo].[product]([idAccount])
WHERE [deleted] = 0;
GO

/**
 * @index ixProduct_Name Product name search
 * @type Search
 * @filter Active products only
 */
CREATE NONCLUSTERED INDEX [ixProduct_Name]
ON [dbo].[product]([idAccount], [name])
WHERE [deleted] = 0;
GO

/**
 * @index uqProduct_Account_Name Unique product name per account
 * @type Search
 * @unique true
 * @filter Active products only
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProduct_Account_Name]
ON [dbo].[product]([idAccount], [name])
WHERE [deleted] = 0;
GO

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

CREATE OR ALTER PROCEDURE [dbo].[spStockMovementCreate]
  @idAccount INT,
  @idUser INT,
  @movementType VARCHAR(20),
  @idProduct INT,
  @quantity NUMERIC(15,2),
  @reason NVARCHAR(255) = NULL,
  @referenceDocument VARCHAR(50) = NULL,
  @userName NVARCHAR(100),
  @ipAddress VARCHAR(45)
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idUserRequired}
   */
  IF @idUser IS NULL
  BEGIN
    ;THROW 51000, 'idUserRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {movementTypeRequired}
   */
  IF @movementType IS NULL OR @movementType = ''
  BEGIN
    ;THROW 51000, 'movementTypeRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idProductRequired}
   */
  IF @idProduct IS NULL
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {quantityRequired}
   */
  IF @quantity IS NULL
  BEGIN
    ;THROW 51000, 'quantityRequired', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (SELECT 1 FROM [dbo].[product] WHERE [id] = @idProduct AND [idAccount] = @idAccount AND [deleted] = 0)
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @validation Movement type validation
   * @throw {invalidMovementType}
   */
  IF @movementType NOT IN ('entrada', 'saída', 'ajuste', 'criação', 'exclusão')
  BEGIN
    ;THROW 51000, 'invalidMovementType', 1;
  END;

  /**
   * @validation Quantity validation for entries
   * @throw {quantityMustBePositive}
   */
  IF @movementType IN ('entrada', 'criação') AND @quantity <= 0
  BEGIN
    ;THROW 51000, 'quantityMustBePositive', 1;
  END;

  /**
   * @validation Quantity validation for exits
   * @throw {quantityMustBeNegative}
   */
  IF @movementType = 'saída' AND @quantity >= 0
  BEGIN
    ;THROW 51000, 'quantityMustBeNegative', 1;
  END;

  /**
   * @validation Reason required for adjustments and deletions
   * @throw {reasonRequired}
   */
  IF @movementType IN ('ajuste', 'exclusão') AND (@reason IS NULL OR @reason = '')
  BEGIN
    ;THROW 51000, 'reasonRequired', 1;
  END;

  /**
   * @validation Decimal precision validation
   * @throw {invalidQuantityPrecision}
   */
  IF @quantity <> ROUND(@quantity, 2)
  BEGIN
    ;THROW 51000, 'invalidQuantityPrecision', 1;
  END;

  DECLARE @previousBalance NUMERIC(15,2);
  DECLARE @currentBalance NUMERIC(15,2);
  DECLARE @minimumLevel NUMERIC(15,2);
  DECLARE @maximumCapacity NUMERIC(15,2);
  DECLARE @newMovementId INT;

  /**
   * @rule {be-database-requirement} Calculate previous balance from movement history
   */
  SELECT @previousBalance = ISNULL(SUM(
    CASE 
      WHEN [movementType] = 'entrada' THEN [quantity]
      WHEN [movementType] = 'saída' THEN [quantity]
      WHEN [movementType] = 'ajuste' THEN [quantity]
      WHEN [movementType] = 'criação' THEN [quantity]
      WHEN [movementType] = 'exclusão' THEN -[previousBalance]
      ELSE 0
    END
  ), 0)
  FROM [dbo].[stockMovement]
  WHERE [idAccount] = @idAccount
    AND [idProduct] = @idProduct;

  /**
   * @rule {be-database-requirement} Get product configuration
   */
  SELECT 
    @minimumLevel = [minimumLevel],
    @maximumCapacity = [maximumCapacity]
  FROM [dbo].[product]
  WHERE [id] = @idProduct
    AND [idAccount] = @idAccount;

  /**
   * @rule {be-database-requirement} Calculate new balance based on movement type
   */
  IF @movementType = 'criação'
  BEGIN
    SET @currentBalance = @quantity;
  END
  ELSE IF @movementType = 'exclusão'
  BEGIN
    /**
     * @validation Check for other movements before deletion
     * @throw {productHasMovements}
     */
    IF EXISTS (
      SELECT 1 
      FROM [dbo].[stockMovement]
      WHERE [idAccount] = @idAccount
        AND [idProduct] = @idProduct
        AND [movementType] NOT IN ('criação')
    )
    BEGIN
      ;THROW 51000, 'productHasMovements', 1;
    END;
    
    SET @currentBalance = 0;
  END
  ELSE
  BEGIN
    SET @currentBalance = @previousBalance + @quantity;
  END;

  /**
   * @validation Insufficient stock validation
   * @throw {insufficientStock}
   */
  IF @currentBalance < 0
  BEGIN
    ;THROW 51000, 'insufficientStock', 1;
  END;

  /**
   * @validation Maximum capacity validation
   * @throw {exceedsMaximumCapacity}
   */
  IF @maximumCapacity IS NOT NULL AND @currentBalance > @maximumCapacity
  BEGIN
    ;THROW 51000, 'exceedsMaximumCapacity', 1;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {be-database-requirement} Insert movement record
     */
    INSERT INTO [dbo].[stockMovement] (
      [idAccount],
      [movementType],
      [idProduct],
      [quantity],
      [dateTime],
      [idUser],
      [reason],
      [referenceDocument],
      [previousBalance],
      [currentBalance],
      [userName],
      [ipAddress],
      [isReversal]
    )
    VALUES (
      @idAccount,
      @movementType,
      @idProduct,
      @quantity,
      GETUTCDATE(),
      @idUser,
      @reason,
      @referenceDocument,
      @previousBalance,
      @currentBalance,
      @userName,
      @ipAddress,
      0
    );

    SET @newMovementId = SCOPE_IDENTITY();

    /**
     * @output {MovementResult, 1, n}
     * @column {INT} id - Movement identifier
     * @column {VARCHAR} movementType - Type of movement
     * @column {NUMERIC} previousBalance - Balance before movement
     * @column {NUMERIC} currentBalance - Balance after movement
     * @column {BIT} belowMinimum - Alert flag for low stock
     */
    SELECT 
      [id],
      [movementType],
      [previousBalance],
      [currentBalance],
      CASE WHEN @currentBalance < @minimumLevel THEN 1 ELSE 0 END AS [belowMinimum]
    FROM [dbo].[stockMovement]
    WHERE [id] = @newMovementId;

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spStockMovementList]
  @idAccount INT,
  @startDate DATETIME2 = NULL,
  @endDate DATETIME2 = NULL,
  @movementType VARCHAR(20) = NULL,
  @idProduct INT = NULL,
  @idUser INT = NULL,
  @orderBy VARCHAR(20) = 'data_decrescente',
  @pageSize INT = 50,
  @pageNumber INT = 1
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Date range validation
   * @throw {invalidDateRange}
   */
  IF @startDate IS NOT NULL AND @endDate IS NOT NULL AND @startDate > @endDate
  BEGIN
    ;THROW 51000, 'invalidDateRange', 1;
  END;

  /**
   * @validation Page size validation
   * @throw {invalidPageSize}
   */
  IF @pageSize < 10 OR @pageSize > 1000
  BEGIN
    ;THROW 51000, 'invalidPageSize', 1;
  END;

  /**
   * @validation Page number validation
   * @throw {invalidPageNumber}
   */
  IF @pageNumber < 1
  BEGIN
    ;THROW 51000, 'invalidPageNumber', 1;
  END;

  DECLARE @offset INT = (@pageNumber - 1) * @pageSize;

  /**
   * @output {MovementList, n, n}
   * @column {INT} id - Movement identifier
   * @column {VARCHAR} movementType - Type of movement
   * @column {INT} idProduct - Product identifier
   * @column {NVARCHAR} productName - Product name
   * @column {NUMERIC} quantity - Quantity moved
   * @column {DATETIME2} dateTime - Movement timestamp
   * @column {INT} idUser - User identifier
   * @column {NVARCHAR} userName - User name
   * @column {NVARCHAR} reason - Movement reason
   * @column {VARCHAR} referenceDocument - Reference document
   * @column {NUMERIC} previousBalance - Balance before
   * @column {NUMERIC} currentBalance - Balance after
   * @column {VARCHAR} ipAddress - IP address
   * @column {BIT} isReversal - Reversal flag
   */
  SELECT 
    [stcMov].[id],
    [stcMov].[movementType],
    [stcMov].[idProduct],
    [prd].[name] AS [productName],
    [stcMov].[quantity],
    [stcMov].[dateTime],
    [stcMov].[idUser],
    [stcMov].[userName],
    [stcMov].[reason],
    [stcMov].[referenceDocument],
    [stcMov].[previousBalance],
    [stcMov].[currentBalance],
    [stcMov].[ipAddress],
    [stcMov].[isReversal]
  FROM [dbo].[stockMovement] [stcMov]
    JOIN [dbo].[product] [prd] ON ([prd].[idAccount] = [stcMov].[idAccount] AND [prd].[id] = [stcMov].[idProduct])
  WHERE [stcMov].[idAccount] = @idAccount
    AND (@startDate IS NULL OR [stcMov].[dateTime] >= @startDate)
    AND (@endDate IS NULL OR [stcMov].[dateTime] <= @endDate)
    AND (@movementType IS NULL OR @movementType = 'todos' OR [stcMov].[movementType] = @movementType)
    AND (@idProduct IS NULL OR [stcMov].[idProduct] = @idProduct)
    AND (@idUser IS NULL OR [stcMov].[idUser] = @idUser)
  ORDER BY 
    CASE WHEN @orderBy = 'data_crescente' THEN [stcMov].[dateTime] END ASC,
    CASE WHEN @orderBy = 'data_decrescente' THEN [stcMov].[dateTime] END DESC
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;

  /**
   * @output {TotalCount, 1, 1}
   * @column {INT} total - Total record count
   */
  SELECT COUNT(*) AS [total]
  FROM [dbo].[stockMovement] [stcMov]
  WHERE [stcMov].[idAccount] = @idAccount
    AND (@startDate IS NULL OR [stcMov].[dateTime] >= @startDate)
    AND (@endDate IS NULL OR [stcMov].[dateTime] <= @endDate)
    AND (@movementType IS NULL OR @movementType = 'todos' OR [stcMov].[movementType] = @movementType)
    AND (@idProduct IS NULL OR [stcMov].[idProduct] = @idProduct)
    AND (@idUser IS NULL OR [stcMov].[idUser] = @idUser);
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spStockBalanceCalculate]
  @idAccount INT,
  @idProduct INT,
  @referenceDate DATETIME2 = NULL
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idProductRequired}
   */
  IF @idProduct IS NULL
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  /**
   * @validation Product existence validation
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (SELECT 1 FROM [dbo].[product] WHERE [id] = @idProduct AND [idAccount] = @idAccount AND [deleted] = 0)
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  IF @referenceDate IS NULL
  BEGIN
    SET @referenceDate = GETUTCDATE();
  END;

  /**
   * @validation Future date validation
   * @throw {cannotCalculateFutureBalance}
   */
  IF @referenceDate > GETUTCDATE()
  BEGIN
    ;THROW 51000, 'cannotCalculateFutureBalance', 1;
  END;

  DECLARE @calculatedBalance NUMERIC(15,2);
  DECLARE @lastUpdate DATETIME2;
  DECLARE @minimumLevel NUMERIC(15,2);
  DECLARE @stockStatus VARCHAR(20);
  DECLARE @percentageOfMinimum NUMERIC(15,2);

  /**
   * @rule {be-database-requirement} Calculate balance from movement history
   */
  SELECT 
    @calculatedBalance = ISNULL(SUM(
      CASE 
        WHEN [movementType] = 'entrada' THEN [quantity]
        WHEN [movementType] = 'saída' THEN [quantity]
        WHEN [movementType] = 'ajuste' THEN [quantity]
        WHEN [movementType] = 'criação' THEN [quantity]
        WHEN [movementType] = 'exclusão' THEN -[previousBalance]
        ELSE 0
      END
    ), 0),
    @lastUpdate = MAX([dateTime])
  FROM [dbo].[stockMovement]
  WHERE [idAccount] = @idAccount
    AND [idProduct] = @idProduct
    AND [dateTime] <= @referenceDate;

  /**
   * @rule {be-database-requirement} Get product minimum level
   */
  SELECT @minimumLevel = [minimumLevel]
  FROM [dbo].[product]
  WHERE [id] = @idProduct
    AND [idAccount] = @idAccount;

  /**
   * @rule {be-database-requirement} Determine stock status
   */
  IF @calculatedBalance = 0
  BEGIN
    SET @stockStatus = 'zerado';
    SET @percentageOfMinimum = 0;
  END
  ELSE IF @minimumLevel > 0
  BEGIN
    SET @percentageOfMinimum = (@calculatedBalance / @minimumLevel) * 100;
    
    IF @percentageOfMinimum < 30
    BEGIN
      SET @stockStatus = 'crítico';
    END
    ELSE IF @calculatedBalance < @minimumLevel
    BEGIN
      SET @stockStatus = 'baixo';
    END
    ELSE
    BEGIN
      SET @stockStatus = 'normal';
    END;
  END
  ELSE
  BEGIN
    SET @stockStatus = 'normal';
    SET @percentageOfMinimum = NULL;
  END;

  /**
   * @output {BalanceResult, 1, n}
   * @column {INT} idProduct - Product identifier
   * @column {NUMERIC} calculatedBalance - Current balance
   * @column {DATETIME2} lastUpdate - Last movement date
   * @column {VARCHAR} stockStatus - Stock status
   * @column {NUMERIC} minimumLevel - Minimum level configured
   * @column {NUMERIC} percentageOfMinimum - Percentage of minimum level
   */
  SELECT 
    @idProduct AS [idProduct],
    @calculatedBalance AS [calculatedBalance],
    @lastUpdate AS [lastUpdate],
    @stockStatus AS [stockStatus],
    @minimumLevel AS [minimumLevel],
    @percentageOfMinimum AS [percentageOfMinimum];

  /**
   * @output {MovementHistory, n, n}
   * @column {INT} id - Movement identifier
   * @column {VARCHAR} movementType - Type of movement
   * @column {NUMERIC} quantity - Quantity moved
   * @column {DATETIME2} dateTime - Movement timestamp
   * @column {NUMERIC} previousBalance - Balance before
   * @column {NUMERIC} currentBalance - Balance after
   * @column {NVARCHAR} userName - User name
   * @column {NVARCHAR} reason - Movement reason
   */
  SELECT 
    [id],
    [movementType],
    [quantity],
    [dateTime],
    [previousBalance],
    [currentBalance],
    [userName],
    [reason]
  FROM [dbo].[stockMovement]
  WHERE [idAccount] = @idAccount
    AND [idProduct] = @idProduct
    AND [dateTime] <= @referenceDate
  ORDER BY [dateTime] ASC;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spStockMovementReverse]
  @idAccount INT,
  @idUser INT,
  @idOriginalMovement INT,
  @reason NVARCHAR(255),
  @userName NVARCHAR(100),
  @ipAddress VARCHAR(45)
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idUserRequired}
   */
  IF @idUser IS NULL
  BEGIN
    ;THROW 51000, 'idUserRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {idOriginalMovementRequired}
   */
  IF @idOriginalMovement IS NULL
  BEGIN
    ;THROW 51000, 'idOriginalMovementRequired', 1;
  END;

  /**
   * @validation Required parameter validation
   * @throw {reasonRequired}
   */
  IF @reason IS NULL OR @reason = ''
  BEGIN
    ;THROW 51000, 'reasonRequired', 1;
  END;

  DECLARE @originalMovementType VARCHAR(20);
  DECLARE @originalQuantity NUMERIC(15,2);
  DECLARE @idProduct INT;
  DECLARE @originalIsReversal BIT;
  DECLARE @currentBalance NUMERIC(15,2);
  DECLARE @newBalance NUMERIC(15,2);
  DECLARE @reversalQuantity NUMERIC(15,2);
  DECLARE @maximumCapacity NUMERIC(15,2);

  /**
   * @validation Movement existence validation
   * @throw {movementDoesntExist}
   */
  IF NOT EXISTS (
    SELECT 1 
    FROM [dbo].[stockMovement]
    WHERE [id] = @idOriginalMovement
      AND [idAccount] = @idAccount
  )
  BEGIN
    ;THROW 51000, 'movementDoesntExist', 1;
  END;

  /**
   * @rule {be-database-requirement} Get original movement details
   */
  SELECT 
    @originalMovementType = [movementType],
    @originalQuantity = [quantity],
    @idProduct = [idProduct],
    @originalIsReversal = [isReversal]
  FROM [dbo].[stockMovement]
  WHERE [id] = @idOriginalMovement
    AND [idAccount] = @idAccount;

  /**
   * @validation Movement type validation
   * @throw {cannotReverseMovementType}
   */
  IF @originalMovementType NOT IN ('entrada', 'saída', 'ajuste')
  BEGIN
    ;THROW 51000, 'cannotReverseMovementType', 1;
  END;

  /**
   * @validation Already reversed validation
   * @throw {movementAlreadyReversed}
   */
  IF EXISTS (
    SELECT 1
    FROM [dbo].[stockMovement]
    WHERE [idAccount] = @idAccount
      AND [idOriginalMovement] = @idOriginalMovement
      AND [isReversal] = 1
  )
  BEGIN
    ;THROW 51000, 'movementAlreadyReversed', 1;
  END;

  /**
   * @validation Cannot reverse a reversal
   * @throw {cannotReverseReversal}
   */
  IF @originalIsReversal = 1
  BEGIN
    ;THROW 51000, 'cannotReverseReversal', 1;
  END;

  /**
   * @rule {be-database-requirement} Calculate current balance
   */
  SELECT @currentBalance = ISNULL(SUM(
    CASE 
      WHEN [movementType] = 'entrada' THEN [quantity]
      WHEN [movementType] = 'saída' THEN [quantity]
      WHEN [movementType] = 'ajuste' THEN [quantity]
      WHEN [movementType] = 'criação' THEN [quantity]
      WHEN [movementType] = 'exclusão' THEN -[previousBalance]
      ELSE 0
    END
  ), 0)
  FROM [dbo].[stockMovement]
  WHERE [idAccount] = @idAccount
    AND [idProduct] = @idProduct;

  /**
   * @rule {be-database-requirement} Calculate reversal quantity
   */
  SET @reversalQuantity = -@originalQuantity;
  SET @newBalance = @currentBalance + @reversalQuantity;

  /**
   * @validation Insufficient stock for reversal
   * @throw {insufficientStockForReversal}
   */
  IF @newBalance < 0
  BEGIN
    ;THROW 51000, 'insufficientStockForReversal', 1;
  END;

  /**
   * @rule {be-database-requirement} Get maximum capacity
   */
  SELECT @maximumCapacity = [maximumCapacity]
  FROM [dbo].[product]
  WHERE [id] = @idProduct
    AND [idAccount] = @idAccount;

  /**
   * @validation Maximum capacity validation
   * @throw {exceedsMaximumCapacity}
   */
  IF @maximumCapacity IS NOT NULL AND @newBalance > @maximumCapacity
  BEGIN
    ;THROW 51000, 'exceedsMaximumCapacity', 1;
  END;

  BEGIN TRY
    BEGIN TRAN;

    /**
     * @rule {be-database-requirement} Insert reversal movement
     */
    INSERT INTO [dbo].[stockMovement] (
      [idAccount],
      [movementType],
      [idProduct],
      [quantity],
      [dateTime],
      [idUser],
      [reason],
      [referenceDocument],
      [previousBalance],
      [currentBalance],
      [userName],
      [ipAddress],
      [idOriginalMovement],
      [isReversal]
    )
    SELECT 
      @idAccount,
      [movementType],
      [idProduct],
      @reversalQuantity,
      GETUTCDATE(),
      @idUser,
      @reason,
      [referenceDocument],
      @currentBalance,
      @newBalance,
      @userName,
      @ipAddress,
      @idOriginalMovement,
      1
    FROM [dbo].[stockMovement]
    WHERE [id] = @idOriginalMovement;

    /**
     * @output {ReversalResult, 1, n}
     * @column {INT} id - Reversal movement identifier
     * @column {INT} idOriginalMovement - Original movement identifier
     * @column {NUMERIC} previousBalance - Balance before reversal
     * @column {NUMERIC} currentBalance - Balance after reversal
     */
    SELECT 
      SCOPE_IDENTITY() AS [id],
      @idOriginalMovement AS [idOriginalMovement],
      @currentBalance AS [previousBalance],
      @newBalance AS [currentBalance];

    COMMIT TRAN;
  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO

CREATE OR ALTER PROCEDURE [dbo].[spProductsInShortage]
  @idAccount INT,
  @statusFilter VARCHAR(20) = 'todos_em_falta',
  @orderBy VARCHAR(20) = 'criticidade'
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Required parameter validation
   * @throw {idAccountRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Status filter validation
   * @throw {invalidStatusFilter}
   */
  IF @statusFilter NOT IN ('baixo', 'crítico', 'zerado', 'todos_em_falta')
  BEGIN
    ;THROW 51000, 'invalidStatusFilter', 1;
  END;

  /**
   * @rule {be-database-requirement} Calculate current balance and status for all products
   */
  WITH [ProductBalances] AS (
    SELECT 
      [prd].[id] AS [idProduct],
      [prd].[name] AS [productName],
      [prd].[minimumLevel],
      ISNULL(SUM(
        CASE 
          WHEN [stcMov].[movementType] = 'entrada' THEN [stcMov].[quantity]
          WHEN [stcMov].[movementType] = 'saída' THEN [stcMov].[quantity]
          WHEN [stcMov].[movementType] = 'ajuste' THEN [stcMov].[quantity]
          WHEN [stcMov].[movementType] = 'criação' THEN [stcMov].[quantity]
          WHEN [stcMov].[movementType] = 'exclusão' THEN -[stcMov].[previousBalance]
          ELSE 0
        END
      ), 0) AS [currentBalance],
      MAX([stcMov].[dateTime]) AS [lastMovement]
    FROM [dbo].[product] [prd]
      LEFT JOIN [dbo].[stockMovement] [stcMov] ON ([stcMov].[idAccount] = [prd].[idAccount] AND [stcMov].[idProduct] = [prd].[id])
    WHERE [prd].[idAccount] = @idAccount
      AND [prd].[deleted] = 0
    GROUP BY 
      [prd].[id],
      [prd].[name],
      [prd].[minimumLevel]
  ),
  [ProductStatus] AS (
    SELECT 
      [idProduct],
      [productName],
      [currentBalance],
      [minimumLevel],
      [lastMovement],
      CASE 
        WHEN [minimumLevel] > 0 THEN ([currentBalance] / [minimumLevel]) * 100
        ELSE NULL
      END AS [percentageOfMinimum],
      CASE 
        WHEN [currentBalance] = 0 THEN 'zerado'
        WHEN [minimumLevel] > 0 AND ([currentBalance] / [minimumLevel]) * 100 < 30 THEN 'crítico'
        WHEN [currentBalance] < [minimumLevel] THEN 'baixo'
        ELSE 'normal'
      END AS [stockStatus],
      CASE 
        WHEN [currentBalance] = 0 THEN 1
        WHEN [minimumLevel] > 0 AND ([currentBalance] / [minimumLevel]) * 100 < 30 THEN 2
        WHEN [currentBalance] < [minimumLevel] THEN 3
        ELSE 4
      END AS [criticalityOrder]
    FROM [ProductBalances]
  )
  /**
   * @output {ProductsInShortage, n, n}
   * @column {INT} idProduct - Product identifier
   * @column {NVARCHAR} productName - Product name
   * @column {NUMERIC} currentBalance - Current stock balance
   * @column {NUMERIC} minimumLevel - Minimum level configured
   * @column {VARCHAR} stockStatus - Stock status
   * @column {NUMERIC} percentageOfMinimum - Percentage of minimum level
   * @column {DATETIME2} lastMovement - Last movement date
   */
  SELECT 
    [idProduct],
    [productName],
    [currentBalance],
    [minimumLevel],
    [stockStatus],
    [percentageOfMinimum],
    [lastMovement]
  FROM [ProductStatus]
  WHERE (
    (@statusFilter = 'todos_em_falta' AND [stockStatus] IN ('zerado', 'crítico', 'baixo'))
    OR (@statusFilter = 'zerado' AND [stockStatus] = 'zerado')
    OR (@statusFilter = 'crítico' AND [stockStatus] = 'crítico')
    OR (@statusFilter = 'baixo' AND [stockStatus] = 'baixo')
  )
  ORDER BY 
    CASE WHEN @orderBy = 'criticidade' THEN [criticalityOrder] END ASC,
    CASE WHEN @orderBy = 'alfabetica' THEN [productName] END ASC;
END;
GO