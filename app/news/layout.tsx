import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News & Articles | Jumuiya Chess Initiative',
  description: 'Dive deep into our stories of impact, strategic achievements, and the resilient communities growing through chess across Kenya.',
  openGraph: {
    title: 'News & Articles | Jumuiya Chess Initiative',
    description: 'Read the latest field reports, news, and blogs about our community chess initiatives.',
    type: 'website',
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
