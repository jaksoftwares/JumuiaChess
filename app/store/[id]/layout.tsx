import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ReactNode } from 'react';

type Props = {
  params: Promise<{ id: string }>;
  children: ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: product } = await supabaseAdmin
    .from('shop_products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | Jumuiya Chess Store',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const imageUrl = product.image_url || '/images/og-default.png';

  return {
    title: `${product.name} | Jumuiya Chess Store`,
    description: product.description?.substring(0, 160) || `Buy ${product.name} from the official Jumuiya Chess store.`,
    openGraph: {
      title: `${product.name} | Jumuiya Chess Store`,
      description: product.description?.substring(0, 160) || `Buy ${product.name}. All proceeds support chess in Africa.`,
      url: `https://jumuiyachess.org/store/${id}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: product.name,
        },
        ...previousImages,
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description?.substring(0, 160),
      images: [imageUrl],
    },
  };
}

export default async function StoreProductLayout({ params, children }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: product } = await supabaseAdmin
    .from('shop_products')
    .select('*')
    .eq('id', id)
    .single();

  if (!product) {
    return <>{children}</>;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [product.image_url],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Jumuiya Chess',
    },
    offers: {
      '@type': 'Offer',
      url: `https://jumuiyachess.org/store/${id}`,
      priceCurrency: 'KES',
      price: product.price,
      availability: product.in_stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Jumuiya Chess Foundation',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
