import React from 'react';
import {
  X,
  Scale,
  Star,
  ExternalLink,
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Zap,
  Trash2,
} from 'lucide-react';
import { Product } from '../types';
import { PriceTrendBadge } from './PriceTrendBadge';
import { ProductShareButton } from './ProductShareButton';

interface CompareModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onClearAll: () => void;
  onSelectProductDetails: (product: Product) => void;
  onProductClickTrack?: (productId: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct,
  onClearAll,
  onSelectProductDetails,
  onProductClickTrack,
}) => {
  if (!isOpen || products.length === 0) return null;

  const lowestPrice = Math.min(...products.map((p) => p.price));
  const highestRating = Math.max(...products.map((p) => p.rating));

  const handleShopLink = (product: Product) => {
    if (onProductClickTrack) {
      onProductClickTrack(product.id);
    }
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#000c1b]/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-[0_25px_60px_rgba(0,12,27,0.3)] border border-[#c3c6ce]/40 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#eff4ff] to-[#f8f9ff] border-b border-[#c3c6ce]/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#26fedc]/30 text-[#006b5b]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-[#000c1b]">
                  Product Comparison
                </h3>
                <span className="text-xs font-bold bg-[#000c1b] text-[#26fedc] px-2 py-0.5 rounded-full">
                  {products.length} of 3
                </span>
              </div>
              <p className="text-xs text-[#74777e] font-medium hidden sm:block">
                Side-by-side feature, price, and specs comparison
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-compare-clear-all"
              onClick={onClearAll}
              className="text-xs font-semibold text-[#93000a] hover:bg-[#ffdad6]/40 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title="Clear all compared items"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
            <button
              id="btn-compare-close"
              onClick={onClose}
              className="text-[#74777e] hover:text-[#000c1b] p-1.5 rounded-full hover:bg-white transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table Container */}
        <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          <div className="min-w-[580px]">
            {/* Table Grid Header: Product Overview Cards */}
            <div
              className={`grid gap-4 ${
                products.length === 1
                  ? 'grid-cols-1'
                  : products.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3'
              }`}
            >
              {products.map((product) => {
                const isBestPrice = product.price === lowestPrice && products.length > 1;
                const isTopRated = product.rating === highestRating && products.length > 1;

                return (
                  <div
                    key={product.id}
                    id={`compare-card-${product.id}`}
                    className="bg-[#f8f9ff] rounded-2xl p-4 border border-[#c3c6ce]/30 flex flex-col justify-between relative group hover:border-[#26fedc] transition-all"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute top-2.5 right-2.5 p-1 rounded-full bg-white text-[#74777e] hover:text-[#93000a] shadow-xs hover:bg-[#ffdad6]/40 transition-colors z-10"
                      title="Remove from comparison"
                      aria-label="Remove product"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div>
                      {/* Product Image */}
                      <div
                        onClick={() => onSelectProductDetails(product)}
                        className="w-full h-36 sm:h-44 bg-white rounded-xl mb-3 overflow-hidden flex items-center justify-center p-2 cursor-pointer relative"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                        {product.tag && (
                          <div className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#26fedc] text-[#006b5b]">
                            {product.tag}
                          </div>
                        )}
                      </div>

                      {/* Badges for Best in Compare */}
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {isBestPrice && (
                          <span className="text-[10px] font-extrabold bg-[#e5eeff] text-[#006b5b] px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#006b5b]/20">
                            <TrendingDown className="w-3 h-3" /> Best Price
                          </span>
                        )}
                        {isTopRated && (
                          <span className="text-[10px] font-extrabold bg-[#26fedc]/30 text-[#000c1b] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star className="w-3 h-3 fill-[#006b5b] text-[#006b5b]" /> Highest Rated
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-[#74777e] uppercase tracking-wider">
                        {product.category}
                      </div>

                      <h4
                        onClick={() => onSelectProductDetails(product)}
                        className="text-sm font-bold text-[#000c1b] hover:text-[#006b5b] cursor-pointer line-clamp-2 mt-0.5"
                        title={product.name}
                      >
                        {product.name}
                      </h4>
                    </div>

                    {/* Price and Action Button */}
                    <div className="pt-3 mt-3 border-t border-[#c3c6ce]/30 flex flex-col gap-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-extrabold text-[#000c1b]">
                          ${product.price}
                        </span>
                        <PriceTrendBadge product={product} size="sm" />
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-[#74777e] line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectProductDetails(product)}
                          className="py-2 px-1 text-xs font-bold rounded-xl bg-white border border-[#c3c6ce]/40 hover:bg-[#eff4ff] text-[#000c1b] text-center transition-colors"
                        >
                          Details
                        </button>
                        <ProductShareButton
                          product={product}
                          variant="footer"
                          className="justify-center py-2 px-1 text-xs rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => handleShopLink(product)}
                          className="py-2 px-1 text-xs font-bold rounded-xl bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        >
                          <span>Shop</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Spec Comparison Breakdown */}
            <div className="mt-8 space-y-4">
              <h4 className="text-xs font-extrabold text-[#43474d] uppercase tracking-wider">
                Detailed Metrics Comparison
              </h4>

              {/* Row: Ratings & Reviews */}
              <div className="bg-white rounded-xl border border-[#c3c6ce]/30 overflow-hidden">
                <div className="bg-[#eff4ff] px-4 py-2 font-bold text-xs text-[#000c1b]">
                  Rating & Reviews
                </div>
                <div
                  className={`grid divide-x divide-[#c3c6ce]/20 p-4 ${
                    products.length === 1
                      ? 'grid-cols-1'
                      : products.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {products.map((p) => (
                    <div key={p.id} className="px-2 first:pl-0 last:pr-0">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(p.rating)
                                  ? 'fill-[#006b5b] text-[#006b5b]'
                                  : 'text-[#c3c6ce]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-bold text-[#000c1b]">
                          {p.rating}
                        </span>
                      </div>
                      <p className="text-xs text-[#74777e] mt-0.5">
                        Based on {p.reviewCount} customer reviews
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row: Price Savings */}
              <div className="bg-white rounded-xl border border-[#c3c6ce]/30 overflow-hidden">
                <div className="bg-[#eff4ff] px-4 py-2 font-bold text-xs text-[#000c1b]">
                  Discount & Deal Value
                </div>
                <div
                  className={`grid divide-x divide-[#c3c6ce]/20 p-4 ${
                    products.length === 1
                      ? 'grid-cols-1'
                      : products.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {products.map((p) => {
                    const discount =
                      p.originalPrice && p.originalPrice > p.price
                        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                        : 0;

                    return (
                      <div key={p.id} className="px-2 first:pl-0 last:pr-0">
                        {discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#93000a] bg-[#ffdad6] px-2 py-0.5 rounded">
                              {discount}% OFF
                            </span>
                            <span className="text-xs text-[#43474d]">
                              Save ${(p.originalPrice! - p.price).toFixed(0)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#74777e]">
                            Standard Retail Price
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Row: Description & Summary */}
              <div className="bg-white rounded-xl border border-[#c3c6ce]/30 overflow-hidden">
                <div className="bg-[#eff4ff] px-4 py-2 font-bold text-xs text-[#000c1b]">
                  Overview & Key Takeaway
                </div>
                <div
                  className={`grid divide-x divide-[#c3c6ce]/20 p-4 ${
                    products.length === 1
                      ? 'grid-cols-1'
                      : products.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {products.map((p) => (
                    <div key={p.id} className="px-2 first:pl-0 last:pr-0">
                      <p className="text-xs text-[#43474d] leading-relaxed">
                        {p.description || 'Verified product curation by our team.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Row: Pros */}
              <div className="bg-white rounded-xl border border-[#c3c6ce]/30 overflow-hidden">
                <div className="bg-[#eff4ff] px-4 py-2 font-bold text-xs text-[#000c1b]">
                  Key Advantages (Pros)
                </div>
                <div
                  className={`grid divide-x divide-[#c3c6ce]/20 p-4 ${
                    products.length === 1
                      ? 'grid-cols-1'
                      : products.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {products.map((p) => (
                    <div key={p.id} className="px-2 first:pl-0 last:pr-0">
                      {p.pros && p.pros.length > 0 ? (
                        <ul className="space-y-1.5">
                          {p.pros.map((pro, i) => (
                            <li
                              key={i}
                              className="text-xs text-[#006b5b] flex items-start gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#006b5b]" />
                              <span className="text-[#43474d]">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-[#74777e]">
                          High overall buyer satisfaction
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row: Cons */}
              <div className="bg-white rounded-xl border border-[#c3c6ce]/30 overflow-hidden">
                <div className="bg-[#eff4ff] px-4 py-2 font-bold text-xs text-[#000c1b]">
                  Considerations (Cons)
                </div>
                <div
                  className={`grid divide-x divide-[#c3c6ce]/20 p-4 ${
                    products.length === 1
                      ? 'grid-cols-1'
                      : products.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3'
                  }`}
                >
                  {products.map((p) => (
                    <div key={p.id} className="px-2 first:pl-0 last:pr-0">
                      {p.cons && p.cons.length > 0 ? (
                        <ul className="space-y-1.5">
                          {p.cons.map((con, i) => (
                            <li
                              key={i}
                              className="text-xs text-[#93000a] flex items-start gap-1.5"
                            >
                              <Minus className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#93000a]" />
                              <span className="text-[#43474d]">{con}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-[#74777e]">
                          No major drawbacks reported
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#c3c6ce]/30 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#74777e]">
            Showing comparison for <strong>{products.length}</strong> items
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#000c1b] text-white hover:bg-[#000c1b]/80 transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
