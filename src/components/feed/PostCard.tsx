'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts';
import { formatDate } from '@/lib/utils';
import type { FeedComment, FeedPost } from './types';

type PostCardProps = {
  post: FeedPost;
  onUpdated?: (post: FeedPost) => void;
  onDeleted?: (postId: string) => void;
};

function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function PostCard({ post, onUpdated, onDeleted }: PostCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [currentPost, setCurrentPost] = useState(post);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [commentCount, setCommentCount] = useState(post._count.comments);
  const [comments, setComments] = useState<FeedComment[]>(post.comments);
  const [commentContent, setCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string>();
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [editContent, setEditContent] = useState(post.content);
  const [editImageUrl, setEditImageUrl] = useState(post.imageUrl || '');
  const [commentError, setCommentError] = useState<string>();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const toggleSave = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/save`, { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Sauvegarde impossible');
      }

      setSaved(data.saved);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Sauvegarde impossible');
    }
  };

  const reportPost = async () => {
    const reason = prompt('Pourquoi signaler cette publication ?');

    if (!reason?.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'post', targetId: post.id, reason }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signalement impossible');
      }

      setPostError('Signalement envoyé à la modération.');
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Signalement impossible');
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

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsUpdating(true);
      setPostError(undefined);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent, imageUrl: editImageUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible');
      }

      setCurrentPost(data.post);
      onUpdated?.(data.post);
      setIsEditing(false);
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Modification impossible');
    } finally {
      setIsUpdating(false);
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

  const handleCommentUpdate = async (event: FormEvent<HTMLFormElement>, commentId: string) => {
    event.preventDefault();

    try {
      setCommentError(undefined);
      const response = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingCommentContent }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Modification impossible');
      }

      setComments((current) =>
        current.map((comment) => (comment.id === commentId ? data.comment : comment)),
      );
      setEditingCommentId(undefined);
      setEditingCommentContent('');
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Modification impossible');
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!confirm('Supprimer ce commentaire ?')) {
      return;
    }

    try {
      setCommentError(undefined);
      const response = await fetch(`/api/posts/${post.id}/comments/${commentId}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Suppression impossible');
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId));
      setCommentCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setCommentError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  return (
    <article className="rounded-xl border border-[#1e1e24] bg-[#161618] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d3461] font-bold text-[#4f8ef7]">
            {currentPost.author.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentPost.author.avatar}
                alt={`${currentPost.author.firstName} ${currentPost.author.lastName}`}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              initials(currentPost.author.firstName, currentPost.author.lastName)
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/profile/${currentPost.author.username}`}
              className="font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]"
            >
              {currentPost.author.firstName} {currentPost.author.lastName}
            </Link>
            <p className="text-sm text-[#555]">
              {currentPost.author.title || 'Professionnel IT'} · {formatDate(currentPost.createdAt)}
            </p>
          </div>
        </div>

        {user?.id === currentPost.author.id && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsEditing((value) => !value)}
              className="rounded-full border border-[#2a3a58] px-3 py-1.5 text-xs font-semibold text-[#4f8ef7] hover:bg-[#0d2040]"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full border border-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 disabled:cursor-not-allowed disabled:text-red-900"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        )}
      </div>

      {postError && <p className="mt-4 rounded-xl border border-red-900/40 bg-red-950/40 px-4 py-3 text-sm text-red-300">{postError}</p>}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="mt-5 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            className="w-full rounded-xl border border-[#1e1e24] bg-[#0a0a0d] px-4 py-3 text-sm text-[#d0d0dc] focus:border-[#4f8ef7]"
            rows={4}
          />
          <input
            type="url"
            value={editImageUrl}
            onChange={(event) => setEditImageUrl(event.target.value)}
            className="mt-3 w-full rounded-xl border border-[#1e1e24] bg-[#0a0a0d] px-4 py-3 text-sm text-[#d0d0dc] focus:border-[#4f8ef7]"
            placeholder="URL image"
          />
          <button
            type="submit"
            disabled={isUpdating || !editContent.trim()}
            className="mt-3 rounded-lg bg-[#4f8ef7] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#1d3461]"
          >
            Enregistrer
          </button>
        </form>
      ) : (
        <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-[#888]">{currentPost.content}</p>
      )}

      {!isEditing && currentPost.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={currentPost.imageUrl} alt="" className="mt-5 max-h-96 w-full rounded-xl object-cover" />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-[#1e1e22] pt-4 text-sm text-[#555]">
        <button
          type="button"
          onClick={toggleLike}
          disabled={isUpdating}
          className={`font-semibold ${liked ? 'text-[#4f8ef7]' : 'text-[#666] hover:text-[#4f8ef7]'}`}
        >
          {liked ? 'Aimé' : 'J’aime'} ({likeCount})
        </button>
        <span>{commentCount} commentaires</span>
        {isAuthenticated && (
          <>
            <button
              type="button"
              onClick={() => void toggleSave()}
              className={`font-semibold ${saved ? 'text-[#4f8ef7]' : 'text-[#666] hover:text-[#4f8ef7]'}`}
            >
              {saved ? 'Sauvé' : 'Sauver'}
            </button>
            <button
              type="button"
              onClick={() => void reportPost()}
              className="font-semibold text-[#555] hover:text-red-400"
            >
              Signaler
            </button>
          </>
        )}
      </div>

      {(comments.length > 0 || isAuthenticated) && (
        <div className="mt-5 space-y-4 border-t border-[#1e1e22] pt-5">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/profile/${comment.author.username}`}
                  className="text-sm font-semibold text-[#d0d0dc] hover:text-[#4f8ef7]"
                >
                  {comment.author.firstName} {comment.author.lastName}
                </Link>
                {user?.id === comment.author.id && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingCommentContent(comment.content);
                      }}
                      className="text-xs font-semibold text-[#4f8ef7]"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCommentDelete(comment.id)}
                      className="text-xs font-semibold text-red-400"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <form onSubmit={(event) => void handleCommentUpdate(event, comment.id)} className="mt-2">
                  <input
                    value={editingCommentContent}
                    onChange={(event) => setEditingCommentContent(event.target.value)}
                    className="w-full rounded-full border border-[#1e1e24] bg-[#0a0a0d] px-4 py-2 text-sm text-[#d0d0dc] focus:border-[#4f8ef7]"
                  />
                  <button
                    type="submit"
                    disabled={!editingCommentContent.trim()}
                    className="mt-2 rounded-full bg-[#4f8ef7] px-4 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#1d3461]"
                  >
                    Enregistrer
                  </button>
                </form>
              ) : (
                <p className="mt-1 text-sm text-[#888]">{comment.content}</p>
              )}
            </div>
          ))}

          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <input
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                className="flex-1 rounded-full border border-[#1e1e24] bg-[#0a0a0d] px-4 py-2 text-sm text-[#d0d0dc] placeholder:text-[#555] focus:border-[#4f8ef7]"
                placeholder="Ajouter un commentaire"
              />
              <button
                type="submit"
                disabled={isCommenting || !commentContent.trim()}
                className="rounded-full bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#1d3461]"
              >
                Envoyer
              </button>
            </form>
          )}

          {commentError && <p className="text-sm text-red-300">{commentError}</p>}
        </div>
      )}
    </article>
  );
}
