'use client';
import { useConnect, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { truncateAddress } from '@/lib/utils';
import { JWT_SIGN_MESSAGE_PREFIX } from '@/lib/shared';
import { UserPublic } from '@/lib/shared';

export function WalletConnectButton() {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { setAuth, user, clearAuth } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    setLoading(true);
    setError(null);
    try {
      connect({ connector: metaMask() });
    } catch (err) {
      setError('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const message = `${JWT_SIGN_MESSAGE_PREFIX}${Date.now()}`;
      const signature = await signMessageAsync({ message });

      const res = await api.post<{ token: string; user: UserPublic; isNewUser: boolean }>(
        '/auth/connect-wallet',
        { walletAddress: address, signature, message },
      );

      setAuth(res.token, res.user);
      localStorage.setItem('cg_token', res.token);

      if (res.user.kycStatus === 'PENDING' || res.isNewUser) {
        router.push('/kyc');
      } else if (!res.user.monthlyThreshold) {
        router.push('/income');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    disconnect();
    clearAuth();
    localStorage.removeItem('cg_token');
    router.push('/');
  }

  if (user && isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-text-secondary bg-bg-elevated px-3 py-2 rounded-lg border border-border-default">
          {truncateAddress(address ?? '')}
        </span>
        <button onClick={handleDisconnect} className="btn-secondary text-sm py-2 px-4">
          Disconnect
        </button>
      </div>
    );
  }

  if (isConnected && address && !user) {
    return (
      <div className="flex flex-col items-center gap-3">
        <span className="font-mono text-sm text-text-secondary">
          {truncateAddress(address)}
        </span>
        <button onClick={handleSignIn} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <LoadingSpinner size="sm" />}
          Sign In to ChainGuard
        </button>
        {error && <p className="text-sm" style={{ color: '#ff453a' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button onClick={handleConnect} disabled={loading} className="btn-primary flex items-center gap-2">
        {loading ? <LoadingSpinner size="sm" /> : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 8.5H4.5A2.5 2.5 0 0 0 2 11v8a2.5 2.5 0 0 0 2.5 2.5h15A2.5 2.5 0 0 0 22 19v-8a2.5 2.5 0 0 0-2.5-2.5ZM20 11v1.5h-3a2 2 0 0 0 0 4h3V19a.5.5 0 0 1-.5.5h-15A.5.5 0 0 1 4 19v-8a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 .5.5ZM17 15a.5.5 0 1 1 0 1 .5.5 0 0 1 0-1Z"/>
            <path d="M17.5 4.5h-12a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2Z"/>
          </svg>
        )}
        Connect MetaMask
      </button>
      {error && <p className="text-sm" style={{ color: '#ff453a' }}>{error}</p>}
    </div>
  );
}
