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
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${
          size === 'lg' ? 'px-3.5 py-1.5 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <CheckCircle2 className={size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />
        <span>INCLUDED</span>
      </span>
    );
  }

  if (status === 'POTENTIAL SCOPE CHANGE') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 ${
          size === 'lg' ? 'px-3.5 py-1.5 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-amber-600' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>POTENTIAL SCOPE CHANGE</span>
      </span>
    );
  }

  // NEEDS CLARIFICATION
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-800 border border-slate-300/80 ${
        size === 'lg' ? 'px-3.5 py-1.5 text-sm' : size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <HelpCircle className={size === 'lg' ? 'w-4 h-4 text-slate-600' : 'w-3.5 h-3.5 text-slate-600'} />
      <span>NEEDS CLARIFICATION</span>
    </span>
  );
};
