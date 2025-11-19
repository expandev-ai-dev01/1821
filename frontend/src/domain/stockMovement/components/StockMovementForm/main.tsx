import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStockMovementCreate } from '../../hooks/useStockMovementCreate';
import type { StockMovementFormProps } from './types';

const stockMovementSchema = z.object({
  movementType: z.enum(['entrada', 'saída', 'ajuste', 'criação', 'exclusão']),
  idProduct: z.number().int().positive({ message: 'Produto é obrigatório' }),
  quantity: z.number({ message: 'Quantidade é obrigatória' }),
  reason: z.string().max(255).optional(),
  referenceDocument: z.string().max(50).optional(),
});

type StockMovementFormData = z.infer<typeof stockMovementSchema>;

export const StockMovementForm = ({ onSuccess, onCancel }: StockMovementFormProps) => {
  const { create, isCreating } = useStockMovementCreate({
    onSuccess: () => {
      reset();
      onSuccess?.();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      movementType: 'entrada',
      idProduct: 0,
      quantity: 0,
      reason: '',
      referenceDocument: '',
    },
  });

  const movementType = watch('movementType');
  const requiresReason = movementType === 'ajuste' || movementType === 'exclusão';

  const onSubmit = async (data: StockMovementFormData) => {
    try {
      await create(data);
    } catch (error: unknown) {
      console.error('Erro ao criar movimentação:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Movimentação *
        </label>
        <select
          {...register('movementType')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione...</option>
          <option value="entrada">Entrada</option>
          <option value="saída">Saída</option>
          <option value="ajuste">Ajuste</option>
          <option value="criação">Criação</option>
          <option value="exclusão">Exclusão</option>
        </select>
        {errors.movementType && (
          <p className="text-red-500 text-sm mt-1">{errors.movementType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID do Produto *</label>
        <input
          type="number"
          {...register('idProduct', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.idProduct && (
          <p className="text-red-500 text-sm mt-1">{errors.idProduct.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
        <input
          type="number"
          step="0.01"
          {...register('quantity', { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo {requiresReason && '*'}
        </label>
        <textarea
          {...register('reason')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documento de Referência
        </label>
        <input
          type="text"
          {...register('referenceDocument')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.referenceDocument && (
          <p className="text-red-500 text-sm mt-1">{errors.referenceDocument.message}</p>
        )}
      </div>

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
