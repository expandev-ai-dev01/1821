import type { ReverseStockMovementDto, ReverseStockMovementResponse } from '../../types';

export interface UseStockMovementReverseOptions {
  onSuccess?: (data: ReverseStockMovementResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseStockMovementReverseReturn {
  reverse: (data: ReverseStockMovementDto) => Promise<ReverseStockMovementResponse>;
  isReversing: boolean;
  error: Error | null;
}
