import type { StockBalance } from '../../types';

export interface UseStockBalanceOptions {
  idProduct: number;
  referenceDate?: string;
  enabled?: boolean;
}

export interface UseStockBalanceReturn {
  data: StockBalance | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
