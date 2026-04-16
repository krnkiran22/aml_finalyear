'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Database, Cpu, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { truncateAddress } from '@/lib/utils';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

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
  source: 'database' | 'simulation';
}

const PRESET_WALLETS = [
  { label: 'Vitalik.eth', address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  { label: 'High Risk Demo', address: '0xDead000000000000000042069420694206942069' },
  { label: 'Flagged Demo', address: '0xAbCdEf0123456789AbCdEf0123456789AbCdEf01' },
  { label: 'Safe Demo', address: '0x0000000000000000000000000000000000000001' },
];

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

export function WalletLookupCard() {
  const { token } = useAuthStore();
  const [input, setInput] = useState('');
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

  function handlePreset(address: string) {
    setInput(address);
    lookup(address);
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
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(0,113,227,0.12)', color: '#0071e3' }}
          >
            Demo Tool
          </span>
        </div>
        <p className="text-xs text-text-disabled">Check any wallet's AML risk score</p>
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
            className="w-full font-mono text-sm text-text-primary placeholder:text-text-disabled rounded-xl px-4 py-3 outline-none focus:ring-1"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              focusRingColor: '#0071e3',
            }}
          />
        </div>
        <button
          onClick={() => lookup(input)}
          disabled={loading}
          className="btn-primary flex items-center gap-2 px-5 py-3 text-sm"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Search size={15} />}
          Analyse
        </button>
      </div>

      {/* Preset quick-pick wallets */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PRESET_WALLETS.map((w) => (
          <button
            key={w.address}
            onClick={() => handlePreset(w.address)}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#aeaeb2',
            }}
          >
            <ChevronRight size={11} />
            {w.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm mb-4" style={{ color: '#ff453a' }}>{error}</p>
      )}

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
                  {result.txCount > 0 && (
                    <span className="text-xs text-text-disabled">{result.txCount} transactions</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <TransactionRiskBadge riskLevel={result.riskLevel} size="md" />
                <div className="flex items-center gap-1.5">
                  {result.source === 'database' ? (
                    <Database size={11} color="#30d158" />
                  ) : (
                    <Cpu size={11} color="#636366" />
                  )}
                  <span className="text-xs text-text-disabled">
                    {result.source === 'database' ? 'Live data' : 'Simulated'}
                  </span>
                </div>
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
                  {!result.isRegistered ? (
                    <>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-tertiary">Country & Identity</span>
                          <span className="text-text-secondary font-medium">{result.score1Country}</span>
                        </div>
                        <ScoreBar value={result.score1Country} max={350} color={color} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-tertiary">Transactional</span>
                          <span className="text-text-secondary font-medium">{result.score2Transaction}</span>
                        </div>
                        <ScoreBar value={result.score2Transaction} max={400} color={color} />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-tertiary">Behavioural</span>
                          <span className="text-text-secondary font-medium">{result.score3Behaviour}</span>
                        </div>
                        <ScoreBar value={result.score3Behaviour} max={250} color={color} />
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-text-tertiary">Composite Risk Score</span>
                        <span className="text-text-secondary font-medium">{result.composite} / 1000</span>
                      </div>
                      <ScoreBar value={result.composite} max={1000} color={color} />
                      <p className="text-xs text-text-disabled mt-2">
                        Full breakdown available in the registered user's profile
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result.source === 'simulation' && (
              <p className="text-xs text-text-disabled px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                This wallet is not registered on ChainGuard. Score is deterministically simulated from the wallet address — the same address always returns the same score.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
