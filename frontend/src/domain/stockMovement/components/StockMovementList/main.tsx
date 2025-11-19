import { format } from 'date-fns';
import { useStockMovementList } from '../../hooks/useStockMovementList';
import { LoadingSpinner } from '@/core/components/LoadingSpinner';
import { ErrorMessage } from '@/core/components/ErrorMessage';
import type { StockMovementListProps } from './types';

const movementTypeLabels: Record<string, string> = {
  entrada: 'Entrada',
  saída: 'Saída',
  ajuste: 'Ajuste',
  criação: 'Criação',
  exclusão: 'Exclusão',
};

export const StockMovementList = ({ filters, onMovementClick }: StockMovementListProps) => {
  const { data, isLoading, error, refetch } = useStockMovementList({ filters });

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Erro ao carregar movimentações"
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (!data || data.movements.length === 0) {
    return <div className="text-center py-8 text-gray-500">Nenhuma movimentação encontrada.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">Total: {data.total} movimentações</div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Anterior
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saldo Atual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.movements.map((movement) => (
              <tr
                key={movement.id}
                onClick={() => onMovementClick?.(movement.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(movement.dateTime), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movementTypeLabels[movement.movementType]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.idProduct}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.previousBalance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.currentBalance}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.userName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
