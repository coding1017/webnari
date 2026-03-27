'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const ADMIN_PASS = 'bcs2026';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { href: '/admin/products', label: 'Products', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  { href: '/admin/inventory', label: 'Inventory', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></svg> },
  { href: '/admin/orders', label: 'Orders', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const stored = sessionStorage.getItem('bcs_admin');
    if (stored === 'true') setAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      sessionStorage.setItem('bcs_admin', 'true');
      setAuthenticated(true);
    } else {
      setError(true);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-bcs-surface rounded-xl border border-bcs-border p-8 w-full max-w-sm">
          <h1 className="font-[family-name:var(--font-barlow-condensed)] text-2xl font-bold uppercase text-center mb-6">
            Admin <span className="text-bcs-teal">Login</span>
          </h1>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            className={cn(
              'w-full px-4 py-3 bg-bcs-dark border rounded-lg text-sm text-bcs-white placeholder:text-bcs-muted focus:outline-none mb-4',
              error ? 'border-bcs-red' : 'border-bcs-border focus:border-bcs-teal'
            )}
          />
          {error && <p className="text-xs text-bcs-red mb-3">Invalid password</p>}
          <button
            type="submit"
            className="w-full py-3 bg-bcs-teal text-bcs-black font-bold uppercase rounded-lg hover:bg-bcs-teal2 transition-colors font-[family-name:var(--font-barlow-condensed)]"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className={cn(
        'w-56 bg-bcs-dark border-r border-bcs-border flex-shrink-0 p-4 space-y-1',
        'max-md:fixed max-md:inset-y-16 max-md:left-0 max-md:z-30 max-md:w-56',
        sidebarOpen ? 'max-md:block' : 'max-md:hidden',
        'md:block'
      )}>
        <div className="mb-4 px-3">
          <p className="text-xs font-bold uppercase tracking-wider text-bcs-muted">Admin Panel</p>
        </div>
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
              pathname === item.href
                ? 'bg-bcs-teal/10 text-bcs-teal'
                : 'text-bcs-text hover:text-bcs-white hover:bg-bcs-surface'
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-bcs-border">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bcs-text hover:text-bcs-white hover:bg-bcs-surface transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            View Store
          </Link>
          <button
            onClick={() => { sessionStorage.removeItem('bcs_admin'); setAuthenticated(false); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-bcs-text hover:text-bcs-red hover:bg-bcs-surface transition-colors w-full"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-12 h-12 bg-bcs-teal text-bcs-black rounded-full flex items-center justify-center shadow-lg"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
