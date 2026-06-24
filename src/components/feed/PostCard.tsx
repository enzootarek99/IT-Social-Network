'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { FeedPost } from './types';

type PostCardProps = {
  post: FeedPost;
};

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PostCard({ post }: PostCardProps) {
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [liked, setLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleLike = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Like impossible');
      }

      setLiked(data.liked);
      setLikeCount((current) => current + (data.liked ? 1 : -1));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
          {post.author.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.avatar}
              alt={`${post.author.firstName} ${post.author.lastName}`}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            initials(post.author.firstName, post.author.lastName)
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900">
            {post.author.firstName} {post.author.lastName}
          </h3>
          <p className="text-sm text-slate-500">
            {post.author.title || 'Professionnel IT'} · {formatDate(post.createdAt)}
          </p>
        </div>
      </div>

      <p className="mt-5 whitespace-pre-wrap text-slate-700">{post.content}</p>

      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="mt-5 max-h-96 w-full rounded-2xl object-cover" />
      )}

      <div className="mt-5 flex items-center gap-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <button
          type="button"
          onClick={toggleLike}
          disabled={isUpdating}
          className={`font-semibold ${liked ? 'text-blue-700' : 'text-slate-600 hover:text-blue-700'}`}
        >
          {liked ? 'Aimé' : 'J’aime'} ({likeCount})
        </button>
        <span>{post._count.comments} commentaires</span>
      </div>
    </article>
  );
}
