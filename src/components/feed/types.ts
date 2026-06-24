import type { AuthUser } from '@/contexts';

export type FeedPost = {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  author: AuthUser;
  comments: FeedComment[];
  _count: {
    comments: number;
    likes: number;
  };
};

export type FeedComment = {
  id: string;
  content: string;
  createdAt: string;
  author: AuthUser;
};
