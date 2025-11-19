import type { ProductsInShortageParams, ProductInShortage } from '../../types';

export interface UseProductsInShortageOptions {
  filters?: ProductsInShortageParams;
  enabled?: boolean;
}

export interface UseProductsInShortageReturn {
  data: ProductInShortage[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
