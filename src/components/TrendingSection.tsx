import React from 'react';
import { Star, ShoppingCart, ExternalLink, Heart } from 'lucide-react';
import { Product } from '../types';
import { PriceTrendBadge } from './PriceTrendBadge';
import { ProductShareButton } from './ProductShareButton';

interface TrendingSectionProps {
  products: Product[];
  savedProductIds?: string[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  onViewAll: () => void;
  onNotify?: (message: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  products,
  savedProductIds = [],
  onSelectProduct,
  onToggleWishlist,
  onViewAll,
  onNotify,
}) => {
  return (
    <section className="py-6 md:py-8">
      <div className="px-4 md:px-8 mb-3 md:mb-4 flex justify-between items-end">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#000c1b] dark:text-slate-100 tracking-tight">
            Trending Now
          </h2>
          <p className="text-xs md:text-sm text-[#43474d] dark:text-slate-300 hidden sm:block">
            Top converted picks with highest buyer satisfaction ratings
          </p>
        </div>
        <button
          id="btn-trending-view-all"
          onClick={onViewAll}
          className="text-xs md:text-sm font-semibold text-[#006b5b] dark:text-[#26fedc] hover:text-[#000c1b] dark:hover:text-white hover:underline flex items-center gap-1 cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:px-8 gap-3 md:gap-4 pb-4 -mb-2">
        {products.map((product) => {
          const isSaved = savedProductIds.includes(product.id);

          return (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              onClick={() => onSelectProduct(product)}
              className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px] max-w-[280px] snap-center bg-white dark:bg-[#0e1c2e] rounded-xl p-3 shadow-[0_4px_20px_rgba(0,12,27,0.04)] hover:shadow-[0_8px_30px_rgba(0,12,27,0.08)] border border-[#c3c6ce]/30 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 cursor-pointer group hover:-translate-y-0.5"
            >
              <div>
                {/* Image Container */}
                <div className="w-full h-36 md:h-40 bg-[#e5eeff] dark:bg-slate-800 rounded-lg mb-3 overflow-hidden relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Badge */}
                  {product.tag ? (
                    <div
                      className={`absolute top-2 left-2 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                        product.tagType === 'deal'
                          ? 'bg-[#ffdad6] text-[#93000a]'
                          : 'bg-[#26fedc] text-[#006b5b]'
                      }`}
                    >
                      {product.tag}
                    </div>
                  ) : null}

                  {/* Share & Wishlist Controls */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                    <ProductShareButton
                      product={product}
                      variant="overlay"
                      onNotify={onNotify}
                    />

                    {onToggleWishlist && (
                      <button
                        id={`btn-wishlist-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product.id);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-xs transition-all duration-200 shadow-xs cursor-pointer ${
                          isSaved
                            ? 'bg-white text-[#93000a] scale-110 shadow-md'
                            : 'bg-white/80 hover:bg-white text-[#74777e] hover:text-[#93000a] opacity-85 group-hover:opacity-100 hover:scale-110'
                        }`}
                        title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                        aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform active:scale-75 ${
                            isSaved ? 'fill-[#93000a] text-[#93000a]' : 'text-current'
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Quick Amazon Tag */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Amazon</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Product Info */}
                <div className="px-1">
                  <div className="text-[11px] font-medium text-[#74777e] dark:text-slate-400 uppercase tracking-wider mb-0.5">
                    {product.category}
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-[#000c1b] dark:text-slate-100 truncate group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc] transition-colors">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center mt-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-[#006b5b] text-[#006b5b] dark:fill-[#26fedc] dark:text-[#26fedc]" />
                    <span className="text-xs text-[#43474d] dark:text-slate-300 ml-1 font-medium">
                      {product.rating} ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="px-1 pt-2 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between mt-auto">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base md:text-lg font-bold text-[#000c1b] dark:text-white">
                      ${product.price}
                    </span>
                    <PriceTrendBadge product={product} />
                  </div>
                  {product.originalPrice && product.originalPrice > product.price ? (
                    <span className="text-xs text-[#74777e] dark:text-slate-400 line-through font-normal">
                      ${product.originalPrice}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1.5">
                  <ProductShareButton
                    product={product}
                    variant="footer"
                    onNotify={onNotify}
                  />

                  <button
                    id={`btn-cart-${product.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(product);
                    }}
                    className="bg-[#006b5b]/10 dark:bg-[#26fedc]/15 text-[#006b5b] dark:text-[#26fedc] hover:bg-[#26fedc] hover:text-[#000c1b] dark:hover:bg-[#26fedc] dark:hover:text-[#000c1b] rounded-full p-2 transition-all duration-200 shadow-xs cursor-pointer"
                    title="View Deal & Affiliate Details"
                    aria-label={`View deal for ${product.name}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

