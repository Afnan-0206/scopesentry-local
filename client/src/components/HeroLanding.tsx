import React, { useState, useEffect, useRef } from 'react';
import { StoredProject } from '../types.js';
import { ArrowRight, Plus, ShieldCheck } from 'lucide-react';

interface Props {
  projects: StoredProject[];
  onStartComparison: (project: StoredProject, clientRequestText: string) => void;
  onCreateWithText: (initialText: string) => void;
  onOpenWorkspace: () => void;
  onOpenHowItWorks: () => void;
}

export const HeroLanding: React.FC<Props> = ({
  projects,
  onStartComparison,
  onCreateWithText,
  onOpenWorkspace,
  onOpenHowItWorks,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : ''
  );
  const [requestText, setRequestText] = useState('');
  const [fileImportError, setFileImportError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    // Explicitly enforce muted on DOM element to pass Chrome autoplay policy
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        // Autoplay prevented by browser: static fallback image remains visible
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = requestText.trim();
    if (!text) {
      onOpenWorkspace();
      return;
    }

    const matchedProject = projects.find((p) => p.id === selectedProjectId);
    if (matchedProject) {
      onStartComparison(matchedProject, text);
    } else {
      // If no project exists or none selected, direct to create agreement with text stored
      onCreateWithText(text);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      setFileImportError('Please select a .txt or .md plain text document.');
      return;
    }

    setFileImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRequestText(content);
      }
    };
    reader.readAsText(file);
  };

  const videoUrl =
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260831_232706_43757be4-2250-4f09-8cd7-23aebbf147ad.mp4';
  const localPosterUrl = '/hero-bg.webp';

  return (
    <section className="relative w-full min-h-[calc(100vh-80px)] flex flex-col justify-center items-center px-4 sm:px-6 py-12 select-none overflow-hidden">
      {/* Dedicated Hero Background: Instant static webp image + smooth autoplay video */}
      <div className="hero__bg animate-bg-fade" aria-hidden="true">
        {/* Instant static fallback - guaranteed to render immediately */}
        <img
          src={localPosterUrl}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-fill pointer-events-none"
        />
        {/* Looping video that layers over the static image */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={localPosterUrl}
          onCanPlay={() => setVideoLoaded(true)}
          onLoadedData={() => setVideoLoaded(true)}
          onPlaying={() => setVideoLoaded(true)}
          className={`w-full h-full object-fill pointer-events-none transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
          <source src={videoUrl} type="video/mp4" />
        </video>
      </div>

      {/* Hero Content - Placed directly above video with dark typography */}
      <div className="relative z-10 max-w-[860px] mx-auto text-center space-y-6">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-black/8 text-[11px] font-medium text-[#111111] shadow-sm animate-rise delay-75">
          <span className="w-1.5 h-1.5 rounded-full bg-[#111111]"></span>
          <span className="tracking-wide uppercase font-semibold">LOCAL-FIRST AI</span>
          <span className="text-[#5c5c5c] font-normal">• Private by design</span>
        </div>

        {/* Large Central Headline */}
        <h1 className="text-[#111111] text-[36px] sm:text-[54px] lg:text-[66px] leading-[1.08] font-medium tracking-[-0.03em] max-w-[780px] mx-auto animate-rise delay-150">
          Keep client scope clear.
          <br />
          Catch scope creep early.
        </h1>

        {/* Supporting Description */}
        <p className="text-[#333333] text-sm sm:text-base font-normal max-w-[620px] mx-auto leading-relaxed animate-rise delay-200">
          Compare new client requests against your original agreement. Get evidence-backed assessments and professional replies, powered by AI running locally on your machine.
        </p>

        {/* Frosted-Glass Quick-Action Prompt Panel */}
        <div className="pt-2 animate-rise delay-300">
          <form
            onSubmit={handleSubmit}
            className="frosted-prompt-card max-w-[680px] mx-auto p-4 sm:p-5 text-left transition-all"
          >
            {/* Optional Project Selector Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-black/6 text-xs text-[#5c5c5c]">
              <label htmlFor="hero-request-input" className="font-medium text-[#111111]">
                Check a client request
              </label>

              {projects.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-[#5c5c5c]">Against project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="bg-white/80 border border-black/10 rounded-md px-2 py-0.5 text-xs text-[#111111] focus:outline-none focus:border-black"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="text-[11px] text-[#5c5c5c] italic">
                  (Or enter request to start a new scope agreement)
                </span>
              )}
            </div>

            {/* Input Textarea */}
            <textarea
              id="hero-request-input"
              rows={3}
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Paste the new request from your client. For example: Can we also add user authentication and a reporting dashboard?"
              className="w-full bg-transparent text-[#111111] placeholder-[#666666] text-sm resize-none focus:outline-none leading-relaxed"
            />

            {fileImportError && (
              <p className="text-[11px] text-rose-600 pt-1">{fileImportError}</p>
            )}

            {/* Panel Actions Bottom Row */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                {/* Circular plus icon for importing .txt/.md */}
                <label
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-black/8 flex items-center justify-center text-[#111111] cursor-pointer hover:scale-105 active:scale-95 transition"
                  title="Import .txt or .md message"
                >
                  <Plus className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".txt,.md"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-[#5c5c5c] hidden sm:inline">Import text</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#5c5c5c]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>100% Local Inference</span>
                </span>

                {/* Dark square arrow submit button matching reference */}
                <button
                  type="submit"
                  className="w-9 h-9 rounded-[9px] bg-[#141414] hover:bg-black text-white flex items-center justify-center hover:-translate-y-0.5 active:translate-y-0 transition shadow-sm"
                  title="Run Scope Comparison"
                  aria-label="Submit client request"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>

          {/* Quick Hero Secondary CTAs */}
          <div className="pt-4 flex items-center justify-center gap-4 text-xs">
            <button
              onClick={onOpenWorkspace}
              className="text-[#111111] font-medium hover:underline underline-offset-4 transition"
            >
              Open Workspace →
            </button>
            <span className="text-[#5c5c5c]">•</span>
            <button
              onClick={onOpenHowItWorks}
              className="text-[#5c5c5c] hover:text-[#111111] transition"
            >
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
