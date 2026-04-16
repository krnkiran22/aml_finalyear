'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { truncateAddress, formatCurrency, formatDate } from '@/lib/utils';
import { RiskLevel } from '@/lib/shared';

interface AdminTransaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amountETH: number;
  amountUSD: number;
  compositeScore: number;
  riskLevel: RiskLevel;
  status: string;
  flagReason: string | null;
  timestamp: string;
  user: { walletAddress: string; fullName: string | null };
}

export default function AdminTransactionsPage() {
  const { token } = useAuthStore();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('FLAGGED');

  useEffect(() => {
    async function load() {
      if (!token) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '50' });
        if (riskFilter) params.set('riskLevel', riskFilter);
        const data = await api.get<{ transactions: AdminTransaction[]; total: number }>(
          `/admin/transactions?${params}`,
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
  }, [token, riskFilter]);

  return (
    <div className="page-transition">
      <PageHeader title="Flagged Transactions" subtitle={`${total} results`} />

      <div className="flex gap-2 mb-6">
        {(['FLAGGED', 'HIGH_RISK', ''] as const).map((f) => (
          <button
            key={f}
            onClick={() => setRiskFilter(f)}
            className="text-sm px-4 py-2 rounded-full transition-all"
            style={{
              background: riskFilter === f ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.06)',
              color: riskFilter === f ? '#0071e3' : '#a1a1a6',
            }}
          >
            {f || 'All'}
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
                {['User', 'Amount', 'From → To', 'Score', 'Risk', 'Status', 'Flag Reason', 'Date'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-text-tertiary text-sm">
                    No flagged transactions
                  </td>
                </tr>
              )}
              {transactions.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <td className="px-5 py-4 font-mono text-xs text-text-secondary">
                    {tx.user.fullName || truncateAddress(tx.user.walletAddress)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-text-primary">{tx.amountETH.toFixed(4)} ETH</p>
                    <p className="text-xs text-text-tertiary">{formatCurrency(tx.amountUSD)}</p>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-text-tertiary">
                    {truncateAddress(tx.fromAddress)} → {truncateAddress(tx.toAddress)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-text-primary">{tx.compositeScore}</td>
                  <td className="px-5 py-4"><TransactionRiskBadge riskLevel={tx.riskLevel} size="sm" /></td>
                  <td className="px-5 py-4 text-xs text-text-secondary">{tx.status}</td>
                  <td className="px-5 py-4 text-xs text-text-tertiary max-w-xs truncate">{tx.flagReason ?? '—'}</td>
                  <td className="px-5 py-4 text-xs text-text-tertiary">{formatDate(tx.timestamp)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
