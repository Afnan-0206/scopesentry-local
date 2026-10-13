import React from 'react';
import { Lock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 text-xs text-slate-500 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict loopback processing (127.0.0.1) • Zero third-party cloud AI APIs • Data stays on your machine</span>
        </div>

        <div className="flex items-center gap-4 text-center md:text-right">
          <span className="flex items-center gap-1 text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Hacktoberfest 2026 — DEV Open-Source AI Challenge</span>
          </span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-3 text-center text-slate-600 text-[11px]">
        ScopeSentry is a decision-support tool for freelancers. It does not provide binding legal determinations or replace professional contract counsel.
      </div>
    </footer>
  );
};
