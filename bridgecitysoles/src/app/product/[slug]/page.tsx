import { getProducts } from '@/lib/data';
import { ProductDetail } from './ProductDetail';

export function generateStaticParams() {
  return getProducts().map(p => ({ slug: p.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  return <ProductDetail slug={params.slug} />;
}
