'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { PostCard } from '@/components/feed/PostCard';
import type { FeedPost } from '@/components/feed/types';

export default function SavedPostsPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSavedPosts() {
      if (!isAuthenticated) {
        if (!isLoading) setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/saved-posts', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Chargement impossible');
        }

        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement impossible');
      } finally {
        setLoading(false);
      }
    }

    void loadSavedPosts();
  }, [isAuthenticated, isLoading]);

  if (!isLoading && !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1a1a18]">Connectez-vous pour voir vos sauvegardes</h1>
        <Link href="/login" className="mt-8 inline-flex rounded-full bg-[#178FD8] px-6 py-3 font-semibold text-white">
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9a9a94]">Sauvegardés</p>
      <h1 className="mt-2 font-['Space_Grotesk'] text-4xl font-bold text-[#1a1a18]">Posts sauvegardés</h1>
      {error && <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <section className="mt-8 space-y-6">
        {loading ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">Chargement...</div>
        ) : posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDeleted={(postId) => setPosts((current) => current.filter((item) => item.id !== postId))}
              onUpdated={(updatedPost) =>
                setPosts((current) => current.map((item) => (item.id === updatedPost.id ? updatedPost : item)))
              }
            />
          ))
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">Aucun post sauvegardé.</div>
        )}
      </section>
    </main>
  );
}
