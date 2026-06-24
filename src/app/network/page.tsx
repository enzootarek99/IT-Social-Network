'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts';

type NetworkUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
  company?: string | null;
  location?: string | null;
  skills: string[];
  followingByMe: boolean;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
};

const specialties = ['Tous', 'Network', 'Cybersécurité', 'DevOps', 'Développement', 'Design', 'Marketing', 'Freelancers', 'Montréal'];
const popularSkills = ['Cisco IOS', 'pfSense', 'React', 'Kubernetes', 'OSCP', 'Figma', 'Splunk', 'Terraform', 'AWS'];
const groups = [
  ['🛡️', 'Cybersec Montréal', '1 248 membres'],
  ['🧪', 'Homelab Québec', '842 membres'],
  ['🎮', 'LAN & Gaming Tech', '530 membres'],
  ['☁️', 'Cloud & DevOps', '1 102 membres'],
];

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function avatarClass(index: number) {
  const classes = [
    'bg-[#0d2040] text-[#4f8ef7]',
    'bg-[#0a2218] text-[#2dd4a0]',
    'bg-[#1a1030] text-[#a78bfa]',
    'bg-[#1f0d08] text-[#fb923c]',
    'bg-[#1f1200] text-[#f59e0b]',
  ];
  return classes[index % classes.length];
}

