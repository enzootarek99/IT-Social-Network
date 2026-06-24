'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';
import { CreatePost } from './CreatePost';
import { PostCard } from './PostCard';
import type { FeedPost } from './types';

export function Feed() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/posts', { cache: 'no-store' });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Chargement du feed impossible');
        }

        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chargement du feed impossible');
      } finally {
        setIsLoading(false);
      }
    }

    void loadPosts();
  }, []);

  return (
    <section className="space-y-6">
      {isAuthenticated && <CreatePost onCreated={(post) => setPosts((current) => [post, ...current])} />}

      {error && <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Chargement du feed...
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleted={(postId) =>
              setPosts((current) => current.filter((currentPost) => currentPost.id !== postId))
            }
          />
        ))
      ) : (
        <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-soft">
          Aucun post pour le moment. Soyez le premier à partager une actualité.
        </div>
      )}
    </section>
  );
}
