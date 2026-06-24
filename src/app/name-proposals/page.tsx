'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';

const proposals = [
  {
    name: 'Linkora',
    domain: 'linkora.io · linkora.ca',
    tagline: 'Un mix entre Link et le suffixe -ora pour une place communautaire.',
    tags: ['Court', 'Mémorable', 'Universel', 'Original'],
    pros: ['Facile à prononcer en français et anglais', 'Ouvert à tous les publics', 'Logo potentiel fort'],
    winner: true,
  },
  {
    name: 'DevGrid',
    domain: 'devgrid.io · devgrid.ca',
    tagline: 'La grille comme métaphore du réseau, du maillage et de l’infrastructure IT.',
    tags: ['Techno', 'Précis', 'IT-first'],
    pros: ['Immédiatement compris par les IT', 'Évoque réseau + structure', 'Sonne professionnel'],
  },
  {
    name: 'Peerlink',
    domain: 'peerlink.io · peerlink.ca',
    tagline: 'Peer-to-peer + Link, l’idée de connexions entre pairs.',
    tags: ['Clair', 'Professionnel', 'Réseau social'],
    pros: ['Concept de pair très fort', 'LinkedIn-like mais distinct', 'Fonctionne FR/EN'],
  },
  {
    name: 'Techphere',
    domain: 'techphere.io · techphere.ca',
    tagline: 'Tech + Sphere, votre univers professionnel IT.',
    tags: ['Inclusif', 'Communauté', 'Large public'],
    pros: ['Couvre IT, design, marketing', 'Évoque un monde vivant', 'Bonne sonorité'],
  },
  {
    name: 'Stackd',
    domain: 'stackd.io · stackd.ca',
    tagline: 'Stack comme tech stack: compétences, connexions, opportunités.',
    tags: ['Moderne', 'Court', 'Gen-Z vibe'],
    pros: ['Très court', 'Connotation skills forte', 'Vibe startup'],
  },
  {
    name: 'Noduuz',
    domain: 'noduuz.com · noduuz.io',
    tagline: 'Node + suffixe original: un nœud dans le réseau IT mondial.',
    tags: ['Unique', 'Réseau', 'Mémorable'],
    pros: ['Très original', 'Connotation réseau informatique', 'Visuel fort'],
  },
];

export default function NameProposalsPage() {
  const { isAuthenticated } = useAuth();
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [selectedName, setSelectedName] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadVotes() {
      const response = await fetch('/api/name-votes', { cache: 'no-store' });
      const data = await response.json();

      if (response.ok) {
        setVotes(Object.fromEntries(data.votes.map((vote: { name: string; count: number }) => [vote.name, vote.count])));
      }
    }

    void loadVotes();
  }, []);

  const vote = async (name: string) => {
    if (!isAuthenticated) {
      setError('Connectez-vous pour voter.');
      return;
    }

    const response = await fetch('/api/name-votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Vote impossible');
      return;
    }

    setSelectedName(name);
    const refreshed = await fetch('/api/name-votes', { cache: 'no-store' });
    const refreshedData = await refreshed.json();

    if (refreshed.ok) {
      setVotes(Object.fromEntries(refreshedData.votes.map((voteItem: { name: string; count: number }) => [voteItem.name, voteItem.count])));
    }
  };

  return (
    <main className="bg-[#f5f4f0] px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9a9a94]">Naming</p>
        <h1 className="mt-2 font-['Space_Grotesk'] text-4xl font-bold text-[#1a1a18]">
          Propositions de nom
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6b6b66]">
          Votez pour le nom que vous préférez pour la plateforme.
        </p>
        {error && <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {proposals.map((proposal) => (
            <article
              key={proposal.name}
              className={`rounded-2xl border bg-white p-6 transition hover:border-[#9a9a94] ${
                proposal.winner ? 'border-2 border-[#178FD8]' : 'border-[#d3d1c7]'
              }`}
            >
              {proposal.winner && (
                <span className="mb-3 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  ★ Mon préféré
                </span>
              )}
              <h2 className="font-['Space_Grotesk'] text-3xl font-bold text-[#1a1a18]">{proposal.name}</h2>
              <p className="mt-1 font-mono text-xs text-[#6b6b66]">{proposal.domain}</p>
              <p className="mt-4 text-sm leading-6 text-[#6b6b66]">{proposal.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {proposal.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#ededea] px-3 py-1 text-xs text-[#6b6b66]">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-4 border-t border-[#e8e6de] pt-4">
                {proposal.pros.map((pro) => (
                  <p key={pro} className="flex gap-2 text-sm leading-6 text-[#4b4b47]">
                    <span className="text-emerald-600">✓</span>
                    {pro}
                  </p>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void vote(proposal.name)}
                className={`mt-5 w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
                  selectedName === proposal.name
                    ? 'border-[#178FD8] bg-blue-100 text-blue-800'
                    : 'border-[#d3d1c7] text-[#6b6b66] hover:bg-[#ededea]'
                }`}
              >
                {selectedName === proposal.name ? `✓ ${proposal.name} — votre choix` : `Je vote pour ${proposal.name}`}
                <span className="ml-2 text-xs">({votes[proposal.name] || 0})</span>
              </button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
