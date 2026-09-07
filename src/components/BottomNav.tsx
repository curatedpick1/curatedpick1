import React from 'react';
import { Home, Star, Tag, BookOpen, Heart, ShieldCheck } from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';

interface BottomNavProps {
  currentTab: NavigationTab;
  savedCount?: number;
  user?: UserProfile;
  onSelectTab: (tab: NavigationTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  savedCount = 0,
  user,
  onSelectTab,
}) => {
  const isAdmin = Boolean(user?.isLoggedIn && user?.role === 'admin');

  return (
    <nav
      id="bottom-nav-bar"
      className="fixed bottom-0 left-0 w-full z-40 bg-[#f8f9ff]/95 dark:bg-[#0b1726]/95 backdrop-blur-lg border-t border-[#c3c6ce]/40 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,12,27,0.05)] rounded-t-2xl flex justify-around items-center py-2 px-2 md:hidden pb-safe"
    >
      {/* Home Tab */}
      <button
        id="nav-tab-home"
        onClick={() => onSelectTab('home')}
        className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1.5 transition-all text-[11px] font-semibold ${
          currentTab === 'home'
            ? 'bg-[#26fedc] text-[#000c1b] shadow-xs scale-100 font-bold'
            : 'text-[#43474d] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
        }`}
      >
        <Home className="w-4 h-4 mb-0.5" />
        <span>Home</span>
      </button>

      {/* Reviews Tab */}
      <button
        id="nav-tab-reviews"
        onClick={() => onSelectTab('reviews')}
        className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1.5 transition-all text-[11px] font-semibold ${
          currentTab === 'reviews'
            ? 'bg-[#26fedc] text-[#000c1b] shadow-xs scale-100 font-bold'
            : 'text-[#43474d] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
        }`}
      >
        <Star className="w-4 h-4 mb-0.5" />
        <span>Reviews</span>
      </button>

      {/* Deals Tab */}
      <button
        id="nav-tab-deals"
        onClick={() => onSelectTab('deals')}
        className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1.5 transition-all text-[11px] font-semibold ${
          currentTab === 'deals'
            ? 'bg-[#26fedc] text-[#000c1b] shadow-xs scale-100 font-bold'
            : 'text-[#43474d] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
        }`}
      >
        <Tag className="w-4 h-4 mb-0.5" />
        <span>Deals</span>
      </button>

      {/* Saved / Wishlist Tab */}
      <button
        id="nav-tab-saved"
        onClick={() => onSelectTab('saved')}
        className={`relative flex flex-col items-center justify-center rounded-full px-2.5 py-1.5 transition-all text-[11px] font-semibold ${
          currentTab === 'saved'
            ? 'bg-[#26fedc] text-[#000c1b] shadow-xs scale-100 font-bold'
            : 'text-[#43474d] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
        }`}
      >
        <Heart
          className={`w-4 h-4 mb-0.5 ${
            currentTab === 'saved' || savedCount > 0
              ? 'fill-[#93000a] text-[#93000a]'
              : ''
          }`}
        />
        <span>Saved</span>
        {savedCount > 0 && (
          <span className="absolute 1 top-0 right-1.5 bg-[#93000a] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
            {savedCount > 9 ? '9+' : savedCount}
          </span>
        )}
      </button>

      {/* Blog Tab */}
      <button
        id="nav-tab-blog"
        onClick={() => onSelectTab('blog')}
        className={`flex flex-col items-center justify-center rounded-full px-2.5 py-1.5 transition-all text-[11px] font-semibold ${
          currentTab === 'blog'
            ? 'bg-[#26fedc] text-[#000c1b] shadow-xs scale-100 font-bold'
            : 'text-[#43474d] dark:text-slate-300 hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
        }`}
      >
        <BookOpen className="w-4 h-4 mb-0.5" />
        <span>Guides</span>
      </button>

      {/* Admin Tab (Only visible to Admin role on mobile) */}
      {isAdmin && (
        <button
          id="nav-tab-admin"
          onClick={() => onSelectTab('admin-dashboard')}
          className={`flex flex-col items-center justify-center rounded-full px-2 py-1.5 transition-all text-[11px] font-semibold ${
            currentTab === 'admin-dashboard' || currentTab === 'add-product'
              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-xs scale-100 font-bold'
              : 'text-[#006b5b] dark:text-[#26fedc] hover:bg-[#e5eeff] dark:hover:bg-slate-800 scale-95'
          }`}
        >
          <ShieldCheck className="w-4 h-4 mb-0.5" />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};

