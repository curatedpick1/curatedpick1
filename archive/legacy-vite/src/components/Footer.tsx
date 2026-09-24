import React from 'react';
import { CuratedPickLogo } from './CuratedPickLogo';

interface FooterProps {
  onOpenDisclosure: () => void;
  onOpenPolicy: (type: 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDisclosure,
  onOpenPolicy,
}) => {
  return (
    <footer className="w-full bg-white dark:bg-[#07111e] border-t border-[#c3c6ce]/40 dark:border-slate-800 flex flex-col items-center gap-4 py-8 md:py-10 px-4 md:px-8 text-center pb-28 md:pb-10 mt-12 transition-colors">
      <div className="flex flex-col items-center gap-1.5">
        <CuratedPickLogo className="w-10 h-10 mx-auto object-contain mb-0.5" />
        <div className="text-lg md:text-xl font-bold text-[#000c1b] dark:text-white">
          The Curated Pick
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs md:text-sm font-medium">
        <button
          onClick={onOpenDisclosure}
          className="text-[#43474d] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] transition-colors cursor-pointer"
        >
          Affiliate Disclosure
        </button>
        <button
          onClick={() => onOpenPolicy('privacy')}
          className="text-[#43474d] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] transition-colors cursor-pointer"
        >
          Privacy Policy
        </button>
        <button
          onClick={() => onOpenPolicy('terms')}
          className="text-[#43474d] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] transition-colors cursor-pointer"
        >
          Terms of Service
        </button>
        <button
          onClick={() => onOpenPolicy('contact')}
          className="text-[#43474d] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] transition-colors cursor-pointer"
        >
          Contact
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-[#74777e] dark:text-slate-400 max-w-md">
        <span>© 2026 The Curated Pick. High-performance marketing solutions.</span>
      </div>
    </footer>
  );
};
