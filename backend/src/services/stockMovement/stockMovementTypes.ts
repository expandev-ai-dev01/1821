/**
 * @summary
 * Stock movement type definitions.
 * Defines interfaces for stock movement operations.
 *
 * @module services/stockMovement/stockMovementTypes
 */

export interface StockMovementCreateRequest {
  idAccount: number;
  idUser: number;
  movementType: 'entrada' | 'saída' | 'ajuste' | 'criação' | 'exclusão';
  idProduct: number;
  quantity: number;
  reason?: string | null;
  referenceDocument?: string | null;
  userName: string;
  ipAddress: string;
}

export interface StockMovementListRequest {
  idAccount: number;
  startDate?: string;
  endDate?: string;
  movementType?: string;
  idProduct?: number;
  idUser?: number;
  orderBy?: string;
  pageSize?: number;
  pageNumber?: number;
}

export interface StockBalanceCalculateRequest {
  idAccount: number;
  idProduct: number;
  referenceDate?: string;
}

export interface StockMovementReverseRequest {
  idAccount: number;
  idUser: number;
  idOriginalMovement: number;
  reason: string;
  userName: string;
  ipAddress: string;
}

export interface ProductsInShortageRequest {
  idAccount: number;
  statusFilter?: string;
  orderBy?: string;
}
