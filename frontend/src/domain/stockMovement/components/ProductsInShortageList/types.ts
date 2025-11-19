import type { ProductsInShortageParams } from '../../types';

export interface ProductsInShortageListProps {
  filters?: ProductsInShortageParams;
  onProductClick?: (idProduct: number) => void;
}
