'use client';
import { motion } from 'framer-motion';

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  labels,
}: OnboardingProgressBarProps) {
  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, i) => {
          const done = i < currentStep - 1;
          const active = i === currentStep - 1;
          return (
            <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                style={{
                  background: done
                    ? '#0071e3'
                    : active
                    ? 'rgba(0,113,227,0.2)'
                    : 'rgba(255,255,255,0.06)',
                  border: active ? '1.5px solid #0071e3' : 'none',
                  color: done ? '#fff' : active ? '#0071e3' : '#636366',
                }}
              >
                {done ? '✓' : i + 1}
              </div>
              <span
                className="text-xs text-center"
                style={{ color: active ? '#f5f5f7' : '#636366' }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="w-full h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: '#0071e3' }}
          animate={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
