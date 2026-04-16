'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { truncateAddress, formatCurrency, formatDate } from '@/lib/utils';
import { TransactionPublic, RiskLevel } from '@/lib/shared';
import { ChevronDown, ChevronRight } from 'lucide-react';

const RISK_FILTERS: { label: string; value: RiskLevel | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Safe', value: 'SAFE' },
  { label: 'Low Risk', value: 'LOW_RISK' },
  { label: 'Flagged', value: 'FLAGGED' },
  { label: 'High Risk', value: 'HIGH_RISK' },
];

export default function TransactionsPage() {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<TransactionPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (riskFilter) params.set('riskLevel', riskFilter);
        const data = await api.get<{ transactions: TransactionPublic[]; total: number }>(
          `/transactions?${params}`,
          token,
        );
        setTransactions(data.transactions);
        setTotal(data.total);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, page, riskFilter]);

  return (
    <div className="page-transition">
      <PageHeader title="Transactions" subtitle={`${total} total transactions`} />

      {/* Filters */}
      <div className="flex gap-2 mb-6">
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

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Date', 'Amount', 'To Address', 'Score', 'Risk Level', 'Status', ''].map((h) => (
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
                    <td className="px-5 py-4 text-sm text-text-tertiary">{formatDate(tx.timestamp)}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-text-primary font-medium">{tx.amountETH.toFixed(4)} ETH</p>
                      <p className="text-xs text-text-tertiary">{formatCurrency(tx.amountUSD)}</p>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-text-secondary">{truncateAddress(tx.toAddress)}</td>
                    <td className="px-5 py-4 text-sm text-text-primary font-medium">{tx.compositeScore}</td>
                    <td className="px-5 py-4"><TransactionRiskBadge riskLevel={tx.riskLevel} size="sm" /></td>
                    <td className="px-5 py-4 text-sm text-text-secondary">{tx.status}</td>
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
      )}
    </div>
  );
}
