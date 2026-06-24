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
    <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-soft">
      <label className="block text-sm font-semibold text-slate-700" htmlFor="post-content">
        Partager une actualité, un projet ou une idée
      </label>
      <textarea
        id="post-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={4}
        className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-blue-500"
        placeholder="Ex: Je viens de publier un article sur Kubernetes..."
      />
      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="post-image-url">
        Image optionnelle
        <input
          id="post-image-url"
          type="url"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-blue-500"
          placeholder="https://example.com/image.png"
        />
      </label>
      {imageUrl && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Aperçu" className="max-h-72 w-full object-cover" />
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Publication...' : 'Publier'}
        </button>
      </div>
    </form>
  );
}
