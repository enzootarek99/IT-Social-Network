'use client';

import Link from 'next/link';
import { Feed } from '@/components/feed';
import { useAuth } from '@/contexts';

const trendingTags = [
  ['#cisco', '842 posts'],
  ['#cybersec', '631 posts'],
  ['#homelab', '419 posts'],
  ['#ctf', '201 posts'],
];

const suggestions = [
  ['Marc L.', 'Pen Tester', 'ML', 'bg-[#0d2040] text-[#4f8ef7]'],
  ['Nadia A.', 'NetAdmin', 'NA', 'bg-[#0a2218] text-[#2dd4a0]'],
  ['Rania B.', 'UI/UX', 'RB', 'bg-[#1f0d08] text-[#fb923c]'],
];

const certifications = [
  ['CCNA', 72, '#4f8ef7'],
  ['Security+', 45, '#2dd4a0'],
  ['OSCP', 20, '#f59e0b'],
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#0a0a0d] px-4 py-6 text-[#d0d0dc] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[240px_1fr_280px]">
        <aside className="hidden rounded-xl border border-[#1e1e24] bg-[#131315] p-4 lg:block">
          <div className="border-b border-[#1e1e22] pb-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1d3461] to-[#2a4a8a] text-lg font-bold text-[#4f8ef7]">
              {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'NX'}
            </div>
            <p className="mt-3 text-sm font-semibold text-[#d0d0dc]">
              {user ? `${user.firstName} ${user.lastName}` : 'NexusIT'}
            </p>
            <p className="mt-1 text-xs text-[#555]">{user?.title || 'Réseau professionnel IT'}</p>
            <div className="mt-4 flex justify-around">
              <div>
                <p className="font-['Space_Grotesk'] text-lg font-semibold text-[#4f8ef7]">248</p>
                <p className="text-[10px] text-[#555]">Connexions</p>
              </div>
              <div>
                <p className="font-['Space_Grotesk'] text-lg font-semibold text-[#4f8ef7]">12</p>
                <p className="text-[10px] text-[#555]">Posts</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            {[
              ['Dashboard', '/dashboard'],
              ['Profil', '/profile'],
              ['Certifications', '/profile'],
              ['Labs', '/search'],
              ['Sauvegardés', '/saved'],
              ['Paramètres', '/profile'],
            ].map(([label, href], index) => (
              <Link
                key={label}
                href={href}
                className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                  index === 0 ? 'bg-[#1a1a22] text-[#d0d0dc]' : 'text-[#666] hover:bg-[#1a1a22] hover:text-[#d0d0dc]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="space-y-3">
          <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
            <p className="font-['Space_Grotesk'] text-xl font-semibold text-[#e8e8f0]">Feed NexusIT</p>
            <p className="mt-1 text-sm text-[#555]">Partagez un tip, lab, writeup ou opportunité avec la communauté.</p>
          </div>
          <Feed />
        </section>

        <aside className="hidden space-y-4 rounded-xl border border-[#1e1e24] bg-[#131315] p-4 xl:block">
          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">Trending</p>
            <div className="space-y-1">
              {trendingTags.map(([tag, count]) => (
                <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="block border-b border-[#1a1a1e] py-2 last:border-none">
                  <p className="text-sm font-semibold text-[#d0d0dc]">{tag}</p>
                  <p className="text-xs text-[#555]">{count}</p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">Suggestions</p>
            <div className="space-y-2">
              {suggestions.map(([name, role, initials, classes]) => (
                <div key={name} className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${classes}`}>{initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#d0d0dc]">{name}</p>
                    <p className="text-xs text-[#555]">{role}</p>
                  </div>
                  <button className="rounded-full border border-[#333] px-2 py-1 text-xs text-[#888]">+</button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#555]">Certifications</p>
            <div className="space-y-3">
              {certifications.map(([name, value, color]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#d0d0dc]">{name}</span>
                    <span style={{ color: String(color) }}>{value}%</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full bg-[#1e1e22]">
                    <div className="h-1 rounded-full" style={{ width: `${value}%`, background: String(color) }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
