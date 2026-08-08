import { Metadata, ResolvingMetadata } from 'next';
import { supabaseAdmin } from '@/lib/supabase/admin';

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const { data: tournament } = await supabaseAdmin
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();

  if (!tournament) {
    return {
      title: 'Tournament Not Found | Jumuiya Chess',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const posterUrl = tournament.poster_url || '/images/og-default.png';

  return {
    title: `${tournament.name} | Jumuiya Chess Tournaments`,
    description: tournament.description?.substring(0, 160) || `Register for the ${tournament.name} chess tournament.`,
    openGraph: {
      title: `${tournament.name} | Jumuiya Chess`,
      description: tournament.description?.substring(0, 160) || `Register for the ${tournament.name}.`,
      url: `https://jumuiyachess.org/tournaments/${id}`,
      images: [
        {
          url: posterUrl,
          width: 1200,
          height: 630,
          alt: tournament.name,
        },
        ...previousImages,
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: tournament.name,
      description: tournament.description?.substring(0, 160),
      images: [posterUrl],
    },
  };
}

export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
