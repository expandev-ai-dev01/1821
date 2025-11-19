import { format } from 'date-fns';
import { useProductsInShortage } from '../../hooks/useProductsInShortage';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import type { ProductsInShortageListProps } from './types';

const statusLabels: Record<string, string> = {
  baixo: 'Baixo',
  crítico: 'Crítico',
  zerado: 'Zerado',
};

const statusColors: Record<string, string> = {
  baixo: 'bg-yellow-100 text-yellow-800',
  crítico: 'bg-orange-100 text-orange-800',
  zerado: 'bg-red-100 text-red-800',
};

export const ProductsInShortageList = ({
  filters,
  onProductClick,
}: ProductsInShortageListProps) => {
  const { data, isLoading, error, refetch } = useProductsInShortage({ filters });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar produtos em falta"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">Nenhum produto em falta encontrado.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">Total: {data.length} produtos</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nível Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % do Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Última Movimentação
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((product) => (
              <tr
                key={product.idProduct}
                onClick={() => onProductClick?.(product.idProduct)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {product.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statusColors[product.stockStatus]
                    }`}
                  >
                    {statusLabels[product.stockStatus]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.currentBalance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.minimumLevel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.percentageOfMinimum.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(product.lastMovementDate), 'dd/MM/yyyy HH:mm')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
