'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { RiskScoreGauge } from '@/components/scoring/RiskScoreGauge';
import { ScoreBreakdownCard } from '@/components/scoring/ScoreBreakdownCard';
import { TransactionRiskBadge } from '@/components/transactions/TransactionRiskBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { truncateAddress, formatCurrency, formatDate } from '@/lib/utils';
import { Bell, ArrowLeftRight, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { RiskScoreHistoryPublic, TransactionPublic, AlertPublic } from '@/lib/shared';
import Link from 'next/link';
import { WalletLookupCard } from '@/components/dashboard/WalletLookupCard';

interface RiskScoreData {
  composite: number;
  score1Country: number;
  score2Transaction: number;
  score3Behaviour: number;
  riskLevel: string;
  calculatedAt: string | null;
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [riskScore, setRiskScore] = useState<RiskScoreData | null>(null);
  const [transactions, setTransactions] = useState<TransactionPublic[]>([]);
  const [alerts, setAlerts] = useState<AlertPublic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const [scoreData, txData, alertData] = await Promise.all([
          api.get<RiskScoreData>('/user/me/risk-score', token),
          api.get<{ transactions: TransactionPublic[] }>('/transactions?limit=5', token),
          api.get<{ alerts: AlertPublic[]; unreadCount: number }>('/alerts', token),
        ]);
        setRiskScore(scoreData);
        setTransactions(txData.transactions);
        setAlerts(alertData.alerts.filter((a) => !a.resolved).slice(0, 3));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const kycStatusIcon = {
    VERIFIED: <CheckCircle size={14} color="#30d158" />,
    PENDING: <Clock size={14} color="#ffd60a" />,
    UNDER_REVIEW: <Clock size={14} color="#ff9f0a" />,
    REJECTED: <XCircle size={14} color="#ff453a" />,
  }[user?.kycStatus ?? 'PENDING'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="page-transition">
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${truncateAddress(user?.walletAddress ?? '')}`}
      />

      {/* Top info strip */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2 text-sm">
          {kycStatusIcon}
          <span className="text-text-secondary">KYC {user?.kycStatus}</span>
        </div>
        {user?.monthlyThreshold && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span className="w-1 h-1 rounded-full bg-text-disabled" />
            Monthly threshold: <strong className="text-text-primary">{formatCurrency(user.monthlyThreshold)}</strong>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Risk gauge */}
        <motion.div
          className="col-span-4 card flex flex-col items-center py-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-sm text-text-tertiary mb-6 font-medium uppercase tracking-wider">Composite Risk Score</p>
          <RiskScoreGauge score={riskScore?.composite ?? 0} riskLevel={riskScore?.riskLevel as any} size={200} />
          {riskScore?.calculatedAt && (
            <p className="text-xs text-text-disabled mt-4">
              Last updated {formatDate(riskScore.calculatedAt)}
            </p>
          )}
        </motion.div>

        {/* Score breakdown */}
        <div className="col-span-8 grid grid-rows-3 gap-4">
          <ScoreBreakdownCard
            label="Country & Identity Risk"
            score={riskScore?.score1Country ?? 0}
            description="Based on FATF country risk classification and KYC document confidence."
            delay={0.1}
          />
          <ScoreBreakdownCard
            label="Transactional Risk"
            score={riskScore?.score2Transaction ?? 0}
            description="Compares transaction amounts against your declared income threshold."
            delay={0.15}
          />
          <ScoreBreakdownCard
            label="Behavioural Risk"
            score={riskScore?.score3Behaviour ?? 0}
            description="Analyses 90-day on-chain activity patterns for anomalies."
            delay={0.2}
          />
        </div>

        {/* Recent transactions */}
        <motion.div
          className="col-span-8 card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <ArrowLeftRight size={16} color="#636366" />
              <h2 className="font-medium text-text-primary">Recent Transactions</h2>
            </div>
            <Link href="/transactions" className="text-sm text-apple-blue hover:underline">View all</Link>
          </div>
          {transactions.length === 0 ? (
            <p className="text-text-tertiary text-sm py-8 text-center">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  <div>
                    <p className="font-mono text-xs text-text-secondary">{truncateAddress(tx.toAddress)}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-primary font-medium">{tx.amountETH.toFixed(4)} ETH</p>
                    <p className="text-xs text-text-tertiary">{formatCurrency(tx.amountUSD)}</p>
                  </div>
                  <TransactionRiskBadge riskLevel={tx.riskLevel} size="sm" />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Alerts */}
        <motion.div
          className="col-span-4 card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bell size={16} color="#636366" />
              <h2 className="font-medium text-text-primary">Active Alerts</h2>
            </div>
            <Link href="/alerts" className="text-sm text-apple-blue hover:underline">View all</Link>
          </div>
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle size={28} color="#30d158" className="mx-auto mb-2" />
              <p className="text-text-tertiary text-sm">No active alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => {
                const sev = alert.severity === 'CRITICAL' ? '#ff453a' : alert.severity === 'WARNING' ? '#ff9f0a' : '#0071e3';
                return (
                  <div
                    key={alert.id}
                    className="rounded-xl p-3"
                    style={{ background: `${sev}0f`, border: `1px solid ${sev}22` }}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={13} color={sev} className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-text-secondary leading-relaxed">{alert.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Wallet Risk Lookup */}
        <WalletLookupCard />
      </div>
    </div>
  );
}
