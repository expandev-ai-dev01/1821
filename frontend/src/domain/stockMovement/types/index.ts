export interface StockMovement {
  id: number;
  movementType: 'entrada' | 'saída' | 'ajuste' | 'criação' | 'exclusão';
  idProduct: number;
  quantity: number;
  dateTime: string;
  idUser: number;
  reason?: string;
  referenceDocument?: string;
  previousBalance: number;
  currentBalance: number;
  userName: string;
  ipAddress: string;
}

export interface StockBalance {
  idProduct: number;
  calculatedBalance: number;
  lastUpdate: string;
  stockStatus: 'normal' | 'baixo' | 'crítico' | 'zerado';
  minimumLevel: number;
  percentageOfMinimum: number;
  movementHistory: StockMovement[];
  integrityCheck: boolean;
  inconsistenciesDetected?: string[];
}

export interface ProductInShortage {
  idProduct: number;
  productName: string;
  currentBalance: number;
  minimumLevel: number;
  stockStatus: 'baixo' | 'crítico' | 'zerado';
  lastMovementDate: string;
  percentageOfMinimum: number;
}

export interface CreateStockMovementDto {
  movementType: 'entrada' | 'saída' | 'ajuste' | 'criação' | 'exclusão';
  idProduct: number;
  quantity: number;
  reason?: string;
  referenceDocument?: string;
}

export interface StockMovementListParams {
  startDate?: string;
  endDate?: string;
  movementType?: 'entrada' | 'saída' | 'ajuste' | 'criação' | 'exclusão' | 'todos';
  idProduct?: number;
  idUser?: number;
  orderBy?: 'data_crescente' | 'data_decrescente';
  pageSize?: number;
  pageNumber?: number;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  total: number;
}

export interface ReverseStockMovementDto {
  idOriginalMovement: number;
  reason: string;
}

export interface ReverseStockMovementResponse {
  id: number;
  idOriginalMovement: number;
  previousBalance: number;
  currentBalance: number;
}

export interface ProductsInShortageParams {
  statusFilter?: 'baixo' | 'crítico' | 'zerado' | 'todos_em_falta';
  orderBy?: 'criticidade' | 'alfabetica';
}
