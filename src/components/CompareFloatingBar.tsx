import React from 'react';
import { Scale, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface CompareFloatingBarProps {
  comparedProducts: Product[];
  onOpenCompare: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
}

export const CompareFloatingBar: React.FC<CompareFloatingBarProps> = ({
  comparedProducts,
  onOpenCompare,
  onRemoveProduct,
  onClearAll,
}) => {
  if (comparedProducts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-bounce-short">
      <div className="bg-[#000c1b] text-white rounded-2xl p-2.5 sm:p-3 shadow-[0_12px_40px_rgba(0,12,27,0.4)] border border-[#26fedc]/30 backdrop-blur-md flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="p-2 rounded-xl bg-[#26fedc] text-[#000c1b] font-bold shrink-0">
            <Scale className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-xs font-bold text-[#26fedc] hidden sm:inline whitespace-nowrap">
              Compare ({comparedProducts.length}/3):
            </span>
            <div className="flex items-center gap-1">
              {comparedProducts.map((product) => (
                <div
                  key={product.id}
                  className="relative group w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-lg p-0.5 shrink-0 border border-white/20"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain rounded"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveProduct(product.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#93000a] hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs"
                    title={`Remove ${product.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              {/* Empty placeholder slots */}
              {[...Array(3 - comparedProducts.length)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-white/30 text-[10px] font-bold shrink-0"
                >
                  +
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-floating-compare-open"
            onClick={onOpenCompare}
            className="px-3.5 sm:px-4 py-2 rounded-xl bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs hover:scale-102"
          >
            <span>Compare</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearAll}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Clear comparison"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
