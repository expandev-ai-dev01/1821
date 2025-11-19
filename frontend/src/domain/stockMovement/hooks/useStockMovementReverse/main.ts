import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementReverseOptions, UseStockMovementReverseReturn } from './types';

export const useStockMovementReverse = (
  options: UseStockMovementReverseOptions = {}
): UseStockMovementReverseReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: stockMovementService.reverse,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock-balance'] });
      queryClient.invalidateQueries({ queryKey: ['products-in-shortage'] });
      options.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options.onError?.(error);
    },
  });

  return {
    reverse: mutation.mutateAsync,
    isReversing: mutation.isPending,
    error: mutation.error,
  };
};
