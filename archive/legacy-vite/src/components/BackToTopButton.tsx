import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopButtonProps {
  heroElementId?: string;
  threshold?: number;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  heroElementId = 'hero-section',
  threshold = 320,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById(heroElementId);
      // If hero section exists, appear when scrolled past its bottom edge
      const triggerThreshold = heroEl
        ? heroEl.offsetTop + heroEl.offsetHeight - 50
        : threshold;

      if (window.scrollY > triggerThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [heroElementId, threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      id="btn-back-to-top"
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className={`fixed bottom-20 md:bottom-8 right-3 sm:right-4 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#000c1b] text-white border border-[#26fedc]/40 shadow-[0_4px_15px_rgba(0,12,27,0.28)] backdrop-blur-xs flex items-center justify-center group transition-all duration-300 ease-out hover:scale-110 hover:border-[#26fedc] hover:bg-[#0b1c30] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#26fedc]/50 cursor-pointer ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-4 pointer-events-none scale-90'
      }`}
    >
      <ArrowUp className="w-3.5 h-3.5 text-[#26fedc] group-hover:-translate-y-0.5 transition-transform duration-200" />
      <span className="sr-only">Back to Top</span>
    </button>
  );
};
