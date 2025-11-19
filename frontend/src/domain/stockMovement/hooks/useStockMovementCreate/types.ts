import type { CreateStockMovementDto, StockMovement } from '../../types';

export interface UseStockMovementCreateOptions {
  onSuccess?: (data: StockMovement) => void;
  onError?: (error: Error) => void;
}

export interface UseStockMovementCreateReturn {
  create: (data: CreateStockMovementDto) => Promise<StockMovement>;
  isCreating: boolean;
  error: Error | null;
}
