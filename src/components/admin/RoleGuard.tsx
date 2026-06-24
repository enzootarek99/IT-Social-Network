'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts';

type RoleGuardProps = {
  allowed: Array<'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'SUPPORT'>;
  children: ReactNode;
  fallback?: ReactNode;
};

export function RoleGuard({ allowed, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN' || !user.adminRole || !allowed.includes(user.adminRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
