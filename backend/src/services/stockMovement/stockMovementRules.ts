/**
 * @summary
 * Stock movement business rules.
 * Implements business logic for stock movement operations.
 *
 * @module services/stockMovement/stockMovementRules
 */

import { getPool } from '@/utils/database';
import {
  StockMovementCreateRequest,
  StockMovementListRequest,
  StockBalanceCalculateRequest,
  StockMovementReverseRequest,
  ProductsInShortageRequest,
} from './stockMovementTypes';

export async function stockMovementCreate(params: StockMovementCreateRequest) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('idAccount', params.idAccount)
    .input('idUser', params.idUser)
    .input('movementType', params.movementType)
    .input('idProduct', params.idProduct)
    .input('quantity', params.quantity)
    .input('reason', params.reason || null)
    .input('referenceDocument', params.referenceDocument || null)
    .input('userName', params.userName)
    .input('ipAddress', params.ipAddress)
    .execute('spStockMovementCreate');

  return result.recordset[0];
}

export async function stockMovementList(params: StockMovementListRequest) {
  const pool = await getPool();
  const result = (await pool
    .request()
    .input('idAccount', params.idAccount)
    .input('startDate', params.startDate || null)
    .input('endDate', params.endDate || null)
    .input('movementType', params.movementType || null)
    .input('idProduct', params.idProduct || null)
    .input('idUser', params.idUser || null)
    .input('orderBy', params.orderBy || 'data_decrescente')
    .input('pageSize', params.pageSize || 50)
    .input('pageNumber', params.pageNumber || 1)
    .execute('spStockMovementList')) as any;

  return {
    movements: result.recordsets[0],
    total: result.recordsets[1][0].total,
  };
}

export async function stockBalanceCalculate(params: StockBalanceCalculateRequest) {
  const pool = await getPool();
  const result = (await pool
    .request()
    .input('idAccount', params.idAccount)
    .input('idProduct', params.idProduct)
    .input('referenceDate', params.referenceDate || null)
    .execute('spStockBalanceCalculate')) as any;

  return {
    balance: result.recordsets[0][0],
    movementHistory: result.recordsets[1],
  };
}

export async function stockMovementReverse(params: StockMovementReverseRequest) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('idAccount', params.idAccount)
    .input('idUser', params.idUser)
    .input('idOriginalMovement', params.idOriginalMovement)
    .input('reason', params.reason)
    .input('userName', params.userName)
    .input('ipAddress', params.ipAddress)
    .execute('spStockMovementReverse');

  return result.recordset[0];
}

export async function productsInShortage(params: ProductsInShortageRequest) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('idAccount', params.idAccount)
    .input('statusFilter', params.statusFilter || 'todos_em_falta')
    .input('orderBy', params.orderBy || 'criticidade')
    .execute('spProductsInShortage');

  return result.recordset;
}
