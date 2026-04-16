'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { AdminStats } from '@/lib/shared';
import { Users, CheckCircle, Clock, AlertTriangle, XCircle, BarChart3, ArrowLeftRight } from 'lucide-react';

const STAT_CARDS = (stats: AdminStats) => [
  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: '#0071e3' },
  { label: 'KYC Verified', value: stats.verifiedUsers, icon: CheckCircle, color: '#30d158' },
  { label: 'Pending KYC', value: stats.pendingKYC, icon: Clock, color: '#ffd60a' },
  { label: 'Flagged Transactions', value: stats.flaggedTransactions, icon: AlertTriangle, color: '#ff9f0a' },
  { label: 'Blocked Transactions', value: stats.blockedTransactions, icon: XCircle, color: '#ff453a' },
  { label: 'Total Transactions', value: stats.totalTransactions, icon: ArrowLeftRight, color: '#636366' },
  { label: 'Avg Risk Score', value: Math.round(stats.avgRiskScore), icon: BarChart3, color: '#bf5af2' },
];

export default function AdminPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await api.get<AdminStats>('/admin/stats', token);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!stats) return null;

  const cards = STAT_CARDS(stats);

  return (
    <div className="page-transition">
      <PageHeader title="Admin Overview" subtitle="Platform-wide compliance statistics" />

      <div className="grid grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className="card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}15` }}
                >
                  <Icon size={17} color={card.color} />
                </div>
              </div>
              <div
                className="text-3xl font-bold mb-1 tabular-nums"
                style={{ color: card.color, letterSpacing: '-0.02em' }}
              >
                {card.value.toLocaleString()}
              </div>
              <div className="text-sm text-text-tertiary">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.a
          href="/admin/users"
          className="card cursor-pointer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="font-medium text-text-primary mb-1">User Management</h3>
          <p className="text-sm text-text-secondary">Review KYC submissions, approve or reject documents, and manage user access.</p>
        </motion.a>
        <motion.a
          href="/admin/transactions"
          className="card cursor-pointer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-medium text-text-primary mb-1">Transaction Review</h3>
          <p className="text-sm text-text-secondary">Review flagged and blocked transactions across all users.</p>
        </motion.a>
      </div>
    </div>
  );
}
