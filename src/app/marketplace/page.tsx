'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
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
  const [skillFilter, setSkillFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [contractTypeFilter, setContractTypeFilter] = useState('');
  const [applicationMessages, setApplicationMessages] = useState<Record<string, string>>({});
  const [applicationStatus, setApplicationStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  const loadOpportunities = useCallback(async (search = query) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (search) params.set('q', search);
      if (skillFilter) params.set('skill', skillFilter);
      if (remoteFilter) params.set('remote', remoteFilter);
      if (contractTypeFilter) params.set('contractType', contractTypeFilter);

      const suffix = params.toString() ? `?${params.toString()}` : '';
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
  }, [contractTypeFilter, query, remoteFilter, skillFilter]);

  useEffect(() => {
    void loadOpportunities();
  }, [loadOpportunities]);

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
    <main className="bg-[#0a0a0d] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] border border-[#1e1e24] bg-[#0a0a0d] shadow-2xl">
        <section className="border-b border-[#1a1a20] bg-[#0d0d12] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#e8e8f0]">
                Marketplace freelance IT
              </h1>
              <p className="mt-1 text-sm text-[#666]">
                {opportunities.length || '—'} missions actives · réseau, sécu, dev, design, cloud
              </p>
            </div>
            {isAuthenticated && (
              <span className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-xs font-semibold text-white">
                + Publier un gig
              </span>
            )}
          </div>

          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              void loadOpportunities(query);
            }}
          >
            <div className="flex items-center gap-2 rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3">
              <span className="text-[#444]">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-200 placeholder:text-[#555]"
                placeholder="Rechercher une mission (ex: firewall, pentest, React...)"
              />
              <button className="rounded-md bg-[#4f8ef7] px-4 py-1.5 text-xs font-semibold text-white">
                Rechercher
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {['Tous', 'Network', 'Cybersécurité', 'Développement', 'Design UI/UX', 'Cloud & DevOps', 'Remote'].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (label === 'Tous') {
                      setSkillFilter('');
                      setRemoteFilter('');
                    } else if (label === 'Remote') {
                      setRemoteFilter('true');
                    } else {
                      setSkillFilter(label);
                    }
                  }}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    (label === 'Tous' && !skillFilter && !remoteFilter) ||
                    skillFilter === label ||
                    (label === 'Remote' && remoteFilter === 'true')
                      ? 'border-[#2a3a58] bg-[#12121a] text-[#4f8ef7]'
                      : 'border-[#1e1e24] text-[#666] hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </section>

        <div className="grid lg:grid-cols-[260px_1fr]">
          <aside className="border-r border-[#1a1a20] bg-[#080809] p-4">
            <div className="mb-5">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555]">
                Filtres
              </h2>
              <div className="space-y-3">
                <input
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  className="w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200 placeholder:text-[#555]"
                  placeholder="Compétence"
                />
                <select
                  value={remoteFilter}
                  onChange={(event) => setRemoteFilter(event.target.value)}
                  className="w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                >
                  <option value="">Remote / sur site</option>
                  <option value="true">Remote</option>
                  <option value="false">Sur site</option>
                </select>
                <input
                  value={contractTypeFilter}
                  onChange={(event) => setContractTypeFilter(event.target.value)}
                  className="w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200 placeholder:text-[#555]"
                  placeholder="Type contrat"
                />
                <button
                  type="button"
                  onClick={() => void loadOpportunities(query)}
                  className="w-full rounded-lg bg-[#4f8ef7] px-3 py-2 text-xs font-semibold text-white"
                >
                  Appliquer
                </button>
              </div>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleSubmit} className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
                <h2 className="text-sm font-semibold text-[#e8e8f0]">Publier une mission</h2>
                <div className="mt-4 grid gap-3">
                <input
                  value={form.title}
                  onChange={(event) => updateForm('title', event.target.value)}
                  className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                  placeholder="Titre"
                  required
                />
                <input
                  value={form.company}
                  onChange={(event) => updateForm('company', event.target.value)}
                  className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                  placeholder="Entreprise"
                  required
                />
                <input
                  value={form.budget}
                  onChange={(event) => updateForm('budget', event.target.value)}
                  className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                  placeholder="Budget / TJM"
                  required
                />
                <input
                  value={form.location}
                  onChange={(event) => updateForm('location', event.target.value)}
                  className="rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                  placeholder="Localisation"
                  required
                />
                </div>
              <textarea
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                className="mt-3 w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                rows={4}
                placeholder="Description de la mission"
                required
              />
              <input
                value={form.skills}
                onChange={(event) => updateForm('skills', event.target.value)}
                className="mt-3 w-full rounded-lg border border-[#1e1e24] bg-[#131318] px-3 py-2 text-xs text-slate-200"
                placeholder="Compétences: Next.js, Prisma, PostgreSQL"
              />
              <label className="mt-3 flex items-center gap-3 text-xs text-[#888]">
                <input
                  type="checkbox"
                  checked={form.remote}
                  onChange={(event) => updateForm('remote', event.target.checked)}
                  className="h-4 w-4"
                />
                Mission possible à distance
              </label>
              {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
              <button className="mt-4 w-full rounded-lg bg-[#4f8ef7] px-4 py-2 text-xs font-semibold text-white">
                Publier
              </button>
            </form>
          ) : (
            <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4 text-xs text-[#888]">
              <p className="font-semibold">Connectez-vous pour publier une mission.</p>
              <Link href="/login" className="mt-3 inline-flex font-semibold text-[#4f8ef7]">
                Se connecter
              </Link>
            </div>
          )}
          </aside>

          <section className="bg-[#0a0a0d] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-[#666]">{opportunities.length} missions trouvées</p>
              <select className="rounded-md border border-[#1e1e24] bg-[#131318] px-3 py-1 text-xs text-[#888]">
                <option>Plus récent</option>
                <option>Budget ↑</option>
                <option>Budget ↓</option>
              </select>
            </div>
            <div className="space-y-3">
            {isLoading ? (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Chargement des missions...
              </div>
            ) : opportunities.length > 0 ? (
              opportunities.map((opportunity) => (
                <article
                  key={opportunity.id}
                  className="rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-4 transition hover:border-[#2a3a58]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-1">
                        <span className="rounded-full bg-[#0d2040] px-2 py-1 text-[10px] font-medium text-[#4f8ef7]">
                          {opportunity.contractType}
                        </span>
                        {opportunity.remote && (
                          <span className="rounded-full bg-[#0a2218] px-2 py-1 text-[10px] font-medium text-[#2dd4a0]">
                            Remote
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/marketplace/${opportunity.id}`}
                        className="text-base font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]"
                      >
                        {opportunity.title}
                      </Link>
                      <p className="mt-1 text-xs text-[#666]">
                        {opportunity.company} · {opportunity.location} ·{' '}
                        {opportunity.remote ? 'Remote' : 'Sur site'}
                      </p>
                    </div>
                    <span className="font-['Space_Grotesk'] text-lg font-semibold text-[#4f8ef7]">
                      {opportunity.budget}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#666]">{opportunity.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {opportunity.skills.map((skill) => (
                      <span key={skill} className="rounded-md border border-[#1e1e24] bg-[#131318] px-2 py-1 text-xs text-[#777]">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 border-t border-[#141418] pt-3 text-xs text-[#555]">
                    Publié par {opportunity.author.firstName} {opportunity.author.lastName} ·{' '}
                    {formatDate(opportunity.createdAt)} · {opportunity._count.applications} candidature(s)
                  </p>
                  <Link
                    href={`/marketplace/${opportunity.id}`}
                    className="mt-4 inline-flex rounded-lg border border-[#2a3a58] px-3 py-2 text-xs font-semibold text-[#4f8ef7] hover:bg-[#0d2040]"
                  >
                    Voir le détail
                  </Link>
                  {isAuthenticated ? (
                    <form
                      onSubmit={(event) => void handleApply(event, opportunity.id)}
                      className="mt-4 rounded-xl border border-[#1e1e24] bg-[#131318] p-3"
                    >
                      <label className="block text-xs font-semibold text-[#888]">
                        Message de candidature
                        <textarea
                          value={applicationMessages[opportunity.id] || ''}
                          onChange={(event) =>
                            updateApplicationMessage(opportunity.id, event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0f0f14] px-3 py-2 text-xs text-slate-200"
                          rows={3}
                          placeholder="Présentez rapidement votre disponibilité et votre expérience."
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={!applicationMessages[opportunity.id]?.trim()}
                        className="mt-3 rounded-lg bg-[#4f8ef7] px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#2a3a58]"
                      >
                        Candidater
                      </button>
                      {applicationStatus[opportunity.id] && (
                        <p className="mt-3 text-xs text-[#888]">
                          {applicationStatus[opportunity.id]}
                        </p>
                      )}
                    </form>
                  ) : (
                    <p className="mt-4 rounded-xl border border-[#1e1e24] bg-[#131318] px-4 py-3 text-xs text-[#888]">
                      Connectez-vous pour candidater à cette mission.
                    </p>
                  )}
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Aucune mission trouvée.
              </div>
            )}
          </div>
        </section>
        </div>
      </div>
    </main>
  );
}
