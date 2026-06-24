'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type Opportunity = {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  budget: string;
  location: string;
  remote: boolean;
  contractType: string;
  createdAt: string;
  author: AuthUser;
  _count: {
    applications: number;
  };
};

const emptyForm = {
  title: '',
  company: '',
  description: '',
  skills: '',
  budget: '',
  location: '',
  contractType: 'Mission',
  remote: true,
};

export default function MarketplacePage() {
  const { isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [applicationMessages, setApplicationMessages] = useState<Record<string, string>>({});
  const [applicationStatus, setApplicationStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const loadOpportunities = async (search = '') => {
    try {
      setIsLoading(true);
      const suffix = search ? `?q=${encodeURIComponent(search)}` : '';
      const response = await fetch(`/api/opportunities${suffix}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chargement impossible');
      }

      setOpportunities(data.opportunities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement impossible');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadOpportunities();
  }, []);

  const updateForm = (field: keyof typeof emptyForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateApplicationMessage = (opportunityId: string, value: string) => {
    setApplicationMessages((current) => ({ ...current, [opportunityId]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Création impossible');
      }

      setOpportunities((current) => [data.opportunity, ...current]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Création impossible');
    }
  };

  const handleApply = async (event: FormEvent<HTMLFormElement>, opportunityId: string) => {
    event.preventDefault();
    const message = applicationMessages[opportunityId]?.trim();

    if (!message) {
      return;
    }

    try {
      setApplicationStatus((current) => ({ ...current, [opportunityId]: '' }));
      const response = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Candidature impossible');
      }

      setApplicationMessages((current) => ({ ...current, [opportunityId]: '' }));
      setApplicationStatus((current) => ({
        ...current,
        [opportunityId]: 'Candidature envoyée.',
      }));
      setOpportunities((current) =>
        current.map((opportunity) =>
          opportunity.id === opportunityId
            ? {
                ...opportunity,
                _count: {
                  applications: opportunity._count.applications + 1,
                },
              }
            : opportunity,
        ),
      );
    } catch (err) {
      setApplicationStatus((current) => ({
        ...current,
        [opportunityId]: err instanceof Error ? err.message : 'Candidature impossible',
      }));
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
            Freelance Marketplace
          </p>
          <h1 className="mt-2 text-4xl font-bold text-slate-900">Trouvez ou publiez une mission IT</h1>
          <p className="mt-4 text-slate-600">
            Regroupez les opportunités freelance pertinentes pour les développeurs, DevOps,
            designers produit, data engineers et équipes tech.
          </p>

          {isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Publier une mission</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <input
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  placeholder="Titre"
                  required
                />
                <input
                  value={form.company}
                  onChange={(event) => updateForm('company', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  placeholder="Entreprise"
                  required
                />
                <input
                  value={form.budget}
                  onChange={(event) => updateForm('budget', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  placeholder="Budget / TJM"
                  required
                />
                <input
                  value={form.location}
                  onChange={(event) => updateForm('location', event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                  placeholder="Localisation"
                  required
                />
              </div>
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                rows={4}
                placeholder="Description de la mission"
                required
              />
              <input
                value={form.skills}
                onChange={(event) => updateForm('skills', event.target.value)}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 focus:border-blue-500"
                placeholder="Compétences: Next.js, Prisma, PostgreSQL"
              />
              <label className="mt-4 flex items-center gap-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.remote}
                  onChange={(event) => updateForm('remote', event.target.checked)}
                  className="h-4 w-4"
                />
                Mission possible à distance
              </label>
              {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
              <button className="mt-5 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700">
                Publier
              </button>
            </form>
          ) : (
            <div className="mt-8 rounded-3xl bg-blue-50 p-6 text-blue-900">
              <p className="font-semibold">Connectez-vous pour publier une mission.</p>
              <Link href="/login" className="mt-3 inline-flex font-semibold text-blue-700">
                Se connecter
              </Link>
            </div>
          )}
        </section>

        <section>
          <form
            className="mb-6 flex gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void loadOpportunities(query);
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="flex-1 rounded-full border border-slate-200 px-5 py-3 focus:border-blue-500"
              placeholder="Rechercher une mission"
            />
            <button className="rounded-full bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-800">
              Rechercher
            </button>
          </form>

          <div className="space-y-5">
            {isLoading ? (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
                Chargement des missions...
              </div>
            ) : opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <article key={opportunity.id} className="rounded-3xl bg-white p-6 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/marketplace/${opportunity.id}`}
                        className="text-xl font-bold text-slate-900 hover:text-blue-700"
                      >
                        {opportunity.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {opportunity.company} · {opportunity.location} ·{' '}
                        {opportunity.remote ? 'Remote' : 'Sur site'}
                      </p>
                    </div>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      {opportunity.budget}
                    </span>
                  </div>
                  <p className="mt-4 text-slate-700">{opportunity.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    Publié par {opportunity.author.firstName} {opportunity.author.lastName} ·{' '}
                    {formatDate(opportunity.createdAt)} · {opportunity._count.applications} candidature(s)
                  </p>
                  <Link
                    href={`/marketplace/${opportunity.id}`}
                    className="mt-4 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                  >
                    Voir le détail
                  </Link>
                  {isAuthenticated ? (
                    <form
                      onSubmit={(event) => void handleApply(event, opportunity.id)}
                      className="mt-5 rounded-2xl bg-slate-50 p-4"
                    >
                      <label className="block text-sm font-semibold text-slate-700">
                        Message de candidature
                        <textarea
                          value={applicationMessages[opportunity.id] || ''}
                          onChange={(event) =>
                            updateApplicationMessage(opportunity.id, event.target.value)
                          }
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                          rows={3}
                          placeholder="Présentez rapidement votre disponibilité et votre expérience."
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!applicationMessages[opportunity.id]?.trim()}
                        className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        Candidater
                      </button>
                      {applicationStatus[opportunity.id] && (
                        <p className="mt-3 text-sm text-slate-600">
                          {applicationStatus[opportunity.id]}
                        </p>
                      )}
                    </form>
                  ) : (
                    <p className="mt-5 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-900">
                      Connectez-vous pour candidater à cette mission.
                    </p>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
                Aucune mission trouvée.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
