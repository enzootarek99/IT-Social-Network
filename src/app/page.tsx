'use client';

import Link from 'next/link';
import { Feed } from '@/components/feed';
import { useAuth } from '@/contexts';

const audiences = [
  { icon: '🎓', name: 'Étudiants IT', sub: 'Teccart, cégeps, universités' },
  { icon: '💼', name: 'Professionnels', sub: 'Network, sysadmin, SOC' },
  { icon: '💻', name: 'Freelancers', sub: 'Dev, sécu, cloud, design' },
  { icon: '🖥️', name: 'Passionnés', sub: 'Homelab, gaming tech' },
  { icon: '🎨', name: 'Créatifs tech', sub: 'Marketing digital, UI/UX' },
];

const pillars = [
  {
    icon: '👥',
    title: 'Réseau pro',
    desc: 'Profil, connexions, feed, certifications, portfolio et recommandations.',
  },
  {
    icon: '📅',
    title: 'Activités & événements',
    desc: 'Meetups IT, LAN parties, sports, sorties et groupes d’intérêts.',
  },
  {
    icon: '💰',
    title: 'Marketplace freelance',
    desc: 'Missions, candidatures, portfolio, messagerie et opportunités ciblées.',
  },
  {
    icon: '🔬',
    title: 'Communauté tech',
    desc: 'CTF, labs, writeups, homelab sharing, code snippets et entraide.',
  },
];

const modules = [
  {
    chip: 'Réseau social',
    chipClass: 'bg-blue-100 text-blue-800',
    title: 'Profil & feed',
    features: ['Profil avec skills, bio, expérience', 'Posts texte/images', 'Follow, commentaires, notifications', 'Recherche globale et dashboard'],
  },
  {
    chip: 'Activités',
    chipClass: 'bg-emerald-100 text-emerald-800',
    title: 'Événements & groupes',
    features: ['Créer / rejoindre des événements', 'Catégories IT, sport, gaming, social', 'Meetups & conférences IT', 'RSVP, carte visuelle, liste à venir'],
  },
  {
    chip: 'Freelance',
    chipClass: 'bg-amber-100 text-amber-800',
    title: 'Marketplace de missions',
    features: ['Publier des offres de missions', 'Candidater avec proposition', 'Filtres compétence, budget, lieu', 'Messagerie privée client-freelancer'],
  },
  {
    chip: 'Communauté',
    chipClass: 'bg-violet-100 text-violet-800',
    title: 'Labs & CTF',
    features: ['Writeups CTF et challenges', 'Homelab configs', 'Snippets de code annotés', 'Forums par technologie'],
  },
  {
    chip: 'Jobs',
    chipClass: 'bg-red-100 text-red-800',
    title: 'Offres d’emploi IT',
    features: ['Offres filtrées par spécialité', 'Stage, CDI, remote', 'Candidature via profil', 'Matching par compétences'],
  },
  {
    chip: 'Messagerie',
    chipClass: 'bg-pink-100 text-pink-800',
    title: 'Chat & notifications',
    features: ['Messagerie privée', 'Notifications d’activité', 'Conversations directes', 'Back-office de modération'],
  },
];

const aiFeatures = [
  ['Suggestions de connexions', 'Recommande des profils selon skills et activités.'],
  ['Match freelance intelligent', 'Associe missions et freelancers par compétences.'],
  ['Résumé de posts longs', 'Produit un TL;DR pour writeups et articles techniques.'],
  ['Assistant certification', 'Prépare quiz et parcours autour des certifications.'],
  ['Modération auto', 'Détecte spam et contenus inappropriés.'],
  ['Suggestion d’événements', 'Propose des activités selon intérêts et localisation.'],
];

const stack = [
  ['Framework', 'Next.js 16 App Router'],
  ['UI', 'Tailwind CSS'],
  ['Auth', 'JWT + cookies HTTP-only'],
  ['Base de données', 'PostgreSQL'],
  ['ORM', 'Prisma'],
  ['Admin', 'Back-office séparé'],
];

