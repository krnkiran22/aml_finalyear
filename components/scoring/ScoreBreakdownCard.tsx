'use client';
import { motion } from 'framer-motion';

interface ScoreBreakdownCardProps {
  label: string;
  score: number;
  description: string;
  delay?: number;
}

export function ScoreBreakdownCard({
  label,
  score,
  description,
  delay = 0,
}: ScoreBreakdownCardProps) {
  const color =
    score >= 70 ? '#ff453a' : score >= 50 ? '#ff9f0a' : score >= 30 ? '#ffd60a' : '#30d158';

  return (
    <motion.div
      className="card flex flex-col gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <div className="flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="font-semibold tabular-nums" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-bg-elevated overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.1 }}
        />
      </div>
      <p className="text-sm text-text-tertiary">{description}</p>
    </motion.div>
  );
}
