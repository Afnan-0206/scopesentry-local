import React, { useEffect } from 'react';
import { X, ShieldCheck, HelpCircle, Info } from 'lucide-react';

export type InfoModalType = 'how-it-works' | 'privacy' | 'about' | null;

interface Props {
  type: InfoModalType;
  onClose: () => void;
}

export const InfoModal: React.FC<Props> = ({ type, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (type) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [type, onClose]);

  if (!type) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-rise"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#fafbf9] text-[#111111] rounded-[20px] p-6 shadow-2xl border border-black/10 space-y-4"
      >
        <div className="flex items-start justify-between border-b border-black/8 pb-3">
          <div className="flex items-center gap-2.5">
            {type === 'how-it-works' && <HelpCircle className="w-5 h-5 text-[#111111]" />}
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-[#111111]" />}
            {type === 'about' && <Info className="w-5 h-5 text-[#111111]" />}
            <h2 className="text-base font-semibold text-[#111111]">
              {type === 'how-it-works' && 'How ScopeSentry Works'}
              {type === 'privacy' && 'Local-First Privacy Guarantee'}
              {type === 'about' && 'About ScopeSentry Local'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#5c5c5c] hover:text-[#111111] hover:bg-black/5 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#5c5c5c] space-y-3 leading-relaxed">
          {type === 'how-it-works' && (
            <>
              <p>
                <strong>1. Save Your Original Scope:</strong> Paste your signed contract, brief, or proposal. ScopeSentry's local model extracts deliverables, exclusions, and revision policies into a structured record.
              </p>
              <p>
                <strong>2. Check Client Requests:</strong> When a client sends a message or asks for extra features, paste their text. The engine compares it against the saved agreement.
              </p>
              <p>
                <strong>3. Verified Citations & Safe Replies:</strong> ScopeSentry tests every citation verbatim against the original text. Hallucinations are rejected. You get an editable draft that <em>never</em> invents prices or deadlines.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                <strong>Strict Loopback:</strong> Your agreement contents and client messages never leave your computer. The backend binds strictly to <code>127.0.0.1</code> and connects directly to your local Ollama daemon.
              </p>
              <p>
                <strong>Zero Cloud LLM APIs:</strong> No data is sent to OpenAI, Anthropic, Google Gemini, or hidden hosted APIs.
              </p>
              <p>
                <strong>Local Storage Notice:</strong> Projects are saved in browser <code>localStorage</code> for offline convenience. Because browser storage is unencrypted, avoid using it on shared public computers.
              </p>
            </>
          )}

          {type === 'about' && (
            <>
              <p>
                <strong>ScopeSentry Local</strong> is an open-source, local-first decision support tool built for independent freelancers, developers, and designers.
              </p>
              <p>
                Built for the <strong>Hacktoberfest 2026 DEV Open-Source AI Challenge</strong> (Week 2: Side Hustle), it demonstrates that open-weight models (Qwen 2.5 via Ollama) combined with deterministic software verification can replace costly proprietary AI APIs for real professional workflows.
              </p>
              <p className="text-xs">
                🌐 Live deployment:{' '}
                <a
                  href="https://scopesentry.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black font-semibold underline underline-offset-4"
                >
                  https://scopesentry.pages.dev/
                </a>
              </p>
              <p className="pt-1 text-[11px] text-[#5c5c5c]/80 border-t border-black/8">
                *Decision-support tool only. Does not constitute binding legal determinations or formal contract advice.
              </p>
            </>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#141414] hover:bg-black text-white text-xs font-medium rounded-[9px] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
