import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AiFloatingButtonProps {
  onOpen: () => void;
}

export const AiFloatingButton: React.FC<AiFloatingButtonProps> = ({ onOpen }) => {
  return (
    <button
      id="btn-floating-ai-assistant"
      type="button"
      onClick={onOpen}
      title="Ask AI (Amazon, Pinterest, Deals & Q&A)"
      className="fixed bottom-20 md:bottom-8 right-12 sm:right-14 z-40 h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full bg-linear-to-r from-[#000c1b] via-[#08182b] to-[#0d2745] text-white border border-[#26fedc]/50 shadow-[0_6px_20px_rgba(0,12,27,0.35)] backdrop-blur-xs flex items-center gap-1.5 sm:gap-2 group transition-all duration-300 hover:scale-105 hover:border-[#26fedc] active:scale-95 cursor-pointer"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-linear-to-br from-[#006b5b] to-[#26fedc] flex items-center justify-center text-[#000c1b]">
          <Bot className="w-3 h-3 text-[#000c1b] group-hover:rotate-12 transition-transform duration-200" />
        </div>
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#26fedc] animate-ping" />
      </div>
      <span className="text-[11.5px] sm:text-xs font-bold text-white flex items-center gap-1 tracking-tight">
        Ask AI <Sparkles className="w-2.5 h-2.5 text-[#26fedc]" />
      </span>
    </button>
  );
};
