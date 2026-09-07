import React from 'react';
import { Menu, Search, Plus, Heart, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { UserProfileMenu } from './UserProfileMenu';
import { CuratedPickLogo } from './CuratedPickLogo';

interface HeaderProps {
  savedCount?: number;
  alertsCount?: number;
  reviewsCount?: number;
  user: UserProfile;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onNavigateToSaved?: () => void;
  onNavigateToAddProduct: () => void;
  onNavigateToAdminDashboard?: () => void;
  onNavigateHome: () => void;
  onOpenActivity: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  savedCount = 0,
  alertsCount = 0,
  reviewsCount = 0,
  user,
  onOpenDrawer,
  onOpenSearch,
  onNavigateToSaved,
  onNavigateToAddProduct,
  onNavigateToAdminDashboard,
  onNavigateHome,
  onOpenActivity,
  onOpenSettings,
  onLogout,
  onLogin,
}) => {
  const isAdmin = user.isLoggedIn && user.role === 'admin';

  return (
    <header
      id="top-app-bar"
      className="fixed top-0 left-0 w-full z-40 bg-[#f8f9ff]/95 dark:bg-[#070e17]/95 backdrop-blur-md border-b border-[#c3c6ce]/30 dark:border-slate-800 shadow-xs flex justify-between items-center px-3 sm:px-4 md:px-8 h-14 sm:h-15 transition-all duration-300"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          id="btn-header-menu"
          onClick={onOpenDrawer}
          aria-label="Open Navigation Menu"
          className="text-[#006b5b] dark:text-[#26fedc] hover:text-[#000c1b] dark:hover:text-white p-1.5 rounded-full hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-all transform active:scale-90 cursor-pointer"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <button
          id="btn-header-logo"
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-left group cursor-pointer"
        >
          <CuratedPickLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="font-bold text-base sm:text-lg md:text-xl tracking-tight text-[#000c1b] dark:text-slate-100">
            The Curated Pick
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
        <button
          id="btn-header-search"
          onClick={onOpenSearch}
          aria-label="Search items"
          className="text-[#006b5b] dark:text-[#26fedc] hover:text-[#000c1b] dark:hover:text-white p-1 sm:p-1.5 rounded-full hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-all transform active:scale-90 cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {onNavigateToSaved && (
          <button
            id="btn-header-wishlist"
            onClick={onNavigateToSaved}
            aria-label="View Saved Wishlist"
            className="relative text-[#006b5b] dark:text-[#26fedc] hover:text-[#93000a] dark:hover:text-rose-400 p-1 sm:p-1.5 rounded-full hover:bg-[#e5eeff] dark:hover:bg-slate-800 transition-all transform active:scale-90 cursor-pointer"
            title="Saved Items"
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                savedCount > 0 ? 'fill-[#93000a] text-[#93000a]' : ''
              }`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#93000a] text-white text-[8px] font-bold rounded-full w-3 h-3 flex items-center justify-center shadow-xs">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </button>
        )}

        {/* Add Product Shortcut (Only visible to Admin role; small and compact) */}
        {isAdmin && (
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              id="btn-header-add-product"
              onClick={onNavigateToAddProduct}
              className="flex items-center gap-1 bg-[#26fedc] hover:bg-[#1de9ca] text-[#000c1b] font-bold text-[10px] sm:text-[10.5px] px-2 py-0.5 rounded-md shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              title="Add New Curated Product"
            >
              <Plus className="w-2.5 h-2.5" />
              <span>Add</span>
            </button>
          </div>
        )}

        {/* User Profile Menu with Avatar */}
        <UserProfileMenu
          user={user}
          savedCount={savedCount}
          alertsCount={alertsCount}
          reviewsCount={reviewsCount}
          onOpenActivity={onOpenActivity}
          onOpenSettings={onOpenSettings}
          onOpenAdminDashboard={onNavigateToAdminDashboard}
          onLogout={onLogout}
          onLogin={onLogin}
        />
      </div>
    </header>
  );
};


