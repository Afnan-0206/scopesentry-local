import React from 'react';

interface Props {
  onClick?: () => void;
  className?: string;
}

export const BrandLogo: React.FC<Props> = ({ onClick, className = '' }) => {
  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${className}`}
    >
      {/* Refined geometric scope-mark icon matching minimal design language */}
      <div className="w-8 h-8 rounded-lg bg-[#141414] text-white flex items-center justify-center transition-transform group-hover:scale-105">
        <svg
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Geometric scope shield with inner crossmark */}
          <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" />
          <path d="M12 9v6" />
          <path d="M9 12h6" />
        </svg>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="font-semibold text-base tracking-tight text-[#111111]">
          ScopeSentry
        </span>
        <span className="text-[11px] font-normal text-[#5c5c5c] tracking-normal">
          Local
        </span>
      </div>
    </div>
  );
};
