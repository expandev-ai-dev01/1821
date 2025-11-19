import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseProductsInShortageOptions, UseProductsInShortageReturn } from './types';

export const useProductsInShortage = (
  options: UseProductsInShortageOptions = {}
): UseProductsInShortageReturn => {
  const { filters, enabled = true } = options;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products-in-shortage', filters],
    queryFn: () => stockMovementService.getProductsInShortage(filters),
    enabled,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
