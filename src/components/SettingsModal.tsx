import React, { useState } from 'react';
import {
  X,
  Settings,
  Bell,
  Globe,
  User,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onResetData?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onResetData,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currency, setCurrency] = useState(user.currency);
  const [notifications, setNotifications] = useState(user.notifications);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: name.trim() || 'Curated Member',
      email: email.trim() || 'curatedpick.store@gmail.com',
      currency,
      notifications,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="modal-user-settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000c1b]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0b1726] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 border border-[#c3c6ce]/40 dark:border-slate-800 animate-scaleUp">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#dce9ff]/60 via-[#eff4ff] to-[#f8f9ff] dark:from-[#112338] dark:via-[#0e1d30] dark:to-[#0b1726] border-b border-[#c3c6ce]/30 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] rounded-xl shadow-xs">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-slate-100">
                User Settings & Preferences
              </h2>
              <p className="text-xs text-[#74777e] dark:text-slate-400">
                Customize profile, notifications & currencies
              </p>
            </div>
          </div>

          <button
            id="btn-close-settings-modal"
            type="button"
            onClick={onClose}
            className="p-2 text-[#74777e] hover:text-[#000c1b] dark:hover:text-slate-200 hover:bg-[#eff4ff] dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Profile Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#43474d] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" /> Profile Information
            </h3>

            <div className="flex items-center gap-3 p-3 bg-[#eff4ff]/60 dark:bg-[#132338] rounded-xl border border-[#c3c6ce]/30 dark:border-slate-700/60">
              <div className="w-12 h-12 rounded-full bg-[#000c1b] text-[#26fedc] flex items-center justify-center font-bold text-base shadow-xs shrink-0 ring-2 ring-[#26fedc]/30">
                {name.slice(0, 2).toUpperCase() || 'CU'}
              </div>
              <div>
                <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block">
                  {name || 'Curated Member'}
                </span>
                <span className="text-[11px] text-[#74777e] dark:text-slate-400 block">{email}</span>
                <span className="text-[10px] text-[#006b5b] dark:text-[#26fedc] font-medium mt-0.5 inline-block">
                  Verified Member • {user.memberSince}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                id="input-settings-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#132338] text-[#000c1b] dark:text-slate-100 rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b] dark:focus:border-[#26fedc]"
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                id="input-settings-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#132338] text-[#000c1b] dark:text-slate-100 rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b] dark:focus:border-[#26fedc]"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          {/* Currency & Region */}
          <div className="space-y-3 pt-2 border-t border-[#c3c6ce]/30 dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#43474d] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" /> Currency & Region
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
                Display Currency
              </label>
              <select
                id="select-settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as UserProfile['currency'])}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#132338] text-[#000c1b] dark:text-slate-100 rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b] dark:focus:border-[#26fedc] font-medium"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD ($) - Canadian Dollar</option>
                <option value="AUD">AUD ($) - Australian Dollar</option>
              </select>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3 pt-2 border-t border-[#c3c6ce]/30 dark:border-slate-800">
            <h3 className="text-xs font-bold text-[#43474d] dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" /> Notification Preferences
            </h3>

            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-2.5 bg-[#f8f9ff] dark:bg-slate-800/70 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-700/60 cursor-pointer select-none">
                <div>
                  <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block">
                    Price Drop Notifications
                  </span>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                    Alert me when products in my watchlist reach target prices
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.priceDrops}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, priceDrops: e.target.checked }))
                  }
                  className="rounded text-[#006b5b] focus:ring-[#006b5b] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#f8f9ff] dark:bg-slate-800/70 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-700/60 cursor-pointer select-none">
                <div>
                  <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block">
                    Curated Deals Digest
                  </span>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                    Weekly editorial selection of highest-discount verified products
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyDigest}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, weeklyDigest: e.target.checked }))
                  }
                  className="rounded text-[#006b5b] focus:ring-[#006b5b] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-[#f8f9ff] dark:bg-slate-800/70 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-700/60 cursor-pointer select-none">
                <div>
                  <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block">
                    Community Review Activity
                  </span>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                    Notify when members find your review helpful or reply
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.reviewReplies}
                  onChange={(e) =>
                    setNotifications((prev) => ({ ...prev, reviewReplies: e.target.checked }))
                  }
                  className="rounded text-[#006b5b] focus:ring-[#006b5b] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Reset Action */}
          {onResetData && (
            <div className="pt-2 border-t border-[#c3c6ce]/30 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block">
                    Reset Local App State
                  </span>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                    Restore initial sample products, wishlist and alerts
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-3 py-1.5 text-xs text-[#ba1a1a] dark:text-rose-400 font-semibold border border-[#ba1a1a]/30 dark:border-rose-500/30 rounded-lg hover:bg-[#ffdad6]/40 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          )}

          {/* Footer Submit Button */}
          <div className="pt-3 flex items-center justify-between border-t border-[#c3c6ce]/30 dark:border-slate-800">
            {savedSuccess ? (
              <span className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                <Check className="w-4 h-4" /> Preferences saved!
              </span>
            ) : (
              <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                Stored securely on your browser
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 text-xs font-semibold text-[#74777e] hover:text-[#000c1b] dark:hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-save-settings"
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-[#006b5b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] rounded-xl text-xs font-bold hover:bg-[#005245] dark:hover:bg-[#1de9b6] shadow-xs cursor-pointer transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

