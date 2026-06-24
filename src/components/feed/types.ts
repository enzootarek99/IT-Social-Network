import type { AuthUser } from '@/contexts';

export type FeedPost = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: AuthUser;
  _count: {
    comments: number;
    likes: number;
  };
};
