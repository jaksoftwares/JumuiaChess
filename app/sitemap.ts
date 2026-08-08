import { MetadataRoute } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://jumuiyachess.org';

  // Fetch dynamic routes
  const [tournamentsRes, productsRes] = await Promise.all([
    supabaseAdmin.from('tournaments').select('id, created_at'),
    supabaseAdmin.from('shop_products').select('id, created_at').eq('in_stock', true),
  ]);

  const tournaments = tournamentsRes.data || [];
  const products = productsRes.data || [];

  const tournamentUrls = tournaments.map((t) => ({
    url: `${baseUrl}/tournaments/${t.id}`,
    lastModified: t.created_at ? new Date(t.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const productUrls = products.map((p) => ({
    url: `${baseUrl}/store/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Static routes
  const staticRoutes = [
    '',
    '/news',
    '/store',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes, ...tournamentUrls, ...productUrls];
}
