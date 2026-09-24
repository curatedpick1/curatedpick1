import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  Heart,
  BellRing,
  Scale,
  Star,
  ExternalLink,
  Trash2,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Product, PriceAlertConfig, UserProfile, ProductUserReview } from '../types';

interface MyActivityModalProps {
  isOpen: boolean;
  initialTab?: ActivityTab;
  onClose: () => void;
  user: UserProfile;
  savedProducts: Product[];
  onRemoveSaved: (productId: string) => void;
  onViewProduct: (product: Product) => void;
  priceAlerts: Record<string, PriceAlertConfig>;
  allProducts: Product[];
  onRemovePriceAlert: (productId: string) => void;
  comparedProductIds: string[];
  onOpenCompareModal: () => void;
  onOpenSettings: () => void;
  reviewsUpdateTrigger?: number;
  onReviewsUpdated?: () => void;
}

type ActivityTab = 'overview' | 'saved' | 'alerts' | 'reviews';

export const MyActivityModal: React.FC<MyActivityModalProps> = ({
  isOpen,
  initialTab,
  onClose,
  user,
  savedProducts,
  onRemoveSaved,
  onViewProduct,
  priceAlerts,
  allProducts,
  onRemovePriceAlert,
  comparedProductIds,
  onOpenCompareModal,
  onOpenSettings,
  reviewsUpdateTrigger,
  onReviewsUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>(initialTab || 'overview');
  const [localReviewRevision, setLocalReviewRevision] = useState(0);

  // Sync active tab when initialTab changes or modal opens
  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Load user authored reviews across all products from localStorage
  const userReviews: { product: Product; review: ProductUserReview }[] = useMemo(() => {
    if (!isOpen) return [];
    const results: { product: Product; review: ProductUserReview }[] = [];
    allProducts.forEach((prod) => {
      try {
        const stored = localStorage.getItem(`curated_pick_user_reviews_${prod.id}`);
        if (stored) {
          const list: ProductUserReview[] = JSON.parse(stored);
          list.forEach((rev) => {
            results.push({ product: prod, review: rev });
          });
        }
      } catch {
        // ignore parsing error
      }
    });
    return results;
  }, [allProducts, isOpen, reviewsUpdateTrigger, localReviewRevision]);

  // Delete an authored review from localStorage
  const handleDeleteReview = (productId: string, reviewId: string) => {
    try {
      const storageKey = `curated_pick_user_reviews_${productId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const list: ProductUserReview[] = JSON.parse(stored);
        const filtered = list.filter((r) => r.id !== reviewId);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        setLocalReviewRevision((prev) => prev + 1);
        if (onReviewsUpdated) {
          onReviewsUpdated();
        }
      }
    } catch (e) {
      console.warn('Failed to delete review from localStorage', e);
    }
  };

  // Price alert items paired with their product
  const alertItems = useMemo(() => {
    return Object.entries(priceAlerts)
      .map(([prodId, alert]) => {
        const prod = allProducts.find((p) => p.id === prodId);
        return prod ? { product: prod, alert } : null;
      })
      .filter((item): item is { product: Product; alert: PriceAlertConfig } => Boolean(item));
  }, [priceAlerts, allProducts]);

  // Compared products
  const comparedProducts = useMemo(() => {
    return comparedProductIds
      .map((id) => allProducts.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }, [comparedProductIds, allProducts]);

  if (!isOpen) return null;

  return (
    <div
      id="modal-my-activity"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#000c1b]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 border border-[#c3c6ce]/40 animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#dce9ff]/60 via-[#eff4ff] to-[#f8f9ff] border-b border-[#c3c6ce]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#000c1b] text-[#26fedc] flex items-center justify-center font-bold text-sm shadow-xs border border-[#26fedc]/30">
              {user.isLoggedIn ? (
                user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{user.name.slice(0, 2).toUpperCase()}</span>
                )
              ) : (
                <span>GU</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#000c1b]">
                  My Activity
                </h2>
                <span className="text-[11px] font-semibold bg-[#26fedc]/30 text-[#006b5b] px-2 py-0.5 rounded-full">
                  {user.isLoggedIn ? 'Curated Member' : 'Guest Mode'}
                </span>
              </div>
              <p className="text-xs text-[#74777e]">
                {user.isLoggedIn
                  ? `Activity history for ${user.name} (${user.email})`
                  : 'Local activity stored on this browser'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-activity-modal"
            type="button"
            onClick={onClose}
            className="p-2 text-[#74777e] hover:text-[#000c1b] hover:bg-[#eff4ff] rounded-full transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-4 sm:px-6 border-b border-[#c3c6ce]/20 bg-[#f8f9ff] overflow-x-auto no-scrollbar gap-1 pt-2">
          <button
            id="tab-act-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#006b5b] text-[#006b5b]'
                : 'border-transparent text-[#74777e] hover:text-[#000c1b]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            id="tab-act-saved"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'saved'
                ? 'border-[#006b5b] text-[#006b5b]'
                : 'border-transparent text-[#74777e] hover:text-[#000c1b]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist</span>
            <span className="bg-[#eff4ff] text-[#006b5b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {savedProducts.length}
            </span>
          </button>

          <button
            id="tab-act-alerts"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'alerts'
                ? 'border-[#006b5b] text-[#006b5b]'
                : 'border-transparent text-[#74777e] hover:text-[#000c1b]'
            }`}
          >
            <BellRing className="w-4 h-4" />
            <span>Price Alerts</span>
            <span className="bg-[#eff4ff] text-[#006b5b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {alertItems.length}
            </span>
          </button>

          <button
            id="tab-act-reviews"
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-[#006b5b] text-[#006b5b]'
                : 'border-transparent text-[#74777e] hover:text-[#000c1b]'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>My Reviews</span>
            <span className="bg-[#eff4ff] text-[#006b5b] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {userReviews.length}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  onClick={() => setActiveTab('saved')}
                  className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/30 hover:border-[#006b5b]/50 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between text-[#006b5b] mb-1">
                    <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Saved
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#000c1b]">
                    {savedProducts.length}
                  </div>
                  <span className="text-[11px] text-[#74777e]">Items in Wishlist</span>
                </div>

                <div
                  onClick={() => setActiveTab('alerts')}
                  className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/30 hover:border-[#006b5b]/50 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between text-[#006b5b] mb-1">
                    <BellRing className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Alerts
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#000c1b]">
                    {alertItems.length}
                  </div>
                  <span className="text-[11px] text-[#74777e]">Active Watchers</span>
                </div>

                <div
                  onClick={() => {
                    onClose();
                    onOpenCompareModal();
                  }}
                  className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/30 hover:border-[#006b5b]/50 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between text-[#006b5b] mb-1">
                    <Scale className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Compare
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#000c1b]">
                    {comparedProducts.length}
                  </div>
                  <span className="text-[11px] text-[#74777e]">Products in Tray</span>
                </div>

                <div
                  onClick={() => setActiveTab('reviews')}
                  className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/30 hover:border-[#006b5b]/50 cursor-pointer transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center justify-between text-[#006b5b] mb-1">
                    <Star className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#74777e]">
                      Reviews
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-[#000c1b]">
                    {userReviews.length}
                  </div>
                  <span className="text-[11px] text-[#74777e]">Authored by You</span>
                </div>
              </div>

              {/* Recent Saved Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#000c1b] flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-[#006b5b]" />
                    <span>Recent Saved Products</span>
                  </h3>
                  {savedProducts.length > 0 && (
                    <button
                      onClick={() => setActiveTab('saved')}
                      className="text-xs font-semibold text-[#006b5b] hover:underline flex items-center gap-0.5"
                    >
                      <span>View All ({savedProducts.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {savedProducts.length === 0 ? (
                  <div className="p-6 text-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#c3c6ce]/50 text-xs text-[#74777e]">
                    No items saved yet. Click the heart icon on any product to save it here!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {savedProducts.slice(0, 4).map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-[#c3c6ce]/40 hover:border-[#006b5b]/40 transition-colors shadow-2xs group cursor-pointer"
                        onClick={() => {
                          onClose();
                          onViewProduct(prod);
                        }}
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[#f8f9ff] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-[#000c1b] truncate group-hover:text-[#006b5b]">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-bold text-[#006b5b]">
                            ${prod.price}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-[#74777e] group-hover:text-[#006b5b] shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Price Watchers Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#000c1b] flex items-center gap-1.5">
                    <BellRing className="w-4 h-4 text-[#006b5b]" />
                    <span>Active Price Watchers</span>
                  </h3>
                  {alertItems.length > 0 && (
                    <button
                      onClick={() => setActiveTab('alerts')}
                      className="text-xs font-semibold text-[#006b5b] hover:underline flex items-center gap-0.5"
                    >
                      <span>Manage All ({alertItems.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {alertItems.length === 0 ? (
                  <div className="p-6 text-center bg-[#f8f9ff] rounded-xl border border-dashed border-[#c3c6ce]/50 text-xs text-[#74777e]">
                    No price alerts set. Set an alert on any product to get notified when the price drops!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {alertItems.slice(0, 2).map(({ product: prod, alert }) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#c3c6ce]/40 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-[#000c1b] truncate block">
                              {prod.name}
                            </span>
                            <span className="text-[#74777e]">
                              Current: ${prod.price} • Alert at: ${alert.targetPrice}
                            </span>
                          </div>
                        </div>
                        <span className="bg-[#26fedc]/30 text-[#006b5b] font-bold px-2 py-0.5 rounded text-[11px] shrink-0">
                          Active
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SAVED WISHLIST */}
          {activeTab === 'saved' && (
            <div className="space-y-3">
              {savedProducts.length === 0 ? (
                <div className="p-10 text-center bg-[#f8f9ff] rounded-2xl border border-dashed border-[#c3c6ce]/60 space-y-2">
                  <Heart className="w-8 h-8 text-[#74777e] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#000c1b]">Your Wishlist is Empty</p>
                  <p className="text-xs text-[#74777e]">
                    Browse editor reviews and tap the heart icon on any product to save it.
                  </p>
                </div>
              ) : (
                savedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#c3c6ce]/40 hover:border-[#c3c6ce] shadow-2xs gap-3"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        onClose();
                        onViewProduct(prod);
                      }}
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-14 h-14 rounded-xl object-cover bg-[#f8f9ff] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs text-[#006b5b] font-bold uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-[#000c1b] truncate hover:text-[#006b5b]">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs sm:text-sm font-extrabold text-[#000c1b]">
                            ${prod.price}
                          </span>
                          <span className="text-[11px] text-[#74777e]">
                            ★ {prod.rating} ({prod.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onViewProduct(prod);
                        }}
                        className="px-3 py-1.5 bg-[#000c1b] text-white text-xs font-semibold rounded-lg hover:bg-[#0b1c30] hover:text-[#26fedc] transition-colors"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveSaved(prod.id)}
                        className="p-1.5 text-[#74777e] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: PRICE ALERTS */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alertItems.length === 0 ? (
                <div className="p-10 text-center bg-[#f8f9ff] rounded-2xl border border-dashed border-[#c3c6ce]/60 space-y-2">
                  <BellRing className="w-8 h-8 text-[#74777e] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#000c1b]">No Active Price Alerts</p>
                  <p className="text-xs text-[#74777e]">
                    Open any product detail modal and click the bell icon to track price drops.
                  </p>
                </div>
              ) : (
                alertItems.map(({ product: prod, alert }) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-[#c3c6ce]/40 shadow-2xs gap-3"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        onClose();
                        onViewProduct(prod);
                      }}
                    >
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#000c1b] truncate hover:text-[#006b5b]">
                          {prod.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs">
                          <span className="font-bold text-[#000c1b]">
                            Current: ${prod.price}
                          </span>
                          <span className="text-[#006b5b] font-semibold bg-[#26fedc]/30 px-2 py-0.5 rounded">
                            Target: ${alert.targetPrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemovePriceAlert(prod.id)}
                      className="p-2 text-[#74777e] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors shrink-0"
                      title="Delete price alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: MY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              {userReviews.length === 0 ? (
                <div className="p-10 text-center bg-[#f8f9ff] dark:bg-slate-850 rounded-2xl border border-dashed border-[#c3c6ce]/60 dark:border-slate-700 space-y-2">
                  <Star className="w-8 h-8 text-[#74777e] mx-auto opacity-40" />
                  <p className="text-sm font-bold text-[#000c1b] dark:text-white">No Reviews Written Yet</p>
                  <p className="text-xs text-[#74777e] dark:text-slate-400 max-w-sm mx-auto">
                    Open any product modal, scroll to Community Reviews & Ratings, and submit your review. It will be saved here in your activity!
                  </p>
                </div>
              ) : (
                userReviews.map(({ product: prod, review }) => (
                  <div
                    key={review.id}
                    className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-[#c3c6ce]/40 dark:border-slate-700 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="flex items-center gap-3 cursor-pointer group min-w-0"
                        onClick={() => {
                          onClose();
                          onViewProduct(prod);
                        }}
                      >
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover bg-[#f8f9ff] dark:bg-slate-700 shrink-0 border border-[#c3c6ce]/30"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] uppercase tracking-wider block">
                            {prod.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-[#000c1b] dark:text-white truncate group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc]">
                            {prod.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[#26fedc]/30 text-[#006b5b] dark:text-[#000c1b] dark:bg-[#26fedc] font-bold text-[11px] px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {review.rating}.0
                        </span>
                        <button
                          type="button"
                          id={`btn-delete-review-${review.id}`}
                          onClick={() => handleDeleteReview(prod.id, review.id)}
                          className="p-1.5 text-[#74777e] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete this review"
                          aria-label="Delete this review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#f8f9ff] dark:bg-slate-900/50 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-[#000c1b] dark:text-white">{review.title}</h5>
                        <span className="text-[10.5px] text-[#74777e] dark:text-slate-400 shrink-0">{review.date}</span>
                      </div>
                      <p className="text-xs text-[#43474d] dark:text-slate-300 leading-relaxed">{review.comment}</p>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-[#74777e] dark:text-slate-400">
                      <span>Review by <strong className="text-[#000c1b] dark:text-slate-200">{review.author}</strong></span>
                      <button
                        onClick={() => {
                          onClose();
                          onViewProduct(prod);
                        }}
                        className="text-[#006b5b] dark:text-[#26fedc] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Product</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#c3c6ce]/30 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs text-[#006b5b] font-semibold hover:underline"
          >
            Manage User Preferences & Settings →
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#000c1b] text-white text-xs font-bold rounded-xl hover:bg-[#0b1c30] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
