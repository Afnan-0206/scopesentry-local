import React, { useState, useEffect } from 'react';
import { AppView } from '../types.js';
import { BackendHealth } from '../services/api.service.js';
import { BrandLogo } from './BrandLogo.js';
import { InfoModalType } from './InfoModal.js';
import { LocalStatusBadge } from './LocalStatusBadge.js';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenInfo: (type: InfoModalType) => void;
  health: BackendHealth | null;
  isDemoMode: boolean;
}

export const Header: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenInfo,
  health,
  isDemoMode,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on resize back to desktop (>900px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleNavClick = (view: AppView) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleInfoClick = (type: InfoModalType) => {
    onOpenInfo(type);
    setMobileMenuOpen(false);
  };

  const isHeroView = currentView === 'hero';

  return (
    <>
      <header
        className={`w-full z-40 transition-colors ${
          isHeroView
            ? 'relative bg-transparent text-[#111111]'
            : 'sticky top-0 bg-[#fafbf9]/95 backdrop-blur-md border-b border-black/8 text-[#111111]'
        }`}
      >
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & Wordmark */}
          <div className="animate-rise">
            <BrandLogo onClick={() => onNavigate('hero')} />
          </div>

          {/* Center: Desktop Navigation Links (hidden <=900px) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#111111] animate-rise delay-75">
            <button
              onClick={() => onNavigate('projects')}
              className={`hover:text-black transition ${
                currentView === 'projects' || currentView === 'compare' ? 'text-black font-semibold' : 'text-[#5c5c5c]'
              }`}
            >
              Workspace
            </button>
            <button
              onClick={() => onOpenInfo('how-it-works')}
              className="text-[#5c5c5c] hover:text-[#111111] transition"
            >
              How It Works
            </button>
            <button
              onClick={() => onOpenInfo('privacy')}
              className="text-[#5c5c5c] hover:text-[#111111] transition"
            >
              Privacy
            </button>
            <button
              onClick={() => onOpenInfo('about')}
              className="text-[#5c5c5c] hover:text-[#111111] transition"
            >
              About
            </button>
          </nav>

          {/* Right: Actions & CTA (Desktop & Tablet) */}
          <div className="flex items-center gap-3 animate-rise delay-100">
            <LocalStatusBadge
              health={health}
              isDemoMode={isDemoMode}
              onOpenSettings={() => onNavigate('settings')}
            />

            {/* Desktop CTA Button: dark, subtle radius, upward hover movement */}
            <button
              onClick={() => onNavigate('projects')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-medium rounded-[9px] bg-[#141414] text-white hover:bg-black hover:-translate-y-0.5 active:translate-y-0 transition duration-150 shadow-sm"
            >
              Open Workspace
            </button>

            {/* Smooth Hamburger-to-X Transformation (visible <=900px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#111111] hover:bg-black/5 transition relative w-10 h-10 flex items-center justify-center"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <div className="w-5 h-4 relative flex flex-col justify-between">
                <span
                  className={`h-0.5 w-full bg-[#111111] rounded-full transition-all duration-300 transform origin-left ${
                    mobileMenuOpen ? 'rotate-45 translate-x-0.5 -translate-y-0.5' : ''
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-[#111111] rounded-full transition-all duration-200 ${
                    mobileMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span
                  className={`h-0.5 w-full bg-[#111111] rounded-full transition-all duration-300 transform origin-left ${
                    mobileMenuOpen ? '-rotate-45 translate-x-0.5 translate-y-0.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay (<=900px) */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-30 bg-[#fafbf9] flex flex-col justify-between p-8 pt-24 animate-rise lg:hidden"
        >
          <div className="space-y-6 text-center my-auto">
            <button
              onClick={() => handleNavClick('projects')}
              className="block w-full py-2.5 text-2xl font-medium text-[#111111] hover:opacity-75 transition animate-rise delay-75"
            >
              Workspace
            </button>
            <button
              onClick={() => handleInfoClick('how-it-works')}
              className="block w-full py-2.5 text-2xl font-medium text-[#5c5c5c] hover:text-[#111111] transition animate-rise delay-100"
            >
              How It Works
            </button>
            <button
              onClick={() => handleInfoClick('privacy')}
              className="block w-full py-2.5 text-2xl font-medium text-[#5c5c5c] hover:text-[#111111] transition animate-rise delay-150"
            >
              Privacy
            </button>
            <button
              onClick={() => handleInfoClick('about')}
              className="block w-full py-2.5 text-2xl font-medium text-[#5c5c5c] hover:text-[#111111] transition animate-rise delay-200"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('settings')}
              className="block w-full py-2.5 text-xl font-medium text-[#5c5c5c] hover:text-[#111111] transition animate-rise delay-300"
            >
              Local AI Settings
            </button>
          </div>

          <div className="pt-6 border-t border-black/8 text-center animate-rise delay-300">
            {/* Single Mobile Workspace CTA */}
            <button
              onClick={() => handleNavClick('projects')}
              className="w-full py-3.5 bg-[#141414] hover:bg-black text-white text-sm font-medium rounded-[9px] shadow transition hover:-translate-y-0.5 active:translate-y-0"
            >
              Open Workspace
            </button>
          </div>
        </div>
      )}
    </>
  );
};
