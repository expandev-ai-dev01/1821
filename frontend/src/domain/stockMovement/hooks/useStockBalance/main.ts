import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockBalanceOptions, UseStockBalanceReturn } from './types';

export const useStockBalance = (options: UseStockBalanceOptions): UseStockBalanceReturn => {
  const { idProduct, referenceDate, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['stock-balance', idProduct, referenceDate],
    queryFn: () => stockMovementService.getBalance(idProduct, referenceDate),
    enabled: enabled && !!idProduct,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
