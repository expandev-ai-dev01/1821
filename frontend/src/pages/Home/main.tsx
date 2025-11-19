/**
 * @page HomePage
 * @summary Welcome page for StockBox application.
 * @domain core
 * @type landing-page
 * @category public
 */
export const HomePage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">StockBox</h1>
        <p className="text-lg text-gray-600">Sistema de Controle de Estoque</p>
      </div>
    </div>
  );
};

export default HomePage;
