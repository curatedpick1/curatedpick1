import React, { useState } from 'react';
import {
  Heart,
  ShoppingCart,
  Trash2,
  ExternalLink,
  Star,
  ArrowRight,
  ShieldCheck,
  Tag,
  Zap,
  Sparkles,
  Bell,
  BellRing,
} from 'lucide-react';
import { Product, PriceAlertConfig } from '../types';
import { PriceTrendBadge } from './PriceTrendBadge';
import { ProductShareButton } from './ProductShareButton';

interface SavedViewProps {
  savedProducts: Product[];
  priceAlerts?: Record<string, PriceAlertConfig>;
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (productId: string) => void;
  onOpenPriceAlert?: (product: Product) => void;
  onNavigateHome: () => void;
  onClearAllSaved?: () => void;
  onNotify?: (message: string) => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedProducts,
  priceAlerts = {},
  onSelectProduct,
  onToggleWishlist,
  onOpenPriceAlert,
  onNavigateHome,
  onClearAllSaved,
  onNotify,
}) => {
  const [filterCategory, setFilterCategory] = useState('All');

  // Calculate totals
  const totalPrice = savedProducts.reduce((sum, p) => sum + p.price, 0);
  const totalOriginalPrice = savedProducts.reduce(
    (sum, p) => sum + (p.originalPrice || p.price),
    0
  );
  const totalSavings = Math.max(0, totalOriginalPrice - totalPrice);

  const categories = [
    'All',
    ...Array.from(new Set(savedProducts.map((p) => p.category))),
  ];

  const filteredItems =
    filterCategory === 'All'
      ? savedProducts
      : savedProducts.filter(
          (p) => p.category.toLowerCase() === filterCategory.toLowerCase()
        );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#c3c6ce]/30 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#ffdad6]/60 dark:bg-rose-500/20 text-[#93000a] dark:text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#000c1b] dark:text-white tracking-tight">
              Saved Wishlist
            </h1>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#006b5b]/10 dark:bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc]">
              {savedProducts.length} {savedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-400 mt-1">
            Keep track of your favorite curated picks, monitor deals, and access affiliate pricing anytime.
          </p>
        </div>

        {savedProducts.length > 0 && onClearAllSaved && (
          <button
            onClick={onClearAllSaved}
            className="self-start sm:self-center text-xs font-semibold text-[#74777e] dark:text-slate-400 hover:text-[#93000a] dark:hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700 hover:bg-[#ffdad6]/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {savedProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#0e1c2e] rounded-2xl border border-[#c3c6ce]/30 dark:border-slate-800 p-8 sm:p-12 text-center shadow-xs my-6 flex flex-col items-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#ffdad6]/40 dark:bg-rose-500/20 flex items-center justify-center text-[#93000a] dark:text-rose-400 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#000c1b] dark:text-white mb-2">
            Your Wishlist is Empty
          </h2>
          <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-400 leading-relaxed mb-6">
            Tap the heart icon on any curated product card to save items here for fast comparison, price tracking, and quick checkout.
          </p>
          <button
            id="btn-empty-saved-explore"
            onClick={onNavigateHome}
            className="bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold px-6 py-3 rounded-xl text-sm shadow-xs hover:shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Trending Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stats Card */}
          <div className="bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] dark:from-[#112338] dark:to-[#0b1726] rounded-2xl p-4 sm:p-5 border border-[#c3c6ce]/30 dark:border-slate-800 shadow-2xs mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 bg-white/80 dark:bg-[#132338]/80 rounded-xl border border-[#c3c6ce]/20 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e] dark:text-slate-400 block">
                Total Wishlist Value
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-[#000c1b] dark:text-white">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-white/80 dark:bg-[#132338]/80 rounded-xl border border-[#c3c6ce]/20 dark:border-slate-700">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e] dark:text-slate-400 block">
                Potential Savings
              </span>
              <span className="text-lg sm:text-xl font-extrabold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1">
                ${totalSavings.toFixed(2)}
                {totalSavings > 0 && (
                  <span className="text-[10px] bg-[#26fedc]/40 text-[#006b5b] dark:text-[#000c1b] px-1.5 py-0.2 rounded font-bold">
                    Deal
                  </span>
                )}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 bg-white/80 dark:bg-[#132338]/80 rounded-xl border border-[#c3c6ce]/20 dark:border-slate-700 flex flex-col justify-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#74777e] dark:text-slate-400 block">
                Editorial Guarantee
              </span>
              <span className="text-xs font-semibold text-[#006b5b] dark:text-[#26fedc] flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Tested Picks
              </span>
            </div>
          </div>

          {/* Category Filter Pills (if multiple categories) */}
          {categories.length > 2 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] shadow-xs'
                      : 'bg-white dark:bg-[#132338] text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/30 dark:border-slate-700 hover:bg-[#eff4ff] dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Saved Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((product) => (
              <div
                key={product.id}
                id={`saved-card-${product.id}`}
                onClick={() => onSelectProduct(product)}
                className="bg-white dark:bg-[#0e1c2e] rounded-xl p-3.5 shadow-[0_4px_20px_rgba(0,12,27,0.04)] hover:shadow-[0_8px_30px_rgba(0,12,27,0.08)] border border-[#c3c6ce]/30 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:-translate-y-0.5 relative"
              >
                <div>
                  {/* Image & Badges */}
                  <div className="w-full h-44 bg-[#e5eeff] dark:bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Tag badge */}
                    {product.tag && (
                      <div
                        className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                          product.tagType === 'deal'
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : 'bg-[#26fedc] text-[#006b5b]'
                        }`}
                      >
                        {product.tag}
                      </div>
                    )}

                    {/* Heart/Wishlist, Compare & Price Alert Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <ProductShareButton
                        product={product}
                        variant="overlay"
                        onNotify={onNotify}
                      />
                      {onOpenPriceAlert && (
                        <button
                          id={`btn-saved-price-alert-${product.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenPriceAlert(product);
                          }}
                          className={`p-1.5 rounded-full shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                            priceAlerts[product.id]?.enabled
                              ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b]'
                              : 'bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-[#74777e] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc]'
                          }`}
                          title={
                            priceAlerts[product.id]?.enabled
                              ? `Alert set at $${priceAlerts[product.id].targetPrice}`
                              : 'Set Price Drop Alert'
                          }
                          aria-label="Set price drop alert"
                        >
                          {priceAlerts[product.id]?.enabled ? (
                            <BellRing className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Bell className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        id={`btn-remove-saved-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className="p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-[#93000a] shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        title="Remove from saved"
                        aria-label="Remove from wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-[#93000a]" />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="px-1">
                    <div className="text-[11px] font-medium text-[#74777e] dark:text-slate-400 uppercase tracking-wider mb-0.5">
                      {product.category}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-[#000c1b] dark:text-white group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc] transition-colors line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center mt-1 mb-2">
                      <Star className="w-3.5 h-3.5 fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]" />
                      <span className="text-xs text-[#43474d] dark:text-slate-300 ml-1 font-medium">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>

                    <p className="text-xs text-[#43474d] dark:text-slate-400 line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="px-1 pt-2.5 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between mt-auto">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-white">
                        ${product.price}
                      </span>
                      <PriceTrendBadge product={product} />
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xs text-[#74777e] dark:text-slate-400 line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ProductShareButton
                      product={product}
                      variant="footer"
                      onNotify={onNotify}
                    />

                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-2xs hover:scale-105"
                    >
                      <span>Buy</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
