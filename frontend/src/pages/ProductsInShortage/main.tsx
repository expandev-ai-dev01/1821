import { useState } from 'react';
import { ProductsInShortageList } from '@/domain/stockMovement/components/ProductsInShortageList';
import type { ProductsInShortageParams } from '@/domain/stockMovement/types';

export const ProductsInShortagePage = () => {
  const [filters, setFilters] = useState<ProductsInShortageParams>({
    statusFilter: 'todos_em_falta',
    orderBy: 'criticidade',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Produtos em Falta</h1>
        <p className="text-gray-600">Visualize produtos com estoque baixo, crítico ou zerado</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.statusFilter}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  statusFilter: e.target.value as ProductsInShortageParams['statusFilter'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos_em_falta">Todos em Falta</option>
              <option value="baixo">Baixo</option>
              <option value="crítico">Crítico</option>
              <option value="zerado">Zerado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
            <select
              value={filters.orderBy}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  orderBy: e.target.value as ProductsInShortageParams['orderBy'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="criticidade">Criticidade</option>
              <option value="alfabetica">Alfabética</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <ProductsInShortageList filters={filters} />
      </div>
    </div>
  );
};

export default ProductsInShortagePage;
