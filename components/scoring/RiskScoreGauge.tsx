'use client';
import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getScoreColor } from '@/lib/utils';
import { RiskLevel } from '@/lib/shared';

interface RiskScoreGaugeProps {
  score: number;
  riskLevel?: RiskLevel;
  size?: number;
}

function getRiskLabel(level: RiskLevel | undefined, score: number): string {
  if (!level) {
    if (score >= 750) return 'HIGH RISK';
    if (score >= 500) return 'FLAGGED';
    if (score >= 300) return 'LOW RISK';
    return 'SAFE';
  }
  switch (level) {
    case 'SAFE': return 'SAFE';
    case 'LOW_RISK': return 'LOW RISK';
    case 'FLAGGED': return 'FLAGGED';
    case 'HIGH_RISK': return 'HIGH RISK';
  }
}

export function RiskScoreGauge({ score, riskLevel, size = 240 }: RiskScoreGaugeProps) {
  const center = size / 2;
  const radius = (size / 2) - 20;
  const strokeWidth = 14;
  // 270° sweep arc
  const sweepAngle = 270;
  const startAngle = 135;
  const circumference = (sweepAngle / 360) * (2 * Math.PI * radius);

  const color = getScoreColor(score);
  const label = getRiskLabel(riskLevel, score);

  const scoreMotion = useMotionValue(0);
  const displayScore = useRef(0);

  // Animate the arc
  const progress = useTransform(scoreMotion, [0, 1000], [0, circumference]);

  useEffect(() => {
    const controls = animate(scoreMotion, score, {
      duration: 0.8,
      ease: 'easeOut',
      onUpdate: (v) => {
        displayScore.current = Math.round(v);
      },
    });
    return controls.stop;
  }, [score, scoreMotion]);

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArc = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  const bgPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {/* Background arc */}
          <path
            d={bgPath}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground arc — animated */}
          <motion.path
            d={bgPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 1000) * circumference }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-bold tabular-nums"
            style={{ fontSize: size * 0.18, color, letterSpacing: '-0.03em' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {score}
          </motion.span>
          <span
            className="text-xs font-medium tracking-widest mt-1"
            style={{ color, opacity: 0.8 }}
          >
            {label}
          </span>
          <span className="text-xs text-text-tertiary mt-0.5">out of 1000</span>
        </div>
      </div>
    </div>
  );
}
