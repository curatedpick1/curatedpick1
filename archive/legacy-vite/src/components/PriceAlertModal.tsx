import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  Check,
  X,
  TrendingDown,
  Mail,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Product, PriceAlertConfig } from '../types';

interface PriceAlertModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  existingAlert?: PriceAlertConfig | null;
  onSaveAlert: (config: PriceAlertConfig) => void;
  onRemoveAlert?: (productId: string) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  product,
  isOpen,
  onClose,
  existingAlert,
  onSaveAlert,
  onRemoveAlert,
}) => {
  if (!isOpen || !product) return null;

  const currentPrice = product.price;
  const defaultTarget = existingAlert?.targetPrice ?? Math.round(currentPrice * 0.9); // default 10% drop

  const [targetPrice, setTargetPrice] = useState<number>(defaultTarget);
  const [email, setEmail] = useState<string>(
    existingAlert?.email || (localStorage.getItem('curated_pick_user_email') || '')
  );
  const [notifyOnAnyDrop, setNotifyOnAnyDrop] = useState<boolean>(
    existingAlert?.notifyOnAnyDrop ?? true
  );
  const [discountQuickPick, setDiscountQuickPick] = useState<number>(
    existingAlert
      ? Math.round(((currentPrice - existingAlert.targetPrice) / currentPrice) * 100)
      : 10
  );
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update target when percentage shortcut is clicked
  const handleSelectPercentage = (percent: number) => {
    setDiscountQuickPick(percent);
    const newTarget = Math.max(1, Math.round(currentPrice * (1 - percent / 100)));
    setTargetPrice(newTarget);
    setErrorMsg('');
  };

  const handleCustomPriceChange = (val: number) => {
    setTargetPrice(val);
    setDiscountQuickPick(0);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetPrice || targetPrice <= 0) {
      setErrorMsg('Please enter a valid target price.');
      return;
    }

    if (targetPrice >= currentPrice) {
      setErrorMsg(`Target price should be lower than the current price of $${currentPrice}.`);
      return;
    }

    if (email && !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Save email to localStorage for convenience
    if (email) {
      try {
        localStorage.setItem('curated_pick_user_email', email);
      } catch (e) {
        // ignore
      }
    }

    const config: PriceAlertConfig = {
      productId: product.id,
      enabled: true,
      targetPrice,
      email: email.trim() || undefined,
      notifyOnAnyDrop,
      createdAt: new Date().toISOString(),
    };

    onSaveAlert(config);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    if (onRemoveAlert) {
      onRemoveAlert(product.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#000c1b]/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-[0_20px_50px_rgba(0,12,27,0.25)] border border-[#c3c6ce]/40 my-8 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#c3c6ce]/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#26fedc]/30 text-[#006b5b]">
              <BellRing className="w-5 h-5 text-[#006b5b]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#000c1b]">
                Price Drop Alert
              </h3>
              <p className="text-[11px] text-[#74777e] font-medium">
                Instant notification when the price drops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000c1b] p-1.5 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Product Mini Banner */}
          <div className="flex items-center gap-3 p-3 bg-[#f8f9ff] rounded-xl border border-[#c3c6ce]/30">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover bg-[#e5eeff] shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-[#000c1b] truncate">
                {product.name}
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[#74777e]">Current Price:</span>
                <span className="text-sm font-extrabold text-[#000c1b]">
                  ${currentPrice}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Target Percentage Selection */}
          <div>
            <label className="block text-xs font-bold text-[#000c1b] mb-1.5 flex items-center justify-between">
              <span>Notify Me When Price Reaches</span>
              <span className="text-[#006b5b] font-semibold text-[11px] flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                Target: ${targetPrice}
              </span>
            </label>

            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {[5, 10, 15, 20].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handleSelectPercentage(percent)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center ${
                    discountQuickPick === percent
                      ? 'bg-[#000c1b] text-[#26fedc] border-[#000c1b] shadow-xs scale-102'
                      : 'bg-white text-[#43474d] border-[#c3c6ce]/40 hover:bg-[#eff4ff]'
                  }`}
                >
                  -{percent}% (${Math.round(currentPrice * (1 - percent / 100))})
                </button>
              ))}
            </div>

            {/* Custom Target Price Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777e]">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="1"
                max={currentPrice - 1}
                step="1"
                value={targetPrice}
                onChange={(e) => handleCustomPriceChange(Number(e.target.value))}
                placeholder="Custom target price"
                className="w-full pl-8 pr-4 py-2.5 bg-white border border-[#c3c6ce] rounded-xl text-sm font-bold text-[#000c1b] focus:outline-hidden focus:ring-2 focus:ring-[#26fedc] focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[10px] text-[#74777e] mt-1">
              You will save ${(currentPrice - targetPrice).toFixed(0)} ({Math.round(((currentPrice - targetPrice) / currentPrice) * 100)}% discount) at this target price.
            </p>
          </div>

          {/* Email Notification (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#000c1b] mb-1.5">
              Notification Channel
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#74777e]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="your.email@example.com (optional)"
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#c3c6ce] rounded-xl text-xs sm:text-sm text-[#000c1b] focus:outline-hidden focus:ring-2 focus:ring-[#26fedc] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Toggle on Any Price Drop */}
          <label className="flex items-center gap-2.5 p-2.5 bg-[#f8f9ff] rounded-xl border border-[#c3c6ce]/30 cursor-pointer hover:bg-[#eff4ff] transition-colors">
            <input
              type="checkbox"
              checked={notifyOnAnyDrop}
              onChange={(e) => setNotifyOnAnyDrop(e.target.checked)}
              className="w-4 h-4 rounded text-[#006b5b] focus:ring-[#26fedc] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-[#000c1b] block">
                Also notify on flash deals & retailer coupons
              </span>
              <span className="text-[11px] text-[#74777e]">
                Get alerted whenever price drops below current rate.
              </span>
            </div>
          </label>

          {/* Error message */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-[#93000a] bg-[#ffdad6]/60 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              id="btn-save-price-alert"
              type="submit"
              disabled={isSavedSuccess}
              className={`w-full py-3 rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 ${
                isSavedSuccess
                  ? 'bg-[#006b5b] text-white'
                  : 'bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] hover:scale-[1.01]'
              }`}
            >
              {isSavedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Price Alert Set!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 fill-current" />
                  <span>{existingAlert ? 'Update Price Alert' : 'Set Price Alert'}</span>
                </>
              )}
            </button>

            {existingAlert && onRemoveAlert && (
              <button
                type="button"
                onClick={handleRemove}
                className="w-full py-2 text-xs font-semibold text-[#93000a] hover:bg-[#ffdad6]/30 rounded-lg transition-colors"
              >
                Turn off price alert for this item
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
