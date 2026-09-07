import React from 'react';
import {
  X,
  Home,
  Star,
  Tag,
  BookOpen,
  PlusCircle,
  ShieldCheck,
  ExternalLink,
  Layers,
  Sparkles,
  Heart,
  Activity,
  Settings,
  User,
  LogIn,
} from 'lucide-react';
import { NavigationTab, UserProfile } from '../types';
import { CuratedPickLogo } from './CuratedPickLogo';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavigationTab;
  savedCount?: number;
  onSelectTab: (tab: NavigationTab) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenDisclosure: () => void;
  user?: UserProfile;
  onOpenActivity?: () => void;
  onOpenSettings?: () => void;
  onLogin?: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  savedCount = 0,
  onSelectTab,
  categories,
  selectedCategory,
  onSelectCategory,
  onOpenDisclosure,
  user,
  onOpenActivity,
  onOpenSettings,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000c1b]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-[#0b1726] text-[#000c1b] dark:text-slate-100 h-full shadow-2xl flex flex-col z-10 animate-slideRight border-r border-[#c3c6ce]/30 dark:border-slate-800">
        {/* Drawer Header */}
        <div className="p-4 border-b border-[#eff4ff] dark:border-slate-800 flex items-center justify-between bg-[#f8f9ff] dark:bg-[#112338]">
          <div className="flex items-center gap-2">
            <CuratedPickLogo className="w-6 h-6 shrink-0" />
            <span className="font-bold text-base text-[#000c1b] dark:text-white">
              The Curated Pick
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000c1b] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-full hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* User Profile Quick Banner */}
          {user && (
            <div className="p-3 bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] dark:from-[#112338] dark:to-[#0b1726] rounded-2xl border border-[#c3c6ce]/40 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#000c1b] text-[#26fedc] flex items-center justify-center font-bold text-xs ring-2 ring-[#26fedc]/30">
                  {user.isLoggedIn
                    ? user.name.slice(0, 2).toUpperCase()
                    : 'GU'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-[#000c1b] dark:text-slate-100 block truncate">
                    {user.isLoggedIn ? user.name : 'Guest User'}
                  </span>
                  <span className="text-[10px] text-[#006b5b] dark:text-[#26fedc] font-semibold bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-1.5 py-0.5 rounded inline-block">
                    {user.isLoggedIn ? 'Curated Member' : 'Guest Mode'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {onOpenActivity && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenActivity();
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-[#132338] rounded-lg border border-[#c3c6ce]/40 dark:border-slate-700 text-[11px] font-bold text-[#000c1b] dark:text-slate-200 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:border-[#006b5b]/50 transition-colors cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                    <span>My Activity</span>
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenSettings();
                    }}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 bg-white dark:bg-[#132338] rounded-lg border border-[#c3c6ce]/40 dark:border-slate-700 text-[11px] font-bold text-[#000c1b] dark:text-slate-200 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:border-[#006b5b]/50 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                    <span>Settings</span>
                  </button>
                )}
              </div>

              {!user.isLoggedIn && onLogin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogin();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#000c1b] dark:bg-[#26fedc] hover:bg-[#006b5b] dark:hover:bg-[#1de9b6] text-[#26fedc] dark:text-[#000c1b] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          )}

          {/* Main Navigation */}
          <div>
            <span className="text-[11px] font-bold text-[#74777e] dark:text-slate-400 uppercase tracking-wider block mb-2 px-2">
              Navigation
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onSelectTab('home');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === 'home'
                    ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                    : 'text-[#43474d] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home Discovery</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('saved');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === 'saved'
                    ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                    : 'text-[#43474d] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart
                    className={`w-4 h-4 ${
                      savedCount > 0 ? 'fill-[#93000a] text-[#93000a]' : ''
                    }`}
                  />
                  <span>Saved Wishlist</span>
                </div>
                {savedCount > 0 && (
                  <span className="bg-[#93000a] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onSelectTab('reviews');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === 'reviews'
                    ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                    : 'text-[#43474d] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Expert Reviews</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('deals');
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === 'deals'
                    ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                    : 'text-[#43474d] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Exclusive Deals</span>
              </button>

              <button
                onClick={() => {
                  onSelectTab('blog');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  currentTab === 'blog'
                    ? 'bg-[#26fedc] text-[#000c1b] font-bold'
                    : 'text-[#43474d] dark:text-slate-300 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4" />
                  <span>Buying Guides & Blogs</span>
                </div>
                <span className="text-[10px] bg-[#000c1b]/10 dark:bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc] font-bold px-1.5 py-0.5 rounded">
                  Articles
                </span>
              </button>

              {/* Admin Portal & Controls (Only visible to Admin role) */}
              {user?.isLoggedIn && user?.role === 'admin' && (
                <div className="pt-2 mt-2 border-t border-[#c3c6ce]/30 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] px-3 block">
                    Admin Tools
                  </span>

                  <button
                    id="btn-drawer-admin-dashboard"
                    onClick={() => {
                      onSelectTab('admin-dashboard');
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentTab === 'admin-dashboard'
                        ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-xs'
                        : 'text-[#000c1b] dark:text-white bg-[#26fedc]/15 hover:bg-[#26fedc]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </div>
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#000c1b] text-[#26fedc] dark:bg-white dark:text-[#000c1b]">
                      Telemetry
                    </span>
                  </button>

                  <button
                    id="btn-drawer-add-product"
                    onClick={() => {
                      onSelectTab('add-product');
                      onClose();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'add-product'
                        ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] font-bold'
                        : 'text-[#006b5b] dark:text-[#26fedc] hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add New Product</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Categories Quick Filter */}
          <div>
            <span className="text-[11px] font-bold text-[#74777e] dark:text-slate-400 uppercase tracking-wider block mb-2 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Filter by Category
            </span>
            <div className="flex flex-wrap gap-1.5 px-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    onSelectTab('home');
                    onClose();
                  }}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] font-bold'
                      : 'bg-[#eff4ff] dark:bg-slate-800 text-[#43474d] dark:text-slate-300 hover:bg-[#dce9ff] dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Trust & Transparency */}
          <div className="p-3.5 bg-[#eff4ff] dark:bg-[#132338] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#000c1b] dark:text-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#006b5b] dark:text-[#26fedc]" />
              <span>100% Independent Editorial</span>
            </div>
            <p className="text-[11px] text-[#43474d] dark:text-slate-300 leading-relaxed">
              We never accept paid rankings. Every product is rigorously tested.
            </p>
            <button
              onClick={() => {
                onOpenDisclosure();
                onClose();
              }}
              className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] hover:underline block pt-1 cursor-pointer"
            >
              Read Affiliate Disclosure →
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#eff4ff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-[#112338] text-center">
          <div className="text-xs text-[#74777e] dark:text-slate-400">
            © 2026 The Curated Pick.
          </div>
        </div>
      </div>
    </div>
  );
};
