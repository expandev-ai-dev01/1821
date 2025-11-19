import type { StockMovementListParams, StockMovementListResponse } from '../../types';

export interface UseStockMovementListOptions {
  filters?: StockMovementListParams;
  enabled?: boolean;
}

export interface UseStockMovementListReturn {
  data: StockMovementListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
