'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role?: string;
  adminRole?: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'SUPPORT' | null;
  firstName: string;
  lastName: string;
  title?: string | null;
  bio?: string | null;
  avatar?: string | null;
  company?: string | null;
  location?: string | null;
  website?: string | null;
  skills: string[];
  experience?: unknown;
  education?: unknown;
  portfolio?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseAuthResponse(response: Response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Authentication failed');
  }

  localStorage.setItem('user', JSON.stringify(data.user));

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data.user as AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { cache: 'no-store' });

      if (!response.ok) {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return;
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');

    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }

    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const authenticatedUser = await parseAuthResponse(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const authenticatedUser = await parseAuthResponse(response);
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [isLoading, login, logout, refreshUser, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
