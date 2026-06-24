'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: AuthUser;
  }>;
  averageRating?: number | null;
  appliedByMe: boolean;
  isAuthor: boolean;
  _count: {
    applications: number;
  };
};

export default function OpportunityDetailPage() {
  const params = useParams<{ opportunityId: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    company: '',
    description: '',
    skills: '',
    budget: '',
    location: '',
    contractType: '',
    remote: true,
  });
  const [message, setMessage] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
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
      setEditForm({
        title: data.opportunity.title,
        company: data.opportunity.company,
        description: data.opportunity.description,
        skills: data.opportunity.skills.join(', '),
        budget: data.opportunity.budget,
        location: data.opportunity.location,
        contractType: data.opportunity.contractType,
        remote: data.opportunity.remote,
      });
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

  const handleUpdateOpportunity = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setStatus(undefined);
      setError(undefined);
      const response = await fetch(`/api/opportunities/${params.opportunityId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible');
      }

      setOpportunity((current) => (current ? { ...current, ...data.opportunity } : current));
      setStatus('Mission mise à jour.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Modification impossible');
    }
  };

  const handleDeleteOpportunity = async () => {
    if (!confirm('Supprimer cette mission ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/opportunities/${params.opportunityId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible');
      }

      router.push('/marketplace');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  const handleReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setStatus(undefined);
      setError(undefined);
      const response = await fetch(`/api/opportunities/${params.opportunityId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Review impossible');
      }

      setReviewComment('');
      setStatus('Review enregistrée.');
      await loadOpportunity();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Review impossible');
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
            {opportunity.averageRating ? ` · ★ ${opportunity.averageRating.toFixed(1)}` : ''}
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
              <h2 className="text-xl font-bold text-slate-900">Gérer la mission</h2>
              <form onSubmit={handleUpdateOpportunity} className="mt-4 space-y-3">
                <input
                  value={editForm.title}
                  onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  placeholder="Titre"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={editForm.company}
                    onChange={(event) => setEditForm((current) => ({ ...current, company: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    placeholder="Entreprise"
                  />
                  <input
                    value={editForm.budget}
                    onChange={(event) => setEditForm((current) => ({ ...current, budget: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    placeholder="Budget"
                  />
                </div>
                <textarea
                  value={editForm.description}
                  onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  rows={4}
                  placeholder="Description"
                />
                <input
                  value={editForm.skills}
                  onChange={(event) => setEditForm((current) => ({ ...current, skills: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                  placeholder="Compétences"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={editForm.location}
                    onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    placeholder="Localisation"
                  />
                  <input
                    value={editForm.contractType}
                    onChange={(event) => setEditForm((current) => ({ ...current, contractType: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500"
                    placeholder="Type"
                  />
                </div>
                <label className="flex items-center gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.remote}
                    onChange={(event) => setEditForm((current) => ({ ...current, remote: event.target.checked }))}
                  />
                  Remote possible
                </label>
                <div className="flex flex-wrap gap-3">
                  <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteOpportunity}
                    className="rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </form>
            </section>
          )}

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

          <section className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-900">Reviews</h2>
            {isAuthenticated && !opportunity.isAuthor && (
              <form onSubmit={handleReview} className="mt-4 rounded-2xl bg-slate-50 p-4">
                <label className="text-sm font-semibold text-slate-700">
                  Note
                  <select
                    value={reviewRating}
                    onChange={(event) => setReviewRating(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} étoile(s)
                      </option>
                    ))}
                  </select>
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  rows={3}
                  placeholder="Votre retour sur cette mission/client..."
                />
                <button
                  disabled={!reviewComment.trim()}
                  className="mt-3 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:bg-blue-300"
                >
                  Publier la review
                </button>
              </form>
            )}
            <div className="mt-4 space-y-3">
              {opportunity.reviews.length ? (
                opportunity.reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">
                      ★ {review.rating} · {review.reviewer.firstName} {review.reviewer.lastName}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">Aucune review pour le moment.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
