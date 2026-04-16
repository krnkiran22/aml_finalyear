'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { truncateAddress, formatDate, formatCurrency } from '@/lib/utils';
import { UserAdmin, KYCStatus, RiskLevel } from '@/lib/shared';
import { X, CheckCircle, XCircle, Clock, User } from 'lucide-react';

const KYC_COLORS: Record<KYCStatus, string> = {
  VERIFIED: '#30d158',
  PENDING: '#ffd60a',
  UNDER_REVIEW: '#ff9f0a',
  REJECTED: '#ff453a',
};

export default function AdminUsersPage() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState<KYCStatus | ''>('');
  const [selectedUser, setSelectedUser] = useState<UserAdmin | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [reviewReason, setReviewReason] = useState('');

  async function load() {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (kycFilter) params.set('kycStatus', kycFilter);
      const data = await api.get<{ users: UserAdmin[]; total: number }>(
        `/admin/users?${params}`,
        token,
      );
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token, page, kycFilter]);

  async function handleKYCReview(userId: string, action: 'APPROVE' | 'REJECT') {
    setReviewing(true);
    try {
      await api.patch(`/admin/kyc/${userId}/review`, { action, reason: reviewReason || undefined }, token ?? undefined);
      setSelectedUser(null);
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="page-transition">
      <PageHeader title="Users" subtitle={`${total} registered users`} />

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          className="input-field max-w-xs"
          placeholder="Search wallet or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        {(['', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setKycFilter(s)}
            className="text-sm px-3 py-2 rounded-full transition-all"
            style={{
              background: kycFilter === s ? 'rgba(0,113,227,0.15)' : 'rgba(255,255,255,0.06)',
              color: kycFilter === s ? '#0071e3' : '#a1a1a6',
            }}
          >
            {s || 'All'}
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
                {['Wallet', 'Name', 'Country', 'KYC', 'Risk Score', 'Risk Level', 'Joined'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-text-tertiary uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-5 py-4 font-mono text-xs text-text-secondary">{truncateAddress(user.walletAddress)}</td>
                  <td className="px-5 py-4 text-sm text-text-primary">{user.fullName ?? '—'}</td>
                  <td className="px-5 py-4 text-sm text-text-secondary">{user.country ?? '—'}</td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ color: KYC_COLORS[user.kycStatus], background: `${KYC_COLORS[user.kycStatus]}15` }}
                    >
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-text-primary">{user.currentRiskScore ?? '—'}</td>
                  <td className="px-5 py-4">
                    {user.currentRiskLevel ? <TransactionRiskBadge riskLevel={user.currentRiskLevel} size="sm" /> : '—'}
                  </td>
                  <td className="px-5 py-4 text-xs text-text-tertiary">{formatDate(user.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              className="fixed right-0 top-0 h-screen z-50 overflow-y-auto"
              style={{
                width: 480,
                background: 'rgba(28,28,30,0.95)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(255,255,255,0.08)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-semibold text-text-primary">User Details</h2>
                  <button onClick={() => setSelectedUser(null)}>
                    <X size={20} color="#636366" />
                  </button>
                </div>

                <div className="space-y-5">
                  {[
                    { label: 'Wallet', value: selectedUser.walletAddress, mono: true },
                    { label: 'Full Name', value: selectedUser.fullName ?? 'Not set' },
                    { label: 'Country', value: selectedUser.country ?? 'Not set' },
                    { label: 'KYC Status', value: selectedUser.kycStatus },
                    { label: 'Document Type', value: selectedUser.kycDocumentType ?? 'Not uploaded' },
                    { label: 'Annual Income', value: selectedUser.annualIncomeUSD ? formatCurrency(selectedUser.annualIncomeUSD) : 'Not declared' },
                    { label: 'Monthly Threshold', value: selectedUser.monthlyThreshold ? formatCurrency(selectedUser.monthlyThreshold) : '—' },
                    { label: 'Risk Score', value: selectedUser.currentRiskScore?.toString() ?? '—' },
                    { label: 'Joined', value: formatDate(selectedUser.createdAt) },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="label">{label}</span>
                      <span className={`text-sm text-text-primary ${mono ? 'font-mono' : ''}`}>{value}</span>
                    </div>
                  ))}

                  {selectedUser.kycDocumentUrl && (
                    <div>
                      <span className="label mb-2 block">Document</span>
                      <a
                        href={selectedUser.kycDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-apple-blue hover:underline"
                      >
                        View uploaded document →
                      </a>
                    </div>
                  )}

                  {/* KYC Review */}
                  {selectedUser.kycStatus === 'UNDER_REVIEW' && (
                    <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <h3 className="font-medium text-text-primary mb-3">KYC Review</h3>
                      <textarea
                        className="input-field w-full mb-3 resize-none"
                        rows={3}
                        placeholder="Optional: rejection reason"
                        value={reviewReason}
                        onChange={(e) => setReviewReason(e.target.value)}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleKYCReview(selectedUser.id, 'APPROVE')}
                          disabled={reviewing}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-medium transition-colors"
                          style={{ background: 'rgba(48,209,88,0.15)', color: '#30d158' }}
                        >
                          <CheckCircle size={15} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleKYCReview(selectedUser.id, 'REJECT')}
                          disabled={reviewing}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-button text-sm font-medium transition-colors"
                          style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a' }}
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
