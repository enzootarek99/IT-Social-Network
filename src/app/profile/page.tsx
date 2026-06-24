'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';

type ProfileUser = AuthUser & {
  _count?: {
    posts: number;
    followers: number;
    following: number;
  };
};

export default function ProfilePage() {
  const { isAuthenticated, isLoading, setUser } = useAuth();
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [skillsText, setSkillsText] = useState('');
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated) {
        return;
      }

      const response = await fetch('/api/profile', { cache: 'no-store' });
      const data = await response.json();

      if (response.ok) {
        setProfile(data.user);
        setSkillsText(data.user.skills.join(', '));
      } else {
        setError(data.error || 'Profil introuvable');
      }
    }

    void loadProfile();
  }, [isAuthenticated]);

  const updateField = (field: keyof AuthUser, value: string) => {
    setProfile((current) => (current ? { ...current, [field]: value } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profile) {
      return;
    }

    try {
      setStatus(undefined);
      setError(undefined);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          title: profile.title,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          website: profile.website,
          avatar: profile.avatar,
          skills: skillsText,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mise à jour impossible');
      }

      setProfile(data.user);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setStatus('Profil mis à jour avec succès.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mise à jour impossible');
    }
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Connectez-vous pour gérer votre CV</h1>
        <p className="mt-4 text-slate-600">
          Votre profil rassemble vos compétences, votre expérience et votre portfolio.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Profil & CV</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Votre vitrine professionnelle</h1>
      </div>

      {!profile ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Chargement du profil...
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-3xl bg-white p-8 shadow-soft">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-black text-blue-700">
              {profile.firstName.charAt(0)}
              {profile.lastName.charAt(0)}
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="mt-2 text-blue-700">{profile.title || 'Professionnel IT'}</p>
            <p className="mt-4 text-sm leading-6 text-slate-600">{profile.bio || 'Ajoutez votre bio.'}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xl font-bold">{profile._count?.posts ?? 0}</p>
                <p className="text-xs text-slate-500">Posts</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xl font-bold">{profile._count?.followers ?? 0}</p>
                <p className="text-xs text-slate-500">Abonnés</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xl font-bold">{profile._count?.following ?? 0}</p>
                <p className="text-xs text-slate-500">Suivis</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {skill}
                </span>
              ))}
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-8 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Prénom
                <input
                  value={profile.firstName}
                  onChange={(event) => updateField('firstName', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Nom
                <input
                  value={profile.lastName}
                  onChange={(event) => updateField('lastName', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Titre
              <input
                value={profile.title || ''}
                onChange={(event) => updateField('title', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="Ex: Développeuse Full Stack"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Bio
              <textarea
                value={profile.bio || ''}
                onChange={(event) => updateField('bio', event.target.value)}
                rows={5}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="Présentez votre parcours, vos objectifs et vos expertises."
              />
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Entreprise
                <input
                  value={profile.company || ''}
                  onChange={(event) => updateField('company', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Localisation
                <input
                  value={profile.location || ''}
                  onChange={(event) => updateField('location', event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Site web / portfolio
              <input
                value={profile.website || ''}
                onChange={(event) => updateField('website', event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
              />
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Compétences
              <input
                value={skillsText}
                onChange={(event) => setSkillsText(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="React, TypeScript, AWS, PostgreSQL"
              />
            </label>

            {status && <p className="mt-4 text-sm text-green-700">{status}</p>}
            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Enregistrer le profil
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
