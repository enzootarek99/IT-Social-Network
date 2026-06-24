'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts';

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
