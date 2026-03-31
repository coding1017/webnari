import { getProducts, getProductBySlug } from '@/lib/data';
import { ProductDetail } from './ProductDetail';

export function generateStaticParams() {
  return getProducts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  return {
    title: product?.name || 'Product',
    description: product?.description || 'Shop authentic sneakers and streetwear at Bridge City Soles.',
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
