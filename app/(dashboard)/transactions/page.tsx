'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { truncateAddress, formatCurrency, formatINR, USD_TO_INR, formatDate } from '@/lib/utils';
import { TransactionPublic, RiskLevel } from '@/lib/shared';
import { ChevronDown, ChevronRight, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';

const RISK_FILTERS: { label: string; value: RiskLevel | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Safe', value: 'SAFE' },
  { label: 'Low Risk', value: 'LOW_RISK' },
  { label: 'Flagged', value: 'FLAGGED' },
  { label: 'High Risk', value: 'HIGH_RISK' },
];

type FiatCurrency = 'USD' | 'INR';

function FiatAmount({ usd, currency }: { usd: number; currency: FiatCurrency }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={currency}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        className="text-xs text-text-tertiary block"
      >
        {currency === 'USD' ? formatCurrency(usd) : formatINR(usd)}
      </motion.span>
    </AnimatePresence>
  );
}

export default function TransactionsPage() {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<TransactionPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currency, setCurrency] = useState<FiatCurrency>('USD');

  useEffect(() => {
    async function load() {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        setError(null);
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (riskFilter) params.set('riskLevel', riskFilter);
        const data = await api.get<{ transactions: TransactionPublic[]; total: number }>(
          `/transactions?${params}`,
          token,
        );
        setTransactions(data.transactions);
        setTotal(data.total);
      } catch (err) {
        console.error('Transactions load error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, page, riskFilter]);

  const totalPages = Math.ceil(total / 20);

  if (!token) {
    return (
      <div className="page-transition">
        <PageHeader title="Transactions" subtitle="Connect your wallet to view live transaction data" />
        <div className="card text-center py-16">
          <p className="text-text-primary font-medium mb-2">Wallet connection required</p>
          <p className="text-text-tertiary text-sm">
            Simulated transaction history has been removed. Connect to load live production data.
          </p>
          <Link href="/connect" className="btn-primary inline-flex mt-6">
            Connect Wallet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition">
      <PageHeader
        title="Transactions"
        subtitle={`${total} total transactions`}
      />

      {error && (
        <div
          className="rounded-2xl px-5 py-3 mb-6 text-sm"
          style={{ background: 'rgba(255,69,58,0.08)', border: '1px solid rgba(255,69,58,0.25)', color: '#ff453a' }}
        >
          {error}
        </div>
      )}

      {/* Filters row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {RISK_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setRiskFilter(f.value); setPage(1); }}
              className="text-sm px-4 py-2 rounded-full transition-all"
              style={{
                background: riskFilter === f.value ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.06)',
                color: riskFilter === f.value ? '#0071e3' : '#a1a1a6',
                border: riskFilter === f.value ? '1px solid rgba(0,113,227,0.3)' : '1px solid transparent',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Currency toggle */}
        <div
          className="flex items-center rounded-xl p-1 gap-1"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <ArrowLeftRight size={12} color="#636366" className="mx-1" />
          {(['USD', 'INR'] as FiatCurrency[]).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
              style={{
                background: currency === c ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: currency === c ? '#ffffff' : '#636366',
              }}
            >
              {c === 'USD' ? '$ USD' : '₹ INR'}
            </button>
          ))}
          {currency === 'INR' && (
            <span className="text-xs text-text-disabled ml-1 mr-1.5">
              1$ = ₹{USD_TO_INR}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', `Amount (ETH / ${currency})`, 'To Address', 'Score', 'Risk Level', 'Status', ''].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-text-tertiary text-sm">
                    No transactions found
                  </td>
                </tr>
              )}
              {transactions.map((tx, i) => (
                  <>
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setExpanded(expanded === tx.id ? null : tx.id)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="px-5 py-4 text-sm text-text-tertiary whitespace-nowrap">{formatDate(tx.timestamp)}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-text-primary font-medium">{tx.amountETH.toFixed(4)} ETH</p>
                        <FiatAmount usd={tx.amountUSD} currency={currency} />
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-text-secondary">{truncateAddress(tx.toAddress)}</td>
                      <td className="px-5 py-4 text-sm text-text-primary font-medium">{tx.compositeScore}</td>
                      <td className="px-5 py-4"><TransactionRiskBadge riskLevel={tx.riskLevel} size="sm" /></td>
                      <td className="px-5 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                      <td className="px-5 py-4">
                        {expanded === tx.id ? <ChevronDown size={14} color="#636366" /> : <ChevronRight size={14} color="#636366" />}
                      </td>
                    </motion.tr>
                    {expanded === tx.id && (
                      <tr key={`${tx.id}-expanded`}>
                        <td colSpan={7} className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Country Risk Score</p>
                              <p className="text-sm text-text-primary">{tx.score1Country}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Transactional Risk Score</p>
                              <p className="text-sm text-text-primary">{tx.score2Transaction}/100</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Behavioural Risk Score</p>
                              <p className="text-sm text-text-primary">{tx.score3Behaviour}/100</p>
                            </div>
                            {/* Fiat breakdown */}
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Value (USD)</p>
                              <p className="text-sm text-text-primary">{formatCurrency(tx.amountUSD)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">Value (INR)</p>
                              <p className="text-sm text-text-primary">{formatINR(tx.amountUSD)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-text-tertiary mb-1">On-chain Logged</p>
                              <p className="text-sm" style={{ color: tx.onChainLogged ? '#30d158' : '#636366' }}>
                                {tx.onChainLogged ? 'Yes' : 'No'}
                              </p>
                            </div>
                            {tx.flagReason && (
                              <div className="col-span-3">
                                <p className="text-xs text-text-tertiary mb-1">Flag Reason</p>
                                <p className="text-sm" style={{ color: '#ff9f0a' }}>{tx.flagReason}</p>
                              </div>
                            )}
                            {tx.txHash && (
                              <div className="col-span-3">
                                <p className="text-xs text-text-tertiary mb-1">Transaction Hash</p>
                                <a
                                  href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/tx/${tx.txHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs text-apple-blue hover:underline"
                                >
                                  {tx.txHash}
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-text-tertiary">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1a6' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="text-sm px-4 py-2 rounded-xl transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#a1a1a6' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    APPROVED:   { color: '#30d158', bg: 'rgba(48,209,88,0.12)' },
    MONITORING: { color: '#ffd60a', bg: 'rgba(255,214,10,0.12)' },
    HELD:       { color: '#ff9f0a', bg: 'rgba(255,159,10,0.12)' },
    BLOCKED:    { color: '#ff453a', bg: 'rgba(255,69,58,0.12)' },
  };
  const s = map[status] ?? { color: '#636366', bg: 'rgba(255,255,255,0.06)' };
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{ color: s.color, background: s.bg }}
    >
      {status}
    </span>
  );
}
