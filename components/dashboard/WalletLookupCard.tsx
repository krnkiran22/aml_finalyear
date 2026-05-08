'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { truncateAddress, formatCurrency, formatDate } from '@/lib/utils';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { TransactionPublic } from '@/lib/shared';

interface LookupResult {
  walletAddress: string;
  isRegistered: boolean;
  composite: number;
  riskLevel: 'SAFE' | 'LOW_RISK' | 'FLAGGED' | 'HIGH_RISK';
  score1Country: number;
  score2Transaction: number;
  score3Behaviour: number;
  txCount: number;
  kycStatus: string | null;
  source: 'explorer';
  monthlyThreshold: number;
  thresholdSource: 'wallet-profile' | 'viewer-profile' | 'default';
  countryCode: string;
  countryName: string;
  countrySource: 'wallet-profile' | 'viewer-profile' | 'default';
  fatfStatus: string | null;
  recentTransactions: TransactionPublic[];
}

const SCORE_COLOR: Record<string, string> = {
  SAFE: '#30d158',
  LOW_RISK: '#ffd60a',
  FLAGGED: '#ff9f0a',
  HIGH_RISK: '#ff453a',
};

const SCORE_BG: Record<string, string> = {
  SAFE: '#30d15814',
  LOW_RISK: '#ffd60a14',
  FLAGGED: '#ff9f0a14',
  HIGH_RISK: '#ff453a14',
};

function ScoreBar({ value, max = 1000, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

function KycBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-text-disabled">Not registered</span>;
  const map: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    VERIFIED: { icon: <CheckCircle size={11} />, color: '#30d158', label: 'Verified' },
    PENDING: { icon: <Clock size={11} />, color: '#ffd60a', label: 'Pending' },
    UNDER_REVIEW: { icon: <Clock size={11} />, color: '#ff9f0a', label: 'Under Review' },
    REJECTED: { icon: <XCircle size={11} />, color: '#ff453a', label: 'Rejected' },
  };
  const entry = map[status] ?? map['PENDING'];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: entry.color }}>
      {entry.icon}
      KYC {entry.label}
    </span>
  );
}

interface WalletLookupCardProps {
  defaultAddress?: string;
}

export function WalletLookupCard({ defaultAddress }: WalletLookupCardProps) {
  const { token, user } = useAuthStore();
  const [input, setInput] = useState(defaultAddress ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(address: string) {
    const addr = address.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
      setError('Enter a valid 0x Ethereum address');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.get<LookupResult>(`/lookup/${addr}`, token ?? undefined);
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }

  const color = result ? (SCORE_COLOR[result.riskLevel] ?? '#636366') : '#636366';
  const bg = result ? (SCORE_BG[result.riskLevel] ?? 'transparent') : 'transparent';

  return (
    <motion.div
      className="col-span-12 card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Search size={16} color="#636366" />
          <h2 className="font-medium text-text-primary">Wallet Risk Lookup</h2>
        </div>
        <p className="text-xs text-text-disabled">Analyse any wallet using live explorer activity</p>
      </div>

      {/* Search input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup(input)}
            placeholder="0x... Ethereum wallet address"
            className="input-field w-full font-mono text-sm placeholder:text-text-disabled"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          />
        </div>
        {user?.walletAddress && (
          <button
            onClick={() => setInput(user.walletAddress)}
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1a6' }}
          >
            Use My Wallet
          </button>
        )}
        <button
          onClick={() => lookup(input)}
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-5 py-3 text-sm"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Search size={15} />}
          Analyse
        </button>
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: '#ff453a' }}>{error}</p>
      )}

      <p className="text-xs text-text-disabled mb-4">
        If the entered wallet is not registered in ChainGuard, the analysis uses your signed-in threshold and country profile as the reference context.
      </p>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.walletAddress}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-5"
            style={{ background: bg, border: `1px solid ${color}22` }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-mono text-sm text-text-secondary mb-1">
                  {truncateAddress(result.walletAddress)}
                </p>
                <div className="flex items-center gap-3">
                  <KycBadge status={result.kycStatus} />
                  <span className="text-xs text-text-disabled">{result.txCount} transactions analysed</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <TransactionRiskBadge riskLevel={result.riskLevel} size="md" />
                <span className="text-xs text-text-disabled">Live explorer data</span>
              </div>
            </div>

            {/* Composite score */}
            <div className="flex items-center gap-4 mb-5">
              <div
                className="flex items-center justify-center rounded-xl w-20 h-20 flex-shrink-0"
                style={{ background: `${color}18`, border: `2px solid ${color}44` }}
              >
                <div className="text-center">
                  <p className="font-bold text-xl leading-none" style={{ color }}>
                    {result.composite}
                  </p>
                  <p className="text-xs text-text-disabled mt-0.5">/ 1000</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-tertiary mb-3 font-medium uppercase tracking-wider">Score Breakdown</p>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Country & Identity</span>
                      <span className="text-text-secondary font-medium">{result.score1Country}</span>
                    </div>
                    <ScoreBar value={result.score1Country} max={100} color={color} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Transactional</span>
                      <span className="text-text-secondary font-medium">{result.score2Transaction}</span>
                    </div>
                    <ScoreBar value={result.score2Transaction} max={100} color={color} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Behavioural</span>
                      <span className="text-text-secondary font-medium">{result.score3Behaviour}</span>
                    </div>
                    <ScoreBar value={result.score3Behaviour} max={100} color={color} />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Threshold Reference</span>
                      <span className="text-text-secondary font-medium">{formatCurrency(result.monthlyThreshold)}</span>
                    </div>
                    <p className="text-xs text-text-disabled">
                      {result.thresholdSource === 'wallet-profile'
                        ? 'Taken from this wallet profile'
                        : result.thresholdSource === 'viewer-profile'
                          ? 'Taken from your signed-in profile'
                          : 'Using the default demo threshold'}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-tertiary">Country Risk Reference</span>
                      <span className="text-text-secondary font-medium">{result.countryName} ({result.countryCode})</span>
                    </div>
                    <p className="text-xs text-text-disabled">
                      {result.fatfStatus ? `${result.fatfStatus.replaceAll('_', ' ')} FATF status` : 'No FATF label available'}
                    </p>
                  </div>
                  {result.isRegistered && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-tertiary">Profile Match</span>
                        <span className="text-text-secondary font-medium">Registered ChainGuard wallet</span>
                      </div>
                      <p className="text-xs text-text-disabled">This address already has a ChainGuard user profile and KYC status.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-text-tertiary font-medium uppercase tracking-wider">Recent Wallet Activity</p>
                <span className="text-xs text-text-disabled">{result.recentTransactions.length} shown</span>
              </div>
              {result.recentTransactions.length === 0 ? (
                <p className="text-sm text-text-tertiary">
                  No explorer transactions were found for this wallet on the configured network yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {result.recentTransactions.slice(0, 3).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div>
                        <p className="font-mono text-xs text-text-secondary">{truncateAddress(tx.toAddress)}</p>
                        <p className="text-xs text-text-disabled">{formatDate(tx.timestamp)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-text-primary">{tx.amountETH.toFixed(4)} ETH</p>
                        <p className="text-xs text-text-disabled">{formatCurrency(tx.amountUSD)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
