import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">StockBox</h1>
        <p className="text-lg text-gray-600 mb-8">Sistema de Controle de Estoque</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/stock-movements')}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="text-xl font-semibold mb-2">Movimentações</div>
            <div className="text-sm opacity-90">Registrar entradas, saídas e ajustes</div>
          </button>
          <button
            onClick={() => navigate('/products-in-shortage')}
            className="px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <div className="text-xl font-semibold mb-2">Produtos em Falta</div>
            <div className="text-sm opacity-90">Visualizar produtos com estoque baixo</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
