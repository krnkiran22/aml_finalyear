'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { AlertPublic } from '@/lib/shared';
import { Bell, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const { token } = useAuthStore();
  const [alerts, setAlerts] = useState<AlertPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const data = await api.get<{ alerts: AlertPublic[] }>('/alerts', token);
        setAlerts(data.alerts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleResolve(id: string) {
    setResolving(id);
    try {
      await api.patch(`/alerts/${id}/resolve`, {}, token ?? undefined);
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(null);
    }
  }

  const severityConfig = {
    INFO: { icon: Info, color: '#0071e3', bg: 'rgba(0,113,227,0.08)' },
    WARNING: { icon: AlertTriangle, color: '#ff9f0a', bg: 'rgba(255,159,10,0.08)' },
    CRITICAL: { icon: XCircle, color: '#ff453a', bg: 'rgba(255,69,58,0.08)' },
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  return (
    <div className="page-transition max-w-2xl">
      <PageHeader
        title="Alerts"
        subtitle={`${activeAlerts.length} active · ${resolvedAlerts.length} resolved`}
      />

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : alerts.length === 0 ? (
        <div className="card text-center py-16">
          <Bell size={32} color="#3a3a3c" className="mx-auto mb-3" />
          <p className="text-text-tertiary">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {activeAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-3">Active</h2>
              <div className="space-y-3">
                {activeAlerts.map((alert, i) => {
                  const cfg = severityConfig[alert.severity];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card flex items-start gap-4"
                      style={{ background: cfg.bg, borderColor: `${cfg.color}22` }}
                    >
                      <Icon size={18} color={cfg.color} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary leading-relaxed">{alert.message}</p>
                        <p className="text-xs text-text-tertiary mt-1.5">{formatDate(alert.createdAt)}</p>
                      </div>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        disabled={resolving === alert.id}
                        className="text-xs text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                      >
                        {resolving === alert.id ? '...' : 'Resolve'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {resolvedAlerts.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-text-tertiary uppercase tracking-wider mb-3">Resolved</h2>
              <div className="space-y-3">
                {resolvedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="card flex items-start gap-4 opacity-50"
                  >
                    <CheckCircle size={18} color="#3a3a3c" className="mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-secondary leading-relaxed">{alert.message}</p>
                      <p className="text-xs text-text-disabled mt-1">{formatDate(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
