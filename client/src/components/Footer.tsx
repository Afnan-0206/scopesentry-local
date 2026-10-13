import React from 'react';
import { Lock, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-black/8 bg-[#fafbf9] py-10 px-4 text-xs text-[#5c5c5c] mt-auto">
      <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[#333333]">
          <Lock className="w-3.5 h-3.5 text-[#111111]" />
          <span>Strict loopback processing (127.0.0.1) • Zero third-party cloud AI APIs • Data stays on your device</span>
        </div>

        <div className="flex items-center gap-4 text-center md:text-right">
          <span className="flex items-center gap-1.5 text-[#111111] font-medium">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Hacktoberfest 2026 — DEV Open-Source AI Challenge</span>
          </span>
        </div>
      </div>
      <div className="max-w-[1120px] mx-auto mt-4 text-center md:text-left text-[#5c5c5c] text-[11px] leading-relaxed">
        ScopeSentry is a decision-support tool for independent freelancers. It does not provide formal legal determinations, contract drafting, or binding counsel. Background video is streamed from the reference demonstration host.
      </div>
    </footer>
  );
};
