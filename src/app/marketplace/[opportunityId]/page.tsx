'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth, type AuthUser } from '@/contexts';
import { formatDate } from '@/lib/utils';

type OpportunityApplication = {
  id: string;
  message: string;
  createdAt: string;
  applicant: AuthUser;
};

type OpportunityDetail = {
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
  applications: OpportunityApplication[];
  appliedByMe: boolean;
  isAuthor: boolean;
  _count: {
    applications: number;
  };
};

export default function OpportunityDetailPage() {
  const params = useParams<{ opportunityId: string }>();
  const { isAuthenticated } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOpportunity = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const response = await fetch(`/api/opportunities/${params.opportunityId}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Mission introuvable');
      }

      setOpportunity(data.opportunity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mission introuvable');
    } finally {
      setIsLoading(false);
    }
  }, [params.opportunityId]);

  useEffect(() => {
    void loadOpportunity();
  }, [loadOpportunity]);

  const handleApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus(undefined);
      setError(undefined);
      const response = await fetch(`/api/opportunities/${params.opportunityId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Candidature impossible');
      }

      setMessage('');
      setStatus('Candidature envoyée.');
      await loadOpportunity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Candidature impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-500">
        Chargement de la mission...
      </main>
    );
  }

  if (error && !opportunity) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Mission introuvable</h1>
        <p className="mt-4 text-slate-600">{error}</p>
        <Link
          href="/marketplace"
          className="mt-8 inline-flex rounded-full bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Retour aux missions
        </Link>
      </main>
    );
  }

  if (!opportunity) {
    return null;
  }

  const canApply = isAuthenticated && !opportunity.isAuthor && !opportunity.appliedByMe;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/marketplace" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
        ← Retour aux missions
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl bg-white p-8 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">
                {opportunity.contractType}
              </p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900">{opportunity.title}</h1>
              <p className="mt-3 text-slate-500">
                {opportunity.company} · {opportunity.location} ·{' '}
                {opportunity.remote ? 'Remote possible' : 'Sur site'}
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
              {opportunity.budget}
            </span>
          </div>

          <p className="mt-8 whitespace-pre-wrap leading-7 text-slate-700">
            {opportunity.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {opportunity.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-8 border-t border-slate-100 pt-5 text-sm text-slate-500">
            Publié par{' '}
            <Link
              href={`/profile/${opportunity.author.username}`}
              className="font-semibold text-blue-700 hover:text-blue-900"
            >
              {opportunity.author.firstName} {opportunity.author.lastName}
            </Link>{' '}
            · {formatDate(opportunity.createdAt)} · {opportunity._count.applications} candidature(s)
          </p>
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Candidature</h2>

            {!isAuthenticated && (
              <div className="mt-4 rounded-2xl bg-blue-50 p-4 text-sm text-blue-900">
                <p>Connectez-vous pour candidater à cette mission.</p>
                <Link href="/login" className="mt-2 inline-flex font-semibold text-blue-700">
                  Se connecter
                </Link>
              </div>
            )}

            {opportunity.isAuthor && (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                Vous êtes l’auteur de cette mission. Les candidatures reçues sont listées ci-dessous.
              </p>
            )}

            {opportunity.appliedByMe && !opportunity.isAuthor && (
              <p className="mt-4 rounded-2xl bg-green-50 p-4 text-sm text-green-700">
                Vous avez déjà candidaté à cette mission.
              </p>
            )}

            {canApply && (
              <form onSubmit={handleApply} className="mt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Message
                  <textarea
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    rows={5}
                    placeholder="Présentez votre expérience et votre disponibilité."
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="mt-4 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  Envoyer ma candidature
                </button>
              </form>
            )}

            {status && <p className="mt-4 text-sm text-green-700">{status}</p>}
            {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          </section>

          {opportunity.isAuthor && (
            <section className="rounded-3xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-bold text-slate-900">Candidatures reçues</h2>
              <div className="mt-4 space-y-4">
                {opportunity.applications.length > 0 ? (
                  opportunity.applications.map((application) => (
                    <article key={application.id} className="rounded-2xl bg-slate-50 p-4">
                      <Link
                        href={`/profile/${application.applicant.username}`}
                        className="font-semibold text-slate-900 hover:text-blue-700"
                      >
                        {application.applicant.firstName} {application.applicant.lastName}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {application.applicant.title || 'Professionnel IT'} ·{' '}
                        {formatDate(application.createdAt)}
                      </p>
                      <p className="mt-3 text-sm text-slate-700">{application.message}</p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Aucune candidature pour le moment.
                  </p>
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
