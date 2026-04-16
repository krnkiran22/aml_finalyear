'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { RiskScoreGauge } from '@/components/scoring/RiskScoreGauge';
import { ScoreBreakdownCard } from '@/components/scoring/ScoreBreakdownCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { formatDate, getScoreColor } from '@/lib/utils';
import { RiskLevel } from '@/lib/shared';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

interface RiskScoreData {
  composite: number;
  score1Country: number;
  score2Transaction: number;
  score3Behaviour: number;
  riskLevel: RiskLevel;
  calculatedAt: string | null;
  history: { id: string; compositeScore: number; riskLevel: RiskLevel; calculatedAt: string }[];
}

const FAQs = [
  {
    question: 'What is the Country & Identity Risk score?',
    answer: 'This score (0–100) is based on your country\'s FATF compliance status and the confidence level of your KYC verification. High-risk countries or low-quality document scans will increase this score.',
  },
  {
    question: 'What is the Transactional Risk score?',
    answer: 'This score compares your transaction amount against your declared income threshold. Transactions exceeding your monthly threshold, or high transaction velocity (many transactions in 24h) will increase this score.',
  },
  {
    question: 'What is the Behavioural Risk score?',
    answer: 'Analysed from your last 90 days of on-chain activity. Factors include wallet age, number of unique counterparties, large transaction frequency, round number patterns, and off-hours transactions.',
  },
  {
    question: 'How is the composite score calculated?',
    answer: 'Composite = ((Score1 + Score2 + Score3) / 3) × 10. The result is a number from 0–1000 mapped to SAFE (0–299), LOW_RISK (300–499), FLAGGED (500–749), or HIGH_RISK (750–1000).',
  },
];

export default function RiskScorePage() {
  const { token } = useAuthStore();
  const [data, setData] = useState<RiskScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const res = await api.get<RiskScoreData>('/user/me/risk-score', token);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const chartData = data?.history
    .slice()
    .reverse()
    .map((h) => ({
      date: new Date(h.calculatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.compositeScore,
    })) ?? [];

  return (
    <div className="page-transition">
      <PageHeader title="Risk Score" subtitle="Your current AML risk assessment and history" />

      <div className="grid grid-cols-12 gap-6">
        {/* Gauge */}
        <motion.div
          className="col-span-4 card flex flex-col items-center py-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <RiskScoreGauge score={data?.composite ?? 0} riskLevel={data?.riskLevel} size={200} />
          {data?.calculatedAt && (
            <p className="text-xs text-text-disabled mt-4">Updated {formatDate(data.calculatedAt)}</p>
          )}
        </motion.div>

        {/* Chart */}
        <motion.div
          className="col-span-8 card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <h2 className="font-medium text-text-primary mb-6">Score History (last 30 calculations)</h2>
          {chartData.length < 2 ? (
            <div className="flex items-center justify-center h-40 text-text-tertiary text-sm">
              Not enough history yet. Scores are updated every 24 hours.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#636366', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 1000]}
                  tick={{ fill: '#636366', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1c1c1e',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    color: '#f5f5f7',
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#0071e3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0071e3' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Score breakdown */}
        <div className="col-span-12 grid grid-cols-3 gap-4">
          <ScoreBreakdownCard
            label="Country & Identity Risk"
            score={data?.score1Country ?? 0}
            description="FATF country classification + KYC confidence penalty"
            delay={0.1}
          />
          <ScoreBreakdownCard
            label="Transactional Risk"
            score={data?.score2Transaction ?? 0}
            description="Transaction vs income threshold + velocity analysis"
            delay={0.15}
          />
          <ScoreBreakdownCard
            label="Behavioural Risk"
            score={data?.score3Behaviour ?? 0}
            description="90-day on-chain behavioural pattern analysis"
            delay={0.2}
          />
        </div>

        {/* FAQ */}
        <motion.div
          className="col-span-12 card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-medium text-text-primary mb-5">What affects my score?</h2>
          <div className="space-y-2">
            {FAQs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                >
                  <span className="text-sm font-medium text-text-primary">{faq.question}</span>
                  <ChevronDown
                    size={16}
                    color="#636366"
                    style={{ transform: openFAQ === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  />
                </button>
                {openFAQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-5 pb-4 text-sm text-text-secondary leading-relaxed"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
