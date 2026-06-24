'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { formatDate } from '@/lib/utils';
import type { FeedComment, FeedPost } from './types';

type PostCardProps = {
  post: FeedPost;
  onDeleted?: (postId: string) => void;
};

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PostCard({ post, onDeleted }: PostCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [comments, setComments] = useState<FeedComment[]>(post.comments);
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState<string>();
  const [liked, setLiked] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postError, setPostError] = useState<string>();

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

  const handleDelete = async () => {
    if (!confirm('Supprimer cette publication ?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setPostError(undefined);
      const response = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible');
      }

      onDeleted?.(post.id);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Suppression impossible');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!commentContent.trim()) {
      return;
    }

    try {
      setIsCommenting(true);
      setCommentError(undefined);
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Commentaire impossible');
      }

      setComments((current) => [...current, data.comment]);
      setCommentCount((current) => current + 1);
      setCommentContent('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Commentaire impossible');
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <article className="rounded-3xl bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
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
            <Link
              href={`/profile/${post.author.username}`}
              className="font-semibold text-slate-900 hover:text-blue-700"
            >
              {post.author.firstName} {post.author.lastName}
            </Link>
            <p className="text-sm text-slate-500">
              {post.author.title || 'Professionnel IT'} · {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {user?.id === post.author.id && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-full border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:text-red-300"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </button>
        )}
      </div>

      {postError && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{postError}</p>}

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
        <span>{commentCount} commentaires</span>
      </div>

      {(comments.length > 0 || isAuthenticated) && (
        <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-slate-50 px-4 py-3">
              <Link
                href={`/profile/${comment.author.username}`}
                className="text-sm font-semibold text-slate-900 hover:text-blue-700"
              >
                {comment.author.firstName} {comment.author.lastName}
              </Link>
              <p className="mt-1 text-sm text-slate-700">{comment.content}</p>
            </div>
          ))}

          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <input
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-blue-500"
                placeholder="Ajouter un commentaire"
              />
              <button
                type="submit"
                disabled={isCommenting || !commentContent.trim()}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Envoyer
              </button>
            </form>
          )}

          {commentError && <p className="text-sm text-red-700">{commentError}</p>}
        </div>
      )}
    </article>
  );
}
