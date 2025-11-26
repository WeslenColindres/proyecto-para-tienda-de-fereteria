import ProductsCatalogPage from './pages/ProductsCatalogPage';
import ProductsStockPage from './pages/ProductsStockPage';
import ProductCategoriesPage from './pages/ProductCategoriesPage';

type ProductsViewProps = {
  activeItem: string;
};

const resolvePage = (activeItem: string): 'catalog' | 'stock' | 'categories' => {
  if (activeItem === 'productos-stock') return 'stock';
  if (activeItem === 'productos-categorias') return 'categories';
  return 'catalog';
};

const ProductsView = ({ activeItem }: ProductsViewProps) => {
  const page = resolvePage(activeItem);

  if (page === 'stock') return <ProductsStockPage />;
  if (page === 'categories') return <ProductCategoriesPage />;
  return <ProductsCatalogPage />;
};

export default ProductsView;
