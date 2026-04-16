import { CheckCircle, Info, AlertTriangle, XCircle } from 'lucide-react';
import { RiskLevel } from '@/lib/shared';
import { getRiskColor, getRiskBg, getRiskLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TransactionRiskBadgeProps {
  riskLevel: RiskLevel;
  size?: 'sm' | 'md';
}

export function TransactionRiskBadge({ riskLevel, size = 'md' }: TransactionRiskBadgeProps) {
  const color = getRiskColor(riskLevel);
  const bg = getRiskBg(riskLevel);
  const label = getRiskLabel(riskLevel);

  const Icon = {
    SAFE: CheckCircle,
    LOW_RISK: Info,
    FLAGGED: AlertTriangle,
    HIGH_RISK: XCircle,
  }[riskLevel];

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-sm px-3 py-1 gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={cn('inline-flex items-center rounded-full font-medium', sizeClass)}
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={iconSize} />
      {label}
    </span>
  );
}
