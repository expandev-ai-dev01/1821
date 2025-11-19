import type { StockMovementListParams } from '../../types';

export interface StockMovementListProps {
  filters?: StockMovementListParams;
  onMovementClick?: (idMovement: number) => void;
}
