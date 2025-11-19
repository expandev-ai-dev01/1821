export * from './types';
export * from './services/stockMovementService';
export * from './hooks/useStockMovementCreate';
export * from './hooks/useStockMovementList';
export * from './hooks/useStockBalance';
export * from './hooks/useStockMovementReverse';
export * from './hooks/useProductsInShortage';
export * from './components/StockMovementForm';
export * from './components/StockMovementList';
export * from './components/ProductsInShortageList';

export const moduleMetadata = {
  name: 'stockMovement',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: ['StockMovementForm', 'StockMovementList', 'ProductsInShortageList'],
  publicHooks: [
    'useStockMovementCreate',
    'useStockMovementList',
    'useStockBalance',
    'useStockMovementReverse',
    'useProductsInShortage',
  ],
  publicServices: ['stockMovementService'],
  dependencies: {
    internal: ['@/core/components', '@/core/lib/api'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query', 'axios', 'date-fns'],
    domains: [],
  },
  exports: {
    components: ['StockMovementForm', 'StockMovementList', 'ProductsInShortageList'],
    hooks: [
      'useStockMovementCreate',
      'useStockMovementList',
      'useStockBalance',
      'useStockMovementReverse',
      'useProductsInShortage',
    ],
    services: ['stockMovementService'],
    types: [
      'StockMovement',
      'StockBalance',
      'ProductInShortage',
      'CreateStockMovementDto',
      'StockMovementListParams',
      'ReverseStockMovementDto',
      'ProductsInShortageParams',
    ],
  },
} as const;
