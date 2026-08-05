import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure Access',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SecureLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
