import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@/components/navigation/NavBar';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'NexusIT',
  description: 'Réseau professionnel IT pour profils, activités, freelance et communauté tech.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
