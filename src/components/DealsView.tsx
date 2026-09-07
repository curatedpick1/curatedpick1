import React, { useState } from 'react';
import { Tag, Clock, Copy, Check, ExternalLink, Flame } from 'lucide-react';
import { DealItem } from '../types';
import { FlashDealTimer } from './FlashDealTimer';

interface DealsViewProps {
  deals: DealItem[];
}

export const DealsView: React.FC<DealsViewProps> = ({ deals }) => {
  const [copiedDealId, setCopiedDealId] = useState<string | null>(null);

  const handleCopyCode = (deal: DealItem) => {
    if (deal.couponCode) {
      navigator.clipboard.writeText(deal.couponCode);
      setCopiedDealId(deal.id);
      setTimeout(() => setCopiedDealId(null), 2000);
    }
  };

  return (
    <div className="py-6 px-4 md:px-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <span className="text-xs font-bold text-[#93000a] dark:text-rose-300 bg-[#ffdad6] dark:bg-rose-950/40 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-max">
          <Flame className="w-3.5 h-3.5" /> Exclusive Member Discounts
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000c1b] dark:text-white mt-2 tracking-tight">
          Hand-Verified Daily Deals
        </h1>
        <p className="text-sm sm:text-base text-[#43474d] dark:text-slate-400 mt-1 max-w-2xl">
          We monitor price fluctuations across major retailers to secure the lowest prices and verified promo codes for our community.
        </p>
      </div>

      {/* Flash Deal Urgency Timer */}
      <FlashDealTimer />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {deals.map((deal) => (
          <div
            key={deal.id}
            className="bg-white dark:bg-[#0e1c2e] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,12,27,0.05)] hover:shadow-[0_10px_30px_rgba(0,12,27,0.08)] border border-[#c3c6ce]/30 dark:border-slate-800 flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#e5eeff] dark:bg-slate-800 shrink-0 overflow-hidden relative">
                  <img
                    src={deal.imageUrl}
                    alt={deal.productName}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1.5 left-1.5 bg-[#93000a] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    -{deal.discountPercentage}%
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/15 px-2 py-0.5 rounded">
                      {deal.category}
                    </span>
                    <span className="text-[11px] text-[#74777e] dark:text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-[#93000a] dark:text-rose-400" /> {deal.expiresIn}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#000c1b] dark:text-white line-clamp-2 leading-snug">
                    {deal.productName}
                  </h3>

                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-lg sm:text-xl font-extrabold text-[#000c1b] dark:text-white">
                      ${deal.dealPrice}
                    </span>
                    <span className="text-xs text-[#74777e] dark:text-slate-400 line-through">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc]">
                      Save ${(deal.originalPrice - deal.dealPrice).toFixed(0)}
                    </span>
                  </div>
                </div>
              </div>

              {deal.couponCode && (
                <div className="mt-3.5 p-2 bg-[#eff4ff] dark:bg-[#132338] rounded-xl flex items-center justify-between border border-[#c3c6ce]/40 dark:border-slate-700">
                  <div className="flex items-center gap-2 px-2">
                    <Tag className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                    <span className="text-xs font-mono font-bold text-[#000c1b] dark:text-white">
                      {deal.couponCode}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyCode(deal)}
                    className="text-xs font-bold bg-white dark:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] hover:bg-[#26fedc] dark:hover:bg-[#26fedc] hover:text-[#000c1b] dark:hover:text-[#000c1b] px-3 py-1 rounded-lg border border-[#c3c6ce]/40 dark:border-slate-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedDealId === deal.id ? (
                      <>
                        <Check className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                {deal.claimedCount} people claimed this week
              </span>
              <a
                href={deal.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105"
              >
                <span>Claim Deal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