export default function NetworkPage() {
  const { isAuthenticated } = useAuth();
  const [users, setUsers] = useState<NetworkUser[]>([]);
  const [query, setQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('Tous');
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string>();

  const loadUsers = useCallback(async (search = query) => {
    try {
      setIsLoading(true);
      setError(undefined);
      const finalSearch = activeSpecialty !== 'Tous' && !search ? activeSpecialty : search;
      const suffix = finalSearch ? `?q=${encodeURIComponent(finalSearch)}` : '';
      const response = await fetch(`/api/users${suffix}`, { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Chargement du réseau impossible');
      }

      setUsers(data.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chargement du réseau impossible');
    } finally {
      setIsLoading(false);
    }
  }, [activeSpecialty, query]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadUsers(query);
  };

  const toggleFollow = async (userId: string) => {
    try {
      setUpdatingUserId(userId);
      setError(undefined);
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action impossible');
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId
            ? {
                ...user,
                followingByMe: data.following,
                _count: {
                  ...user._count,
                  followers: Math.max(0, user._count.followers + (data.following ? 1 : -1)),
                },
              }
            : user,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible');
    } finally {
      setUpdatingUserId(undefined);
    }
  };

  const following = users.filter((user) => user.followingByMe);

  return (
    <main className="bg-[#0a0a0d] px-4 py-6 text-slate-200 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[1.25rem] border border-[#1e1e24] bg-[#0a0a0d] shadow-2xl">
        <section className="border-b border-[#1a1a20] bg-[#0d0d12] p-5">
          <h1 className="font-['Space_Grotesk'] text-2xl font-semibold text-[#e8e8f0]">Mon réseau</h1>
          <p className="mt-1 text-sm text-[#666]">
            {users.length} professionnels · {following.length} suivis · communauté NexusIT
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex flex-col gap-3 md:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3">
              <span className="text-[#444]">⌕</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-slate-200 placeholder:text-[#555]"
                placeholder="Chercher par nom, skill, entreprise..."
              />
            </div>
            <button className="rounded-lg border border-[#1e1e24] bg-[#131318] px-4 py-3 text-sm font-semibold text-[#888] hover:text-[#4f8ef7]">
              Filtrer
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => {
                  setActiveSpecialty(specialty);
                  setQuery('');
                }}
                className={`rounded-full border px-3 py-1 text-xs ${
                  activeSpecialty === specialty
                    ? 'border-[#2a3a58] bg-[#0d2040] text-[#4f8ef7]'
                    : 'border-[#1e1e24] text-[#666] hover:text-slate-300'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_300px]">
          <section className="border-r border-[#1a1a20] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#d0d0dc]">Personnes que tu pourrais connaître</p>
                <p className="text-xs text-[#555]">Basé sur tes skills et connexions communes</p>
              </div>
              <span className="text-xs text-[#4f8ef7]">Voir tout</span>
            </div>

            {error && <div className="mb-4 rounded-xl border border-red-900/40 bg-red-950/40 p-3 text-xs text-red-300">{error}</div>}

            {isLoading ? (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Chargement du réseau...
              </div>
            ) : users.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {users.map((item, index) => (
                  <article key={item.id} className="rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-4 text-center transition hover:border-[#2a3a58]">
                    <div className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-full text-base font-bold ${avatarClass(index)}`}>
                      {item.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.avatar} alt={`${item.firstName} ${item.lastName}`} className="h-14 w-14 rounded-full object-cover" />
                      ) : (
                        initials(item.firstName, item.lastName)
                      )}
                      {index % 3 === 0 && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0f0f14] bg-[#2dd4a0]" />}
                    </div>

                    <Link href={`/profile/${item.username}`} className="mt-3 block text-sm font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]">
                      {item.firstName} {item.lastName}
                    </Link>
                    <p className="mt-1 text-xs leading-5 text-[#555]">{item.title || 'Professionnel IT'}{item.company ? ` · ${item.company}` : ''}</p>
                    <p className="mt-1 text-[11px] text-[#444]">{item.location || 'Remote'}</p>

                    <div className="mt-3 flex flex-wrap justify-center gap-1">
                      {item.skills.slice(0, 2).map((skill, skillIndex) => (
                        <span key={skill} className={`rounded-full px-2 py-0.5 text-[10px] ${skillIndex % 2 ? 'bg-[#0a2218] text-[#2dd4a0]' : 'bg-[#0d2040] text-[#4f8ef7]'}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] text-[#444]">{Math.max(1, item._count.followers)} connexions en commun</p>

                    <button
                      type="button"
                      disabled={!isAuthenticated || updatingUserId === item.id}
                      onClick={() => void toggleFollow(item.id)}
                      className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs font-semibold ${
                        item.followingByMe
                          ? 'border-[#0d2040] bg-[#0d2040] text-[#4f8ef7]'
                          : 'border-[#2a3a58] text-[#4f8ef7] hover:bg-[#0d2040]'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {item.followingByMe ? '✓ Suivi' : '+ Connecter'}
                    </button>
                    {isAuthenticated && (
                      <Link href={`/messages?userId=${item.id}`} className="mt-2 inline-flex w-full justify-center rounded-lg bg-[#131318] px-3 py-2 text-xs font-semibold text-[#888] hover:text-[#4f8ef7]">
                        Message
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-8 text-center text-[#666]">
                Aucun profil trouvé.
              </div>
            )}

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[#d0d0dc]">Mes connexions ({following.length})</p>
                <span className="text-xs text-[#4f8ef7]">Voir tout</span>
              </div>
              <div className="space-y-2">
                {(following.length ? following : users.slice(0, 3)).map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-3">
                    <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClass(index + 2)}`}>
                      {initials(item.firstName, item.lastName)}
                      {index % 2 === 0 && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0f0f14] bg-[#2dd4a0]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/profile/${item.username}`} className="text-sm font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]">
                        {item.firstName} {item.lastName}
                      </Link>
                      <p className="truncate text-xs text-[#555]">{item.title || 'Professionnel IT'}</p>
                    </div>
                    <Link href={`/messages?userId=${item.id}`} className="rounded-lg bg-[#0d2040] px-3 py-2 text-xs font-semibold text-[#4f8ef7]">
                      Message
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-5 bg-[#0d0d10] p-4">
            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555]">Mon réseau en chiffres</p>
              <div className="grid grid-cols-2 gap-2">
                <StatCard value={following.length} label="Connexions" />
                <StatCard value={users.reduce((sum, item) => sum + item._count.followers, 0)} label="Followers" />
                <StatCard value={users.filter((item) => !item.followingByMe).length} label="À découvrir" />
                <StatCard value={users.reduce((sum, item) => sum + item._count.posts, 0)} label="Posts" />
              </div>
            </section>

            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555]">Skills populaires</p>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill, index) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      setQuery(skill);
                      setActiveSpecialty('Tous');
                    }}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      index < 3 ? 'border-[#2a3a58] bg-[#0d2040] text-[#4f8ef7]' : 'border-[#1e1e24] bg-[#131318] text-[#666]'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#555]">Groupes</p>
              <div className="space-y-2">
                {groups.map(([icon, name, members], index) => (
                  <div key={name} className="flex items-center gap-3 border-b border-[#141418] pb-3 last:border-none">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${avatarClass(index)}`}>{icon}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#d0d0dc]">{name}</p>
                      <p className="text-xs text-[#555]">{members}</p>
                    </div>
                    <span className="rounded-md border border-[#1e1e24] px-2 py-1 text-xs text-[#888]">Joindre</span>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-[#131318] p-3 text-center">
      <p className="font-['Space_Grotesk'] text-xl font-semibold text-[#4f8ef7]">{value}</p>
      <p className="mt-1 text-[10px] text-[#555]">{label}</p>
    </div>
  );
}
