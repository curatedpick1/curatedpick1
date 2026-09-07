import React from 'react';
import { Search, ArrowRight, X } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  inputRef,
}) => {
  return (
    <section
      id="hero-section"
      className="relative bg-gradient-to-br from-[#dce9ff] via-[#e5eeff] to-[#f8f9ff] dark:from-[#091524] dark:via-[#0c1c30] dark:to-[#070e17] py-10 md:py-16 px-4 md:px-8 flex flex-col items-center justify-center text-center overflow-hidden border-b border-[#c3c6ce]/20 dark:border-slate-800 transition-colors"
    >
      {/* Ambient background glow elements */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#26fedc]/25 dark:bg-[#26fedc]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#b0c9ea]/35 dark:bg-[#193b63]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider bg-[#26fedc]/40 dark:bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc] rounded-full">
          Verified Expert Picks
        </span>
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-[#000c1b] dark:text-white leading-tight mb-3 md:mb-4 tracking-tight">
          Discover the Best Products, <br className="hidden sm:inline" />
          Curated for You.
        </h1>
        <p className="text-base sm:text-lg text-[#43474d] dark:text-slate-300 max-w-lg mx-auto mb-6 md:mb-8 font-normal leading-relaxed">
          Expert reviews, exclusive deals, and comprehensive guides to help you make informed decisions.
        </p>

        {/* Search Bar */}
        <form
          id="hero-search-form"
          onSubmit={onSearchSubmit}
          className="w-full max-w-md mx-auto relative"
        >
          <div className="relative flex items-center group">
            <Search className="w-5 h-5 absolute left-4 text-[#74777e] dark:text-slate-400 group-focus-within:text-[#006b5b] dark:group-focus-within:text-[#26fedc] transition-colors pointer-events-none" />
            <input
              ref={inputRef}
              id="hero-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products, reviews, or brands..."
              className="w-full h-12 md:h-14 pl-12 pr-20 bg-white dark:bg-[#112338] rounded-full border border-[#c3c6ce] dark:border-slate-700 focus:border-[#006b5b] dark:focus:border-[#26fedc] focus:ring-4 focus:ring-[#26fedc]/25 transition-all shadow-[0_4px_20px_rgba(0,12,27,0.06)] text-[#0b1c30] dark:text-white text-sm md:text-base outline-hidden placeholder:text-[#74777e] dark:placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-12 text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white p-1.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <button
              id="btn-hero-search-submit"
              type="submit"
              className="absolute right-2 bg-[#006b5b] text-white dark:bg-[#26fedc] dark:text-[#000c1b] hover:bg-[#000c1b] dark:hover:bg-[#1de9b6] rounded-full w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xs cursor-pointer"
              aria-label="Search"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
