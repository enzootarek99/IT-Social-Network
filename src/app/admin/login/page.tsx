'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/contexts';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError(undefined);
      const user = await login(email, password);

      if (user.role !== 'ADMIN') {
        await logout();
        setError('Ce compte n’a pas accès au back-office.');
        return;
      }

      const redirect = new URLSearchParams(window.location.search).get('redirect');
      router.push(redirect?.startsWith('/admin') ? redirect : '/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion admin impossible');
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdminAccount = () => {
    setEmail('admin@example.com');
    setPassword('admin123');
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-16 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-300">
            Back-office
          </p>
          <h1 className="mt-5 text-5xl font-black leading-tight">NexusIT Admin</h1>
          <p className="mt-5 max-w-xl text-slate-300">
            Espace séparé pour superviser les utilisateurs, contenus, missions et événements.
          </p>
          <Link href="/" className="mt-8 inline-flex text-sm font-semibold text-blue-300 hover:text-blue-200">
            ← Retour au site
          </Link>
        </section>

        <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 text-slate-900 shadow-2xl">
          <h2 className="text-2xl font-bold">Connexion administrateur</h2>
          <p className="mt-2 text-sm text-slate-500">Connectez-vous avec un compte ADMIN.</p>

          {error && (
            <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
              required
            />
          </label>

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? 'Connexion...' : 'Entrer dans le dashboard'}
          </button>

          <button
            type="button"
            onClick={fillAdminAccount}
            className="mt-3 w-full rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
          >
            Utiliser le compte admin demo
          </button>
        </form>
      </div>
    </main>
  );
}
