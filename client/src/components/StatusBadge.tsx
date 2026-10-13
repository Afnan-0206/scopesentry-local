import React from 'react';
import { DecisionStatus } from '@scopesentry/shared';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface Props {
  status: DecisionStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  if (status === 'INCLUDED') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 ${
          size === 'lg' ? 'px-3.5 py-1.5 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        }`}
      >
        <CheckCircle2 className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>INCLUDED</span>
      </span>
    );
  }

  if (status === 'POTENTIAL SCOPE CHANGE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/80 ${
          size === 'lg' ? 'px-3.5 py-1.5 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        }`}
      >
        <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        <span>POTENTIAL SCOPE CHANGE</span>
      </span>
    );
  }

  // NEEDS CLARIFICATION
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-sky-950/80 text-sky-400 border border-sky-800/80 ${
        size === 'lg' ? 'px-3.5 py-1.5 text-base' : size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      <HelpCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>NEEDS CLARIFICATION</span>
    </span>
  );
};
