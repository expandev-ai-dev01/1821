import { authenticatedClient } from '@/core/lib/api';
import type {
  StockMovement,
  StockBalance,
  ProductInShortage,
  CreateStockMovementDto,
  StockMovementListParams,
  StockMovementListResponse,
  ReverseStockMovementDto,
  ReverseStockMovementResponse,
  ProductsInShortageParams,
} from '../types';

export const stockMovementService = {
  async create(data: CreateStockMovementDto): Promise<StockMovement> {
    const response = await authenticatedClient.post('/stock-movement', data);
    return response.data.data;
  },

  async list(params?: StockMovementListParams): Promise<StockMovementListResponse> {
    const response = await authenticatedClient.get('/stock-movement', { params });
    return response.data.data;
  },

  async getBalance(idProduct: number, referenceDate?: string): Promise<StockBalance> {
    const response = await authenticatedClient.get(`/stock-movement/balance/${idProduct}`, {
      params: referenceDate ? { referenceDate } : undefined,
    });
    return response.data.data;
  },

  async reverse(data: ReverseStockMovementDto): Promise<ReverseStockMovementResponse> {
    const response = await authenticatedClient.post('/stock-movement/reverse', data);
    return response.data.data;
  },

  async getProductsInShortage(params?: ProductsInShortageParams): Promise<ProductInShortage[]> {
    const response = await authenticatedClient.get('/stock-movement/shortage', { params });
    return response.data.data;
  },
};
