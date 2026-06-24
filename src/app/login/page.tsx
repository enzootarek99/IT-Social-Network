'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth';
import { useAuth } from '@/contexts';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(undefined);
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-blue-600 to-slate-900 px-4 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
            Communauté IT
          </p>
          <h1 className="mt-4 text-4xl font-bold">Ravi de vous revoir</h1>
        </div>
        <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
      </div>
    </main>
  );
}
