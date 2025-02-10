
import { getProducts } from '@/services/api';
import ShopSection from './ShopSection';

export default async function ShopSectionWrapper() {
  const products = await getProducts();
  return <ShopSection products={products} />;
}