const phases = [
  ['Phase 1', 'Fondations', 'Auth, profils, DB schema, navigation, seed demo.'],
  ['Phase 2', 'Réseau & feed', 'Posts, follow, commentaires, notifications, recherche.'],
  ['Phase 3', 'Activités & freelance', 'Événements, marketplace, candidatures, détails.'],
  ['Phase 4', 'Polish produit', 'Admin, messagerie, dashboard, filtres, UX responsive.'],
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="bg-[#f5f4f0]">
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 rounded-[2rem] border border-[#d3d1c7] bg-white p-6 shadow-soft lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#178FD8] text-white">
              <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="5" r="2" />
                <circle cx="5" cy="19" r="2" />
                <circle cx="19" cy="19" r="2" />
                <line x1="12" y1="7" x2="5" y2="17" />
                <line x1="12" y1="7" x2="19" y2="17" />
                <line x1="5" y1="19" x2="19" y2="19" />
              </svg>
            </div>
            <div>
              <p className="font-['Space_Grotesk'] text-4xl font-bold text-[#1a1a18]">NexusIT</p>
              <p className="mt-1 text-sm text-[#6b6b66]">
                Réseau professionnel · Activités · Freelance · Communauté tech
              </p>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-[#178FD8] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f75b5]"
              >
                Créer mon profil
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-[#d3d1c7] px-6 py-3 text-sm font-semibold text-[#1a1a18] hover:border-[#178FD8] hover:text-[#178FD8]"
              >
                Se connecter
              </Link>
            </div>
          )}
        </div>
      </section>

      <ConceptSection label="Public cible">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {audiences.map((audience) => (
            <div key={audience.name} className="rounded-xl bg-[#ededea] p-4 text-center">
              <div className="text-3xl">{audience.icon}</div>
              <p className="mt-2 text-sm font-semibold text-[#1a1a18]">{audience.name}</p>
              <p className="mt-1 text-xs text-[#6b6b66]">{audience.sub}</p>
            </div>
          ))}
        </div>
      </ConceptSection>

      <ConceptSection label="Les 4 piliers de la plateforme">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-[#d3d1c7] bg-white p-5">
              <div className="text-3xl">{pillar.icon}</div>
              <h2 className="mt-3 text-base font-bold text-[#1a1a18]">{pillar.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b6b66]">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </ConceptSection>

      <ConceptSection label="Modules détaillés">
        <div className="grid gap-4 lg:grid-cols-3">
          {modules.map((module) => (
            <div key={module.title} className="rounded-2xl border border-[#d3d1c7] bg-white p-5">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${module.chipClass}`}>
                {module.chip}
              </span>
              <h2 className="mt-4 text-base font-bold text-[#1a1a18]">{module.title}</h2>
              <div className="mt-3 space-y-2">
                {module.features.map((feature) => (
                  <p key={feature} className="flex gap-2 text-sm leading-6 text-[#4b4b47]">
                    <span className="text-emerald-600">✓</span>
                    {feature}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ConceptSection>

      <ConceptSection label="Fonctionnalités IA à intégrer">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="flex items-center gap-2 text-base font-bold text-blue-800">✦ Intelligence artificielle intégrée</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {aiFeatures.map(([title, desc]) => (
              <div key={title} className="rounded-xl border border-blue-200 bg-white p-4">
                <p className="text-sm font-bold text-blue-800">{title}</p>
                <p className="mt-1 text-xs leading-5 text-blue-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ConceptSection>

      <ConceptSection label="Stack technique">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#d3d1c7] bg-white p-5">
            <h2 className="font-bold text-[#1a1a18]">Frontend & Backend</h2>
            <StackList items={stack.slice(0, 3)} />
          </div>
          <div className="rounded-2xl border border-[#d3d1c7] bg-white p-5">
            <h2 className="font-bold text-[#1a1a18]">Données & Infrastructure</h2>
            <StackList items={stack.slice(3)} />
          </div>
        </div>
      </ConceptSection>

      <ConceptSection label="Plan produit">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {phases.map(([phase, title, desc]) => (
            <div key={phase} className="rounded-2xl border border-[#d3d1c7] bg-white p-4">
              <p className="text-xs font-semibold text-[#9a9a94]">{phase}</p>
              <h2 className="mt-2 font-bold text-[#1a1a18]">{title}</h2>
              <p className="mt-2 text-xs leading-5 text-[#6b6b66]">{desc}</p>
            </div>
          ))}
        </div>
      </ConceptSection>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9a9a94]">Feed communauté</p>
          <h2 className="mt-2 font-['Space_Grotesk'] text-3xl font-bold text-[#1a1a18]">Dernières publications</h2>
        </div>
        <Feed />
      </section>
    </main>
  );
}

function ConceptSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <p className="mb-3 mt-2 text-xs font-bold uppercase tracking-[0.25em] text-[#9a9a94]">{label}</p>
      {children}
    </section>
  );
}

function StackList({ items }: { items: string[][] }) {
  return (
    <div className="mt-3 divide-y divide-[#e8e6de]">
      {items.map(([layer, tech]) => (
        <div key={layer} className="flex items-center justify-between py-3 text-sm">
          <span className="text-[#6b6b66]">{layer}</span>
          <span className="font-semibold text-[#1a1a18]">{tech}</span>
        </div>
      ))}
    </div>
  );
}
