'use client';

import { FormEvent, useState } from 'react';
import type { FeedPost } from './types';

type CreatePostProps = {
  onCreated: (post: FeedPost) => void;
};

export function CreatePost({ onCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publication impossible');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#1e1e24] bg-[#161618] p-4">
      <label className="block text-sm font-semibold text-[#d0d0dc]" htmlFor="post-content">
        Partager une actualité, un projet ou une idée
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        className="mt-3 w-full rounded-xl border border-[#1e1e24] bg-[#0f0f14] px-4 py-3 text-sm text-[#d0d0dc] placeholder:text-[#555] focus:border-[#4f8ef7]"
        placeholder="Ex: Je viens de publier un article sur Kubernetes..."
      />
      <label className="mt-4 block text-sm font-medium text-[#888]" htmlFor="post-image-url">
        Image optionnelle
        <input
          id="post-image-url"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="mt-2 w-full rounded-xl border border-[#1e1e24] bg-[#0f0f14] px-4 py-3 text-sm text-[#d0d0dc] placeholder:text-[#555] focus:border-[#4f8ef7]"
          placeholder="https://example.com/image.png"
        />
      </label>
      {imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border border-[#1e1e24]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Aperçu" className="max-h-72 w-full object-cover" />
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-lg bg-[#4f8ef7] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3675dc] disabled:cursor-not-allowed disabled:bg-[#1d3461]"
        >
          {isSubmitting ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );
}
