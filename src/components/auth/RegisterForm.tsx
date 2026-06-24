'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type RegisterFormProps = {
  onSubmit: (
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<void>;
  isLoading?: boolean;
  error?: string;
};

export function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(email, username, password, firstName, lastName);
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-xl rounded-3xl bg-white p-8 shadow-soft">
      <h2 className="text-2xl font-bold text-slate-900">Créer un compte</h2>
      <p className="mt-2 text-sm text-slate-500">
        Présentez votre profil IT et rejoignez la communauté.
      </p>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Prénom
          <input
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
            required
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          Nom
          <input
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
            required
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Nom d’utilisateur
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
          required
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Email
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
          required
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-slate-700">
        Mot de passe
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isLoading ? 'Création...' : 'Créer mon profil'}
      </button>

      <p className="mt-6 text-center text-sm text-slate-500">
        Déjà inscrit ?{' '}
        <Link href="/login" className="font-semibold text-blue-700">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
