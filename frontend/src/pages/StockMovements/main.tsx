import { useState } from 'react';
import { StockMovementForm } from '@/domain/stockMovement/components/StockMovementForm';
import { StockMovementList } from '@/domain/stockMovement/components/StockMovementList';
import type { StockMovementListParams } from '@/domain/stockMovement/types';

export const StockMovementsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState<StockMovementListParams>({
    orderBy: 'data_decrescente',
    pageSize: 50,
    pageNumber: 1,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Movimentações de Estoque</h1>
        <p className="text-gray-600">Registre e consulte todas as movimentações do estoque</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancelar' : 'Nova Movimentação'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Nova Movimentação</h2>
          <StockMovementForm
            onSuccess={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Movimentações</h2>
        <StockMovementList filters={filters} />
      </div>
    </div>
  );
};

export default StockMovementsPage;
