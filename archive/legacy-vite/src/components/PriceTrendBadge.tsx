import React, { useState, useRef, useEffect } from 'react';
import { TrendingDown, TrendingUp, Minus, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { Product, PriceTrend } from '../types';
import { getProductPriceTrend } from '../utils/priceTrend';

interface PriceTrendBadgeProps {
  product: Product;
  trend?: PriceTrend;
  size?: 'xs' | 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

export const PriceTrendBadge: React.FC<PriceTrendBadgeProps> = ({
  product,
  trend: explicitTrend,
  size = 'sm',
  showLabel = true,
  className = '',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const trend = explicitTrend || getProductPriceTrend(product);
  const isDown = trend.direction === 'down';
  const isUp = trend.direction === 'up';

  // Handle outside click to close tooltip on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTooltip]);

  const sizeStyles = {
    xs: {
      badge: 'text-[10px] px-1 py-0.5 gap-0.5',
      icon: 'w-2.5 h-2.5',
    },
    sm: {
      badge: 'text-[11px] px-1.5 py-0.5 gap-1',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'text-xs px-2 py-1 gap-1.5',
      icon: 'w-3.5 h-3.5',
    },
  }[size];

  const tooltipTitle = isDown
    ? `Price dropped $${trend.changeAmount} (${trend.changePercentage}%) in the last 30 days`
    : isUp
    ? `Price rose $${trend.changeAmount} (${trend.changePercentage}%) in the last 30 days`
    : 'Price remained stable over the last 30 days';

  return (
    <div
      ref={badgeRef}
      className={`relative inline-flex items-center ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip((prev) => !prev);
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={tooltipTitle}
        title={tooltipTitle}
        className={`inline-flex items-center font-bold rounded-md border transition-all cursor-pointer shadow-2xs hover:scale-105 select-none ${
          sizeStyles.badge
        } ${
          isDown
            ? 'text-[#006b5b] bg-[#26fedc]/25 border-[#006b5b]/25 hover:bg-[#26fedc]/40'
            : isUp
            ? 'text-[#ba1a1a] bg-[#ffdad6]/70 border-[#ba1a1a]/25 hover:bg-[#ffdad6]'
            : 'text-[#43474d] bg-[#eff4ff] border-[#c3c6ce]/40 hover:bg-[#d8e6ff]'
        }`}
      >
        {isDown ? (
          <TrendingDown className={`${sizeStyles.icon} text-[#006b5b] shrink-0 stroke-[2.5]`} />
        ) : isUp ? (
          <TrendingUp className={`${sizeStyles.icon} text-[#ba1a1a] shrink-0 stroke-[2.5]`} />
        ) : (
          <Minus className={`${sizeStyles.icon} text-[#43474d] shrink-0 stroke-[2.5]`} />
        )}

        {showLabel && (
          <span className="leading-none tracking-tight">
            {isDown ? `-${trend.changePercentage}%` : isUp ? `+${trend.changePercentage}%` : '0%'}
          </span>
        )}
      </button>

      {/* Floating 30-day Trend Context Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 p-2.5 bg-[#000c1b] text-white text-xs rounded-xl shadow-2xl border border-[#26fedc]/30 z-50 animate-in fade-in zoom-in-95 pointer-events-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/15 pb-1.5 mb-1.5">
            <span className="font-bold text-[11px] text-[#26fedc] flex items-center gap-1">
              <Info className="w-3 h-3 text-[#26fedc]" />
              30-Day Price Trend
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isDown
                  ? 'bg-[#26fedc]/20 text-[#26fedc]'
                  : isUp
                  ? 'bg-[#ffdad6]/20 text-[#ffdad6]'
                  : 'bg-white/10 text-white'
              }`}
            >
              {isDown ? 'Fallen' : isUp ? 'Risen' : 'Stable'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1 text-[11px] text-white/90 leading-tight">
            <div className="flex items-center justify-between">
              <span className="text-white/60">Current Price:</span>
              <span className="font-bold text-white">${product.price}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">30 Days Ago:</span>
              <span className="font-medium text-white/80">${trend.previousPrice}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-white/60">Net Change:</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  isDown ? 'text-[#26fedc]' : isUp ? 'text-[#ffdad6]' : 'text-white'
                }`}
              >
                {isDown ? `-$${trend.changeAmount} (-${trend.changePercentage}%)` : isUp ? `+$${trend.changeAmount} (+${trend.changePercentage}%)` : '$0'}
              </span>
            </div>
          </div>

          {/* Actionable note */}
          <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center gap-1 text-[10px] text-white/70">
            {isDown ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-[#26fedc] shrink-0" />
                <span>Price dropped — advantageous time to buy.</span>
              </>
            ) : isUp ? (
              <>
                <AlertCircle className="w-3 h-3 text-[#ffdad6] shrink-0" />
                <span>Price climbed — watch or set a Price Alert.</span>
              </>
            ) : (
              <span>Consistent pricing over 30 days.</span>
            )}
          </div>

          {/* Downward triangle arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#000c1b]" />
        </div>
      )}
    </div>
  );
};
