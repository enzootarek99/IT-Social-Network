'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts';

const links = [
  { href: '/', label: 'Feed' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/search', label: 'Recherche' },
  { href: '/network', label: 'Réseau' },
  { href: '/profile', label: 'Profil & CV' },
  { href: '/marketplace', label: 'Freelance' },
  { href: '/events', label: 'Événements' },
];

const adminLink = { href: '/admin', label: 'Admin' };

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUnreadCount() {
      if (!isAuthenticated) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch('/api/notifications', { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      setUnreadCount(data.unreadCount);
    }

    void loadUnreadCount();
  }, [isAuthenticated, pathname]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" onClick={closeMobileMenu} className="text-xl font-bold text-blue-700">
          IT Social Network
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {[...links, ...(user?.role === 'ADMIN' ? [adminLink] : [])].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname === link.href
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className={`relative rounded-full px-4 py-2 text-sm font-medium ${
                  pathname === '/notifications'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:text-blue-700'
                }`}
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/messages"
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  pathname === '/messages'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:text-blue-700'
                }`}
              >
                Messages
              </Link>
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-700"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-700"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Rejoindre
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 md:hidden"
          aria-expanded={isMobileMenuOpen}
          aria-label="Ouvrir le menu"
        >
          Menu
        </button>
      </nav>

      {isMobileMenuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-soft md:hidden">
          <div className="space-y-2">
            {[...links, ...(user?.role === 'ADMIN' ? [adminLink] : [])].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-slate-100 pt-4">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/notifications"
                  onClick={closeMobileMenu}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pathname === '/notifications'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-red-600 px-2 py-1 text-xs font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/messages"
                  onClick={closeMobileMenu}
                  className={`block rounded-2xl px-4 py-3 text-sm font-semibold ${
                    pathname === '/messages'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  Messages
                </Link>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Connecté: {user?.firstName} {user?.lastName}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Rejoindre
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
