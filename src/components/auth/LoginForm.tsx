'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type LoginFormProps = {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
};

export function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, password);
  };

  const fillDemoAccount = () => {
    setEmail('demo@example.com');
    setPassword('password123');
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md rounded-3xl bg-white p-8 shadow-soft">
      <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
      <p className="mt-2 text-sm text-slate-500">
        Accédez à votre feed, vos missions et vos événements.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <label className="mt-6 block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500"
          required
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Mot de passe
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      <button
        type="button"
        onClick={fillDemoAccount}
        className="mt-3 w-full rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-blue-700 hover:bg-blue-50"
      >
        Utiliser le compte demo
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold text-blue-700">
          Créer un profil
        </Link>
      </p>
    </form>
  );
}
