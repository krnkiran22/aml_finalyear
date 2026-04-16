'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DollarSign, ArrowRight, Info } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { SUPPORTED_CURRENCIES } from '@/lib/shared';
import { formatCurrency } from '@/lib/utils';

export default function IncomePage() {
  const router = useRouter();
  const { token, updateUser } = useAuthStore();
  const [income, setIncome] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ annualIncomeUSD: number; monthlyThreshold: number } | null>(null);

  const numericIncome = parseFloat(income.replace(/,/g, '')) || 0;
  const previewThreshold = numericIncome > 0
    ? (numericIncome * (1 / (Object.entries(SUPPORTED_CURRENCIES).find(([k]) => k === currency) ? 1 : 1)) / 12) * 1.5
    : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!numericIncome) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<{ annualIncomeUSD: number; monthlyThreshold: number }>(
        '/onboarding/income',
        { annualIncome: numericIncome, currency },
        token ?? undefined,
      );
      setResult(res);
      updateUser({ monthlyThreshold: res.monthlyThreshold });
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save income');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16" style={{ background: '#000' }}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-8" style={{ background: 'rgba(48,209,88,0.12)' }}>
          <DollarSign size={24} color="#30d158" />
        </div>

        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <h2 className="font-semibold text-text-primary mb-3" style={{ fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
              Income recorded
            </h2>
            <p className="text-text-secondary mb-6">Your monthly transaction threshold has been calculated.</p>
            <div className="card mb-6">
              <div className="text-sm text-text-tertiary mb-1">Monthly transaction threshold</div>
              <div className="text-3xl font-bold text-apple-green" style={{ letterSpacing: '-0.02em' }}>
                {formatCurrency(result.monthlyThreshold)}
              </div>
              <div className="text-xs text-text-tertiary mt-1">
                Based on {formatCurrency(result.annualIncomeUSD)} annual income × 1.5/12
              </div>
            </div>
            <p className="text-text-tertiary text-sm">Taking you to your dashboard…</p>
          </motion.div>
        ) : (
          <>
            <h1 className="font-semibold text-text-primary mb-2" style={{ fontSize: '1.75rem', letterSpacing: '-0.02em' }}>
              Declare your income
            </h1>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
              Your annual income is used to calculate your monthly transaction risk threshold. This information is stored securely and never shared.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label block mb-2">Annual income</label>
                <div className="flex gap-2">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input-field w-24"
                    style={{ flexShrink: 0 }}
                  >
                    {Object.keys(SUPPORTED_CURRENCIES).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="e.g. 800,000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    required
                  />
                </div>
              </div>

              {numericIncome > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ background: 'rgba(0,113,227,0.08)', border: '1px solid rgba(0,113,227,0.15)' }}
                >
                  <Info size={16} color="#0071e3" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text-secondary">
                      Based on your income, transactions above{' '}
                      <strong className="text-text-primary">
                        {formatCurrency((numericIncome / 12) * 1.5)} USD/month
                      </strong>{' '}
                      will trigger risk assessment.
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex items-start gap-2 text-xs text-text-tertiary">
                <Info size={12} className="mt-0.5 flex-shrink-0" />
                <span>This is used only to calculate your transaction risk profile. We never store or share your exact income amount with third parties.</span>
              </div>

              {error && <p className="text-sm" style={{ color: '#ff453a' }}>{error}</p>}

              <button
                type="submit"
                disabled={!numericIncome || loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <LoadingSpinner size="sm" /> : <ArrowRight size={16} />}
                {loading ? 'Saving…' : 'Save & Continue'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
