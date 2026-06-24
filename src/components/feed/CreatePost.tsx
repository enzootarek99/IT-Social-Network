'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/contexts';
import type { FeedPost } from './types';

type CreatePostProps = {
  onCreated: (post: FeedPost) => void;
};

export function CreatePost({ onCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState<'post' | 'video' | 'photo' | 'article'>('post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(undefined);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Publication impossible');
      }

      onCreated(data.post);
      setContent('');
      setImageUrl('');
      setIsExpanded(false);
      setMode('post');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publication impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openComposer = (nextMode: typeof mode) => {
    setMode(nextMode);
    setIsExpanded(true);
  };

  const initials = user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : 'NX';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#1e1e24] bg-[#161618] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d3461] text-sm font-bold text-[#4f8ef7]">
          {initials.toUpperCase()}
        </div>
        <button
          type="button"
          onClick={() => openComposer('post')}
          className="flex-1 rounded-full border border-[#2a2a34] bg-[#0f0f14] px-5 py-3 text-left text-sm font-medium text-[#888] hover:border-[#4f8ef7] hover:text-[#d0d0dc]"
        >
          Start a post
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4">
          <label className="sr-only" htmlFor="post-content">
            Start a post
          </label>
          <textarea
            id="post-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={mode === 'article' ? 8 : 4}
            className="w-full rounded-xl border border-[#1e1e24] bg-[#0f0f14] px-4 py-3 text-sm text-[#d0d0dc] placeholder:text-[#555] focus:border-[#4f8ef7]"
            placeholder={
              mode === 'video'
                ? 'Share a video link or write something about your video...'
                : mode === 'article'
                  ? 'Write your article...'
                  : 'What do you want to talk about?'
            }
          />

          {mode === 'photo' && (
            <label className="mt-4 block text-sm font-medium text-[#888]" htmlFor="post-image-url">
              Photo URL
              <input
                id="post-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                className="mt-2 w-full rounded-xl border border-[#1e1e24] bg-[#0f0f14] px-4 py-3 text-sm text-[#d0d0dc] placeholder:text-[#555] focus:border-[#4f8ef7]"
                placeholder="https://example.com/image.png"
              />
            </label>
          )}

          {mode === 'photo' && imageUrl && (
            <div className="mt-4 overflow-hidden rounded-xl border border-[#1e1e24]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Aperçu" className="max-h-72 w-full object-cover" />
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-4 border-t border-[#1e1e22] pt-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => openComposer('video')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              mode === 'video' && isExpanded
                ? 'bg-[#1a1030] text-[#a78bfa]'
                : 'text-[#888] hover:bg-[#0f0f14] hover:text-[#a78bfa]'
            }`}
          >
            <span className="mr-2">▶</span>Video
          </button>
          <button
            type="button"
            onClick={() => openComposer('photo')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              mode === 'photo' && isExpanded
                ? 'bg-[#0a2218] text-[#2dd4a0]'
                : 'text-[#888] hover:bg-[#0f0f14] hover:text-[#2dd4a0]'
            }`}
          >
            <span className="mr-2">▧</span>Photo
          </button>
          <button
            type="button"
            onClick={() => openComposer('article')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              mode === 'article' && isExpanded
                ? 'bg-[#1f1200] text-[#f59e0b]'
                : 'text-[#888] hover:bg-[#0f0f14] hover:text-[#f59e0b]'
            }`}
          >
            <span className="mr-2">✎</span>Write article
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsExpanded(false);
                setMode('post');
                setImageUrl('');
              }}
              className="rounded-lg border border-[#1e1e24] px-5 py-2.5 text-sm font-semibold text-[#888] hover:text-[#d0d0dc]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="rounded-lg bg-[#4f8ef7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3675dc] disabled:cursor-not-allowed disabled:bg-[#1d3461]"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        )}
      </div>
    </form>
  );
}
