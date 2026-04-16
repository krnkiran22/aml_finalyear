import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RiskLevel } from '@/lib/shared';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-4)}`;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getRiskColor(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE': return '#30d158';
    case 'LOW_RISK': return '#ffd60a';
    case 'FLAGGED': return '#ff9f0a';
    case 'HIGH_RISK': return '#ff453a';
  }
}

export function getRiskBg(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE': return 'rgba(48, 209, 88, 0.15)';
    case 'LOW_RISK': return 'rgba(255, 214, 10, 0.15)';
    case 'FLAGGED': return 'rgba(255, 159, 10, 0.15)';
    case 'HIGH_RISK': return 'rgba(255, 69, 58, 0.15)';
  }
}

export function getRiskLabel(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'SAFE': return 'Safe';
    case 'LOW_RISK': return 'Low Risk';
    case 'FLAGGED': return 'Flagged';
    case 'HIGH_RISK': return 'High Risk';
  }
}

export function getScoreColor(score: number): string {
  if (score >= 750) return '#ff453a';
  if (score >= 500) return '#ff9f0a';
  if (score >= 300) return '#ffd60a';
  return '#30d158';
}
