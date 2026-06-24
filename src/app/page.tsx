'use client';

import Link from 'next/link';
import { Feed } from '@/components/feed';
import { useAuth } from '@/contexts';

const featureCards = [
  {
    title: 'Feed IT',
    text: 'Partagez vos projets, retours d’expérience, articles et apprentissages avec la communauté.',
  },
  {
    title: 'Profil & CV',
    text: 'Centralisez vos compétences, votre expérience et votre portfolio dans un profil professionnel.',
  },
  {
    title: 'Réseau',
    text: 'Découvrez des professionnels IT, suivez leurs profils et enrichissez votre feed.',
  },
  {
    title: 'Missions freelance',
    text: 'Publiez ou trouvez des opportunités adaptées aux compétences tech recherchées.',
  },
  {
    title: 'Événements',
    text: 'Découvrez et organisez des meetups, conférences, ateliers et sessions en ligne.',
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <main>
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-100">
              Réseau social pour professionnels IT
            </p>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              Connectez, partagez et développez votre carrière tech.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-blue-50">
              Une plateforme moderne pour publier vos idées, présenter votre CV, trouver des
              missions freelance et rejoindre les événements de la communauté.
            </p>
            {!isAuthenticated && (
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Créer mon profil
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-blue-200 px-6 py-3 font-semibold text-white hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </div>
            )}
          </div>

          <div className="glass-card rounded-[2rem] p-6 text-slate-900">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-blue-200">Aujourd’hui dans la communauté</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Nouveau projet partagé</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Architecture serverless pour une marketplace B2B.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Mission publiée</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Développeur Next.js / Prisma pour MVP SaaS.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold">Meetup à venir</p>
                  <p className="mt-1 text-sm text-slate-300">
                    Observabilité, logs et traces en production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-5 lg:px-8">
        {featureCards.map((feature) => (
          <div key={feature.title} className="rounded-3xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-bold text-slate-900">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-700">Feed</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">Dernières publications</h2>
        </div>
        <Feed />
      </section>
    </main>
  );
}
