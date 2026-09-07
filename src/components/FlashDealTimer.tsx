import React, { useState, useEffect } from 'react';
import { Timer, Zap, Flame, Clock, RefreshCw, BellRing, Check } from 'lucide-react';

interface FlashDealTimerProps {
  onRefreshTimer?: () => void;
}

export const FlashDealTimer: React.FC<FlashDealTimerProps> = ({ onRefreshTimer }) => {
  // Use a persistent target epoch in localStorage or initialize to a realistic countdown (~5h 42m)
  const [targetEpoch, setTargetEpoch] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('curated_flash_deal_target');
      if (saved) {
        const val = parseInt(saved, 10);
        if (val > Date.now()) {
          return val;
        }
      }
    } catch (e) {
      console.warn('Flash deal target local storage error', e);
    }
    // Default: 5 hours, 42 minutes, 19 seconds from now
    const newTarget = Date.now() + (5 * 3600 + 42 * 60 + 19) * 1000;
    try {
      localStorage.setItem('curated_flash_deal_target', newTarget.toString());
    } catch (e) {
      // Ignore
    }
    return newTarget;
  });

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 5, minutes: 42, seconds: 19, totalSeconds: 20539 });

  const [isAlertSubscribed, setIsAlertSubscribed] = useState(false);
  const [showRefreshAnim, setShowRefreshAnim] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = targetEpoch - now;

      if (diff <= 0) {
        // Automatically reset with a new rolling window (e.g., 6 hours)
        const nextTarget = Date.now() + 6 * 3600 * 1000;
        setTargetEpoch(nextTarget);
        try {
          localStorage.setItem('curated_flash_deal_target', nextTarget.toString());
        } catch (e) {
          // Ignore
        }
        if (onRefreshTimer) {
          onRefreshTimer();
        }
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ hours, minutes, seconds, totalSeconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetEpoch, onRefreshTimer]);

  const handleManualRefresh = () => {
    setShowRefreshAnim(true);
    setTimeout(() => {
      const nextTarget = Date.now() + (4 * 3600 + 18 * 60 + 45) * 1000;
      setTargetEpoch(nextTarget);
      try {
        localStorage.setItem('curated_flash_deal_target', nextTarget.toString());
      } catch (e) {
        // Ignore
      }
      setShowRefreshAnim(false);
      if (onRefreshTimer) onRefreshTimer();
    }, 600);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Claim percentage calculation for visual urgency bar
  const claimedPercentage = 86;

  return (
    <div
      id="flash-deal-timer-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#000c1b] via-[#00172d] to-[#000c1b] border border-[#26fedc]/30 text-white p-4 sm:p-6 shadow-xl mb-7"
    >
      {/* Background glow accents */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#26fedc]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#93000a]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              id="badge-flash-deals-live"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#93000a] text-white tracking-wide uppercase shadow-xs animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              Flash Deal Drop
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#26fedc] bg-[#26fedc]/15 px-2 py-0.5 rounded-full border border-[#26fedc]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#26fedc] animate-ping" />
              Live Pricing Cycle
            </span>
            <span className="text-xs text-white/60 hidden sm:inline-block">• Tier-1 Retail Drops</span>
          </div>

          <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>Exclusive Flash Pricing Ending Soon</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
            Retail discounts & partner promo codes refresh automatically when the countdown expires.
            Claim yours before stock allocations run out.
          </p>

          {/* Allocation Claimed Progress Bar */}
          <div className="mt-3 max-w-md">
            <div className="flex items-center justify-between text-[11px] mb-1 font-medium">
              <span className="text-[#26fedc] flex items-center gap-1 font-semibold">
                <Flame className="w-3.5 h-3.5 text-[#ff897d]" /> {claimedPercentage}% of coupon codes claimed
              </span>
              <span className="text-white/60">Limited batch</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-[#26fedc] to-[#00f5d4] h-full rounded-full transition-all duration-1000"
                style={{ width: `${claimedPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Countdown Digital Display */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div
            id="countdown-clock-digits"
            className="flex items-center justify-center gap-2 sm:gap-2.5 bg-black/40 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border border-white/10 shadow-inner"
          >
            {/* Hours Block */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl sm:text-2xl font-mono font-black text-white shadow-xs">
                {pad(timeLeft.hours)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Hours
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-[#26fedc] -mt-5">:</span>

            {/* Minutes Block */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl sm:text-2xl font-mono font-black text-white shadow-xs">
                {pad(timeLeft.minutes)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Mins
              </span>
            </div>

            <span className="text-xl sm:text-2xl font-black text-[#26fedc] -mt-5">:</span>

            {/* Seconds Block */}
            <div className="flex flex-col items-center">
              <div className="w-13 sm:w-16 h-13 sm:h-16 rounded-xl bg-[#26fedc]/20 border border-[#26fedc]/40 flex items-center justify-center text-xl sm:text-2xl font-mono font-black text-[#26fedc] shadow-xs">
                {pad(timeLeft.seconds)}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#26fedc] mt-1">
                Secs
              </span>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex sm:flex-col gap-2 justify-stretch">
            <button
              id="btn-flash-deal-remind"
              onClick={() => setIsAlertSubscribed(!isAlertSubscribed)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                isAlertSubscribed
                  ? 'bg-[#26fedc] text-[#000c1b]'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title="Get notified when next flash batch drops"
            >
              {isAlertSubscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <BellRing className="w-3.5 h-3.5 text-[#26fedc]" />
                  <span>Notify Me</span>
                </>
              )}
            </button>

            <button
              id="btn-flash-deal-sync"
              onClick={handleManualRefresh}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="Check for refreshed retailer discounts"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${showRefreshAnim ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
