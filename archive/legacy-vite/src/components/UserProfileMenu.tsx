import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Activity,
  Settings,
  LogOut,
  LogIn,
  Heart,
  BellRing,
  Star,
  ChevronDown,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileMenuProps {
  user: UserProfile;
  savedCount: number;
  alertsCount: number;
  reviewsCount: number;
  onOpenActivity: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  savedCount,
  alertsCount,
  reviewsCount,
  onOpenActivity,
  onOpenSettings,
  onLogout,
  onLogin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Derived initials for placeholder avatar
  const initials = user.isLoggedIn
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'CU'
    : 'GU';

  return (
    <div className="relative flex items-center" ref={menuRef}>
      {/* Sign In Pill Button (shown when user is browsing in Guest Mode) */}
      {!user.isLoggedIn && (
        <button
          id="btn-header-optional-login"
          type="button"
          onClick={onLogin}
          className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#d8e6ff] dark:hover:bg-slate-700 border border-[#26fedc]/60 transition-all cursor-pointer mr-1 shadow-2xs hover:shadow-xs"
          title="Sign in to your account"
        >
          <LogIn className="w-3 h-3" />
          <span>Sign In</span>
        </button>
      )}

      {/* Header Avatar Button */}
      <button
        id="btn-user-profile-menu"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User profile and account menu"
        className="flex items-center gap-1 p-0.5 rounded-full hover:bg-[#e5eeff] dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/40 transition-all cursor-pointer group"
      >
        <div className="relative">
          {user.isLoggedIn ? (
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#000c1b] to-[#005245] text-[#26fedc] flex items-center justify-center font-bold text-xs shadow-2xs ring-1.5 ring-white dark:ring-slate-800 group-hover:ring-[#26fedc] transition-all">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#eff4ff] dark:bg-slate-800 text-[#74777e] dark:text-slate-300 border border-[#c3c6ce]/60 dark:border-slate-700 flex items-center justify-center shadow-2xs group-hover:border-[#006b5b]">
              <User className="w-3.5 h-3.5 text-[#74777e] dark:text-slate-300 group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc]" />
            </div>
          )}

          {/* Status Indicator Dot */}
          {user.isLoggedIn ? (
            <span
              className="absolute bottom-0 right-0 w-2 h-2 bg-[#26fedc] border-1.5 border-white dark:border-slate-900 rounded-full"
              title="Signed In as Curated Member"
            />
          ) : (
            <span
              className="absolute bottom-0 right-0 w-2 h-2 bg-[#006b5b] border-1.5 border-white dark:border-slate-900 rounded-full"
              title="Guest Mode (No login required)"
            />
          )}
        </div>

        <ChevronDown
          className={`w-3 h-3 text-[#74777e] dark:text-slate-400 group-hover:text-[#000c1b] dark:group-hover:text-white transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div
          id="user-profile-dropdown"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#0b1726] rounded-2xl shadow-xl border border-[#c3c6ce]/50 dark:border-slate-800 py-2 z-50 animate-scaleUp divide-y divide-[#c3c6ce]/20 dark:divide-slate-800"
        >
          {/* User Profile Card Section */}
          <div className="p-3.5 bg-gradient-to-br from-[#eff4ff]/80 to-[#f8f9ff] dark:from-[#112338] dark:to-[#0b1726]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#000c1b] to-[#005245] text-[#26fedc] flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ring-2 ring-[#26fedc]/40">
                {user.isLoggedIn ? (
                  user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#000c1b] dark:text-slate-100 truncate">
                    {user.isLoggedIn ? user.name : 'Guest Explorer'}
                  </h4>
                  {user.isLoggedIn && (
                    <span title="Verified Member" className="inline-flex">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc] shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#74777e] dark:text-slate-400 truncate">
                  {user.isLoggedIn ? user.email : 'No account required'}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-2 py-0.5 rounded w-fit">
                  <span>{user.isLoggedIn ? 'Curated Member' : 'Guest'}</span>
                </div>
              </div>
            </div>

            {/* Quick Guest Reassurance Banner when not logged in */}
            {!user.isLoggedIn && (
              <div className="mt-2.5 p-2 bg-[#26fedc]/15 dark:bg-[#26fedc]/10 border border-[#26fedc]/40 dark:border-[#26fedc]/30 rounded-xl text-[11px] text-[#004d40] dark:text-[#26fedc] leading-snug">
                <strong>Guest Mode:</strong> You can browse, bookmark items, and write reviews freely.
              </div>
            )}

            {/* Quick Activity Metric Chips */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 bg-white/90 dark:bg-[#132338] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#000c1b] dark:text-slate-100">
                  <Heart className="w-3 h-3 text-[#93000a] fill-[#93000a]" />
                  <span>{savedCount}</span>
                </div>
                <span className="text-[10px] text-[#74777e] dark:text-slate-400">Saved</span>
              </div>

              <div className="p-1.5 bg-white/90 dark:bg-[#132338] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#000c1b] dark:text-slate-100">
                  <BellRing className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" />
                  <span>{alertsCount}</span>
                </div>
                <span className="text-[10px] text-[#74777e] dark:text-slate-400">Alerts</span>
              </div>

              <div className="p-1.5 bg-white/90 dark:bg-[#132338] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#000c1b] dark:text-slate-100">
                  <Star className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" />
                  <span>{reviewsCount}</span>
                </div>
                <span className="text-[10px] text-[#74777e] dark:text-slate-400">Reviews</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-1.5 space-y-0.5">
            {/* My Activity Item */}
            <button
              id="menu-item-activity"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenActivity();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 text-[#000c1b] dark:text-slate-200 transition-colors group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-[#eff4ff] dark:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] group-hover:bg-[#006b5b] group-hover:text-white transition-colors">
                <Activity className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold block">My Activity</span>
                <span className="text-[11px] text-[#74777e] dark:text-slate-400 block">
                  Wishlist, price alerts & reviews
                </span>
              </div>
            </button>

            {/* Settings Item */}
            <button
              id="menu-item-settings"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#eff4ff] dark:hover:bg-slate-800/80 text-[#000c1b] dark:text-slate-200 transition-colors group cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-[#eff4ff] dark:bg-slate-800 text-[#006b5b] dark:text-[#26fedc] group-hover:bg-[#006b5b] group-hover:text-white transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs sm:text-sm font-bold block">Settings</span>
                <span className="text-[11px] text-[#74777e] dark:text-slate-400 block">
                  Theme, profile, currency & alerts
                </span>
              </div>
            </button>

          </div>

          {/* Simulated Login / Logout Item */}
          <div className="p-1.5">
            {user.isLoggedIn ? (
              <button
                id="menu-item-logout"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-[#ffdad6]/40 dark:hover:bg-red-950/30 text-[#ba1a1a] dark:text-rose-400 transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[#ffdad6]/50 dark:bg-red-950/50 text-[#ba1a1a] dark:text-rose-400 group-hover:bg-[#ba1a1a] group-hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold block">Log Out</span>
                  <span className="text-[11px] text-[#ba1a1a]/80 dark:text-rose-400/80 block">
                    Switch to guest browsing mode
                  </span>
                </div>
              </button>
            ) : (
              <button
                id="menu-item-login"
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onLogin();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left bg-[#26fedc]/20 dark:bg-[#26fedc]/15 hover:bg-[#26fedc]/40 dark:hover:bg-[#26fedc]/25 text-[#006b5b] dark:text-[#26fedc] transition-colors group cursor-pointer"
              >
                <div className="p-2 rounded-lg bg-[#006b5b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] transition-colors">
                  <LogIn className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-bold block">
                    Sign In
                  </span>
                  <span className="text-[11px] text-[#006b5b]/80 dark:text-[#26fedc]/80 block">
                    Sync your saved wishlist and preferences
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

