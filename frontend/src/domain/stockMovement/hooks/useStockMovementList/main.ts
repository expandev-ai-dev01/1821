import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementListOptions, UseStockMovementListReturn } from './types';

export const useStockMovementList = (
  options: UseStockMovementListOptions = {}
): UseStockMovementListReturn => {
  const { filters, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-movements', filters],
    queryFn: () => stockMovementService.list(filters),
    enabled,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
