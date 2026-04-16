'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  BarChart3,
  Bell,
  Shield,
  Users,
  AlertTriangle,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { truncateAddress } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useDisconnect } from 'wagmi';
import { cn } from '@/lib/utils';

const userNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { label: 'Risk Score', href: '/risk-score', icon: BarChart3 },
  { label: 'Alerts', href: '/alerts', icon: Bell },
];

const adminNav = [
  { label: 'Admin Overview', href: '/admin', icon: Shield },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Transactions', href: '/admin/transactions', icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  function handleSignOut() {
    disconnect();
    clearAuth();
    localStorage.removeItem('cg_token');
    router.push('/');
  }

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col"
      style={{
        width: 240,
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,113,227,0.2)' }}
          >
            <Shield size={16} color="#0071e3" />
          </div>
          <div>
            <span className="font-semibold text-text-primary text-sm">ChainGuard</span>
            <span className="block text-xs text-text-tertiary" style={{ marginTop: -2 }}>AML</span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {userNav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-11 rounded-[10px] text-sm font-medium transition-colors',
                active
                  ? 'text-apple-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
              )}
              style={active ? { background: 'rgba(0,113,227,0.12)' } : {}}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}

        {user?.isAdmin && (
          <>
            <div
              className="mt-4 mb-2 px-3 text-xs font-medium text-text-disabled uppercase tracking-widest"
            >
              Admin
            </div>
            {adminNav.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 h-11 rounded-[10px] text-sm font-medium transition-colors',
                    active
                      ? 'text-apple-blue'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
                  )}
                  style={active ? { background: 'rgba(0,113,227,0.12)' } : {}}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Bottom — wallet + sign out */}
      <div className="px-3 pb-4 space-y-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }}>
        <div className="px-3 py-2">
          <p className="text-xs text-text-tertiary mb-0.5">Connected wallet</p>
          <p className="font-mono text-xs text-text-secondary truncate">
            {user?.walletAddress ?? '—'}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 h-11 rounded-[10px] text-sm font-medium text-text-secondary hover:text-apple-red hover:bg-bg-elevated w-full transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
