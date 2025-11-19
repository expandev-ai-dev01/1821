import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementCreateOptions, UseStockMovementCreateReturn } from './types';

export const useStockMovementCreate = (
  options: UseStockMovementCreateOptions = {}
): UseStockMovementCreateReturn => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: stockMovementService.create,
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
    create: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
};
