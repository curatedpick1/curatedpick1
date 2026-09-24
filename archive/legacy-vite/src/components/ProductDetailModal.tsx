import React, { useState } from 'react';
import {
  X,
  Star,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Zap,
  Heart,
  Bell,
  BellRing,
  Share2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ThumbsUp,
  MessageSquareHeart,
  Mail,
  Link2,
  MessageCircle,
  Truck,
  Store,
  Layers,
} from 'lucide-react';
import { Product, PriceAlertConfig, UserProfile, ProductUserReview } from '../types';
import { ProductUserReviewsSection } from './ProductUserReviewsSection';
import { PriceTrendBadge } from './PriceTrendBadge';

interface ProductDetailModalProps {
  product: Product | null;
  isSaved?: boolean;
  hasPriceAlert?: boolean;
  priceAlertConfig?: PriceAlertConfig | null;
  onToggleWishlist?: (id: string) => void;
  onOpenPriceAlert?: (product: Product) => void;
  onClose: () => void;
  onProductClickTrack?: (id: string) => void;
  userProfile?: UserProfile;
  onReviewSubmitted?: (review: ProductUserReview) => void;
  onOpenActivity?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isSaved = false,
  hasPriceAlert = false,
  priceAlertConfig,
  onToggleWishlist,
  onOpenPriceAlert,
  onClose,
  onProductClickTrack,
  userProfile,
  onReviewSubmitted,
  onOpenActivity,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyNotification, setCopyNotification] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<'idle' | 'shared' | 'copied'>('idle');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Feedback Star Rating State
  const [userRating, setUserRating] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(`curated_pick_vote_${product?.id}`);
      return stored ? Number(stored) : 0;
    } catch {
      return 0;
    }
  });
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem(`curated_pick_vote_${product?.id}`));
    } catch {
      return false;
    }
  });

  const handleRateProduct = (stars: number) => {
    if (!product) return;
    setUserRating(stars);
    setRatingSubmitted(true);
    try {
      localStorage.setItem(`curated_pick_vote_${product.id}`, String(stars));
    } catch (e) {
      console.warn('Failed to save rating vote', e);
    }
  };

  const handleResetRating = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    setUserRating(0);
    setHoverRating(0);
    setRatingSubmitted(false);
    try {
      localStorage.removeItem(`curated_pick_vote_${product.id}`);
    } catch (e) {
      console.warn('Failed to remove rating vote', e);
    }
  };

  if (!product) return null;

  const handleOpenZoom = () => {
    setZoomLevel(1.5);
    setPanPosition({ x: 0, y: 0 });
    setIsZoomOpen(true);
  };

  const handleCloseZoom = () => {
    setIsZoomOpen(false);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) {
      setPanPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - panPosition.x,
        y: e.clientY - panPosition.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCopyLink = (platformName?: string) => {
    if (!product) return;
    const url = product.affiliateUrl || window.location.href;

    const onCopySuccess = () => {
      setCopied(true);
      setShareStatus('copied');
      if (platformName) {
        setCopyNotification(`Link copied to clipboard! Opening ${platformName}...`);
      } else {
        setCopyNotification('Product link copied to clipboard!');
      }
      setTimeout(() => {
        setCopied(false);
        setShareStatus('idle');
        setCopyNotification(null);
      }, 2500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(onCopySuccess)
        .catch(() => {
          fallbackCopyText(url, onCopySuccess);
        });
    } else {
      fallbackCopyText(url, onCopySuccess);
    }
  };

  const fallbackCopyText = (text: string, onSuccess: () => void) => {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      onSuccess();
    } catch {
      onSuccess();
    }
  };

  const handleShareToSocial = (
    platform: 'twitter' | 'whatsapp' | 'facebook' | 'linkedin' | 'email'
  ) => {
    if (!product) return;
    const url = product.affiliateUrl || window.location.href;
    const shareText = `Check out ${product.name} ($${product.price}) on Curated Pick!`;
    const platformLabel =
      platform === 'twitter'
        ? 'X (Twitter)'
        : platform === 'whatsapp'
        ? 'WhatsApp'
        : platform === 'facebook'
        ? 'Facebook'
        : platform === 'linkedin'
        ? 'LinkedIn'
        : 'Email';

    // Copy product link to clipboard on every social click
    handleCopyLink(platformLabel);

    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'whatsapp') {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${shareText} ${url}`
      )}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`;
    } else if (platform === 'email') {
      shareUrl = `mailto:?subject=${encodeURIComponent(
        `Curated Pick Recommendation: ${product.name}`
      )}&body=${encodeURIComponent(
        `Hi,\n\nI thought you might like this: ${product.name} ($${product.price}).\n\nLink: ${url}\n`
      )}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `${product.name} ($${product.price}) - ${
        product.description
          ? product.description.length > 120
            ? product.description.slice(0, 117) + '...'
            : product.description
          : 'Check out this curated pick on Curated Pick!'
      }`,
      url: product.affiliateUrl || window.location.href,
    };

    if (
      navigator.share &&
      (typeof navigator.canShare === 'function'
        ? navigator.canShare(shareData)
        : Boolean(navigator.share))
    ) {
      try {
        await navigator.share(shareData);
        setShareStatus('shared');
        setTimeout(() => setShareStatus('idle'), 2500);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleGoToMerchant = () => {
    if (onProductClickTrack) {
      onProductClickTrack(product.id);
    }
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000c1b]/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="bg-white dark:bg-[#0e1c2e] rounded-2xl max-w-xl w-full overflow-hidden shadow-[0_20px_50px_rgba(0,12,27,0.2)] border border-[#c3c6ce]/30 dark:border-slate-800 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#eff4ff] dark:border-slate-800">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/25 dark:bg-[#26fedc]/15 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            {product.tag && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#93000a] dark:text-rose-300 bg-[#ffdad6] dark:bg-rose-950/40 px-2 py-0.5 rounded-md">
                {product.tag}
              </span>
            )}
            {hasPriceAlert && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                <BellRing className="w-2.5 h-2.5" /> Alert Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Share Button in Header */}
            <button
              id={`btn-modal-share-${product.id}`}
              onClick={() => handleCopyLink()}
              className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                copied || shareStatus !== 'idle'
                  ? 'bg-[#26fedc] border-[#26fedc] text-[#000c1b] scale-105'
                  : 'bg-white dark:bg-slate-800 border-[#c3c6ce]/40 dark:border-slate-700 text-[#74777e] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:bg-[#eff4ff] dark:hover:bg-slate-700'
              }`}
              title={copied ? 'Product Link Copied to Clipboard!' : 'Copy link to clipboard & share'}
              aria-label="Share product details and copy link"
            >
              {copied || shareStatus !== 'idle' ? (
                <Check className="w-3.5 h-3.5 text-[#000c1b]" />
              ) : (
                <Share2 className="w-3.5 h-3.5 text-current" />
              )}
            </button>

            {onOpenPriceAlert && (
              <button
                id={`btn-modal-price-alert-${product.id}`}
                onClick={() => onOpenPriceAlert(product)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  hasPriceAlert
                    ? 'bg-[#26fedc]/30 border-[#26fedc] text-[#006b5b] dark:text-[#26fedc]'
                    : 'bg-white dark:bg-slate-800 border-[#c3c6ce]/40 dark:border-slate-700 text-[#74777e] dark:text-slate-300 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:bg-[#eff4ff] dark:hover:bg-slate-700'
                }`}
                title={hasPriceAlert ? 'Edit Price Alert' : 'Set Price Drop Alert'}
                aria-label="Set price drop alert"
              >
                {hasPriceAlert ? (
                  <BellRing className="w-3.5 h-3.5 fill-current text-[#006b5b] dark:text-[#26fedc]" />
                ) : (
                  <Bell className="w-3.5 h-3.5 text-current" />
                )}
              </button>
            )}
            {onToggleWishlist && (
              <button
                id={`btn-modal-wishlist-${product.id}`}
                onClick={() => onToggleWishlist(product.id)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-[#ffdad6]/40 dark:bg-rose-500/20 border-[#ffdad6] dark:border-rose-500/30 text-[#93000a] dark:text-rose-400'
                    : 'bg-white dark:bg-slate-800 border-[#c3c6ce]/40 dark:border-slate-700 text-[#74777e] dark:text-slate-300 hover:text-[#93000a] dark:hover:text-rose-400 hover:bg-[#eff4ff] dark:hover:bg-slate-700'
                }`}
                title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
                aria-label={isSaved ? 'Remove from saved' : 'Save to wishlist'}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isSaved ? 'fill-[#93000a] dark:fill-rose-400 text-[#93000a] dark:text-rose-400' : 'text-current'
                  }`}
                />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white p-1 rounded-full hover:bg-[#eff4ff] dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Share Feedback Banner */}
        {shareStatus !== 'idle' && (
          <div className="bg-[#26fedc] px-4 py-2 text-xs font-bold text-[#000c1b] flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>
                {shareStatus === 'shared'
                  ? 'Shared successfully!'
                  : 'Product link & details copied to clipboard!'}
              </span>
            </div>
            <button
              onClick={() => setShareStatus('idle')}
              className="text-[#000c1b]/70 hover:text-[#000c1b]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Image with Lightbox Zoom Trigger */}
          <div
            id={`product-image-container-${product.id}`}
            onClick={handleOpenZoom}
            className="w-full h-56 sm:h-64 bg-[#e5eeff] dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center relative group cursor-zoom-in border border-[#c3c6ce]/30 dark:border-slate-700 transition-all hover:border-[#26fedc]"
            title="Click to zoom in"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-[#000c1b]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-[#000c1b]/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                <ZoomIn className="w-3.5 h-3.5 text-[#26fedc]" />
                <span>Click to Inspect</span>
              </div>
            </div>
          </div>

          {/* Title & Ratings */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#000c1b] dark:text-white tracking-tight">
              {product.name}
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]" />
                <span className="text-sm font-bold text-[#000c1b] dark:text-white ml-1">
                  {product.rating}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById(`product-user-reviews-${product.id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-[#74777e] dark:text-slate-400 hover:text-[#006b5b] dark:hover:text-[#26fedc] hover:underline cursor-pointer transition-colors"
                title="View customer reviews and ratings"
              >
                ({product.reviewCount} customer reviews)
              </button>
              <span className="text-[10.5px] text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/25 dark:bg-[#26fedc]/15 px-1.5 py-0.5 rounded flex items-center gap-1 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Curated Pick
              </span>
            </div>
          </div>

          {/* Pricing Row & Price Alert Trigger */}
          <div className="p-3 bg-[#eff4ff] dark:bg-[#132338] rounded-xl space-y-2 border border-[#c3c6ce]/20 dark:border-slate-700">
            <div className="flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-extrabold text-[#000c1b] dark:text-white">
                  ${product.price}
                </span>
                <PriceTrendBadge product={product} size="sm" />
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xs text-[#74777e] dark:text-slate-400 line-through">
                      ${product.originalPrice}
                    </span>
                    <span className="text-[10px] font-bold text-[#93000a] dark:text-rose-300 bg-[#ffdad6] dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                      Save ${(product.originalPrice - product.price).toFixed(0)} (
                      {Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )}
                      % OFF)
                    </span>
                  </>
                )}
              </div>

              {onOpenPriceAlert && (
                <button
                  id="btn-trigger-price-alert"
                  type="button"
                  onClick={() => onOpenPriceAlert(product)}
                  className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all shadow-2xs hover:scale-102 cursor-pointer ${
                    hasPriceAlert
                      ? 'bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] border-[#000c1b] dark:border-[#26fedc]'
                      : 'bg-white dark:bg-slate-800 hover:bg-[#26fedc] dark:hover:bg-[#26fedc] text-[#000c1b] dark:text-white dark:hover:text-[#000c1b] border-[#c3c6ce]/40 dark:border-slate-700'
                  }`}
                >
                  <Bell className="w-3 h-3 fill-current" />
                  <span>
                    {hasPriceAlert
                      ? `Alert at $${priceAlertConfig?.targetPrice || product.price}`
                      : 'Track Price Drop'}
                  </span>
                </button>
              )}
            </div>

            {hasPriceAlert && priceAlertConfig && (
              <div className="text-[11px] text-[#006b5b] dark:text-[#26fedc] font-medium flex items-center justify-between pt-1 border-t border-[#c3c6ce]/30 dark:border-slate-700">
                <span>
                  ✓ Alert set for target of <strong>${priceAlertConfig.targetPrice}</strong>
                  {priceAlertConfig.email ? ` (notifying ${priceAlertConfig.email})` : ''}
                </span>
                <button
                  onClick={() => onOpenPriceAlert(product)}
                  className="underline hover:text-[#000c1b] dark:hover:text-white cursor-pointer"
                >
                  Change
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-[#43474d] dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Overview
            </h4>
            <p className="text-sm text-[#43474d] dark:text-slate-400 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Pros & Cons */}
          {product.pros && product.pros.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#e5eeff]/60 dark:bg-[#132338]/80 rounded-xl border border-[#c3c6ce]/30 dark:border-slate-700">
                <h5 className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] uppercase tracking-wider mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Why We Recommend It
                </h5>
                <ul className="space-y-1 text-xs text-[#0b1c30] dark:text-slate-200">
                  {product.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#006b5b] dark:text-[#26fedc] font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {product.cons && product.cons.length > 0 && (
                <div className="p-3 bg-[#ffdad6]/40 dark:bg-rose-950/30 rounded-xl border border-[#ffdad6] dark:border-rose-900/50">
                  <h5 className="text-xs font-bold text-[#93000a] dark:text-rose-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Consider Before Buying
                  </h5>
                  <ul className="space-y-1 text-xs text-[#0b1c30] dark:text-slate-200">
                    {product.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#93000a] dark:text-rose-400 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Product Additional Details & Specs */}
          {(product.retailer || product.warranty || product.shippingInfo || product.availability || (product.specs && product.specs.length > 0)) && (
            <div className="p-3.5 bg-[#f8f9ff] dark:bg-[#101f33] rounded-xl border border-[#c3c6ce]/30 dark:border-slate-800 space-y-3">
              <h5 className="text-xs font-bold text-[#000c1b] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" /> Purchase & Shipping Details
              </h5>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {product.retailer && (
                  <div className="p-2 bg-white dark:bg-[#13253d] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700">
                    <span className="text-[10px] text-[#74777e] dark:text-slate-400 block font-semibold">Retailer</span>
                    <span className="font-bold text-[#0b1c30] dark:text-slate-200">{product.retailer}</span>
                  </div>
                )}
                {product.availability && (
                  <div className="p-2 bg-white dark:bg-[#13253d] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700">
                    <span className="text-[10px] text-[#74777e] dark:text-slate-400 block font-semibold">Availability</span>
                    <span className="font-bold text-[#006b5b] dark:text-[#26fedc]">{product.availability}</span>
                  </div>
                )}
                {product.shippingInfo && (
                  <div className="p-2 bg-white dark:bg-[#13253d] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#74777e] dark:text-slate-400 block font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3 text-[#006b5b]" /> Shipping
                    </span>
                    <span className="font-medium text-[#0b1c30] dark:text-slate-200 truncate block">{product.shippingInfo}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="p-2 bg-white dark:bg-[#13253d] rounded-lg border border-[#c3c6ce]/30 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#74777e] dark:text-slate-400 block font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#006b5b]" /> Warranty
                    </span>
                    <span className="font-medium text-[#0b1c30] dark:text-slate-200 truncate block">{product.warranty}</span>
                  </div>
                )}
              </div>

              {product.specs && product.specs.length > 0 && (
                <div className="pt-2 border-t border-[#c3c6ce]/20 dark:border-slate-700">
                  <span className="text-[10px] text-[#74777e] dark:text-slate-400 block font-bold uppercase mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-[#006b5b]" /> Key Specifications
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {product.specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 bg-white/70 dark:bg-[#13253d]/70 rounded border border-[#c3c6ce]/20 dark:border-slate-800">
                        <span className="font-semibold text-[#43474d] dark:text-slate-400">{spec.label}</span>
                        <span className="font-bold text-[#000c1b] dark:text-slate-200">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Internal Feedback / Helpful Vote Rating */}
          <div
            id={`feedback-card-${product.id}`}
            className="p-3.5 bg-gradient-to-r from-[#eff4ff]/80 to-[#f8f9ff] dark:from-[#112338] dark:to-[#0b1726] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <MessageSquareHeart className="w-4 h-4 text-[#006b5b] dark:text-[#26fedc]" />
                <span className="text-xs font-bold text-[#000c1b] dark:text-white">
                  Was this product recommendation helpful?
                </span>
              </div>
              <p className="text-[11px] text-[#74777e] dark:text-slate-400">
                {ratingSubmitted
                  ? `Thanks for your feedback! You voted ${userRating} out of 5 stars.`
                  : 'Rate our curation to help improve community product picks.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || userRating) >= star;
                  return (
                    <button
                      key={star}
                      id={`btn-star-vote-${product.id}-${star}`}
                      type="button"
                      onClick={() => handleRateProduct(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 rounded-md hover:bg-white/80 dark:hover:bg-slate-700 transition-transform active:scale-90 cursor-pointer"
                      title={`Rate ${star} of 5 stars`}
                      aria-label={`Vote ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-5 h-5 transition-colors ${
                          isFilled
                            ? 'fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc] drop-shadow-xs'
                            : 'text-[#c3c6ce] dark:text-slate-600 hover:text-[#006b5b] dark:hover:text-[#26fedc]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {ratingSubmitted && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Voted
                  </span>
                  <button
                    onClick={handleResetRating}
                    className="text-[10px] text-[#74777e] dark:text-slate-400 hover:text-[#93000a] dark:hover:text-rose-400 underline cursor-pointer"
                    title="Change vote"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Social Media Share & Copy Link Section */}
          <div
            id={`social-share-card-${product.id}`}
            className="p-3 bg-gradient-to-br from-[#eff4ff] to-[#f8f9ff] dark:from-[#112338] dark:to-[#0b1726] rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 space-y-2.5 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" />
                <span className="text-[11px] font-bold text-[#000c1b] dark:text-white uppercase tracking-wider">
                  Social Media Share
                </span>
              </div>
              <span className="text-[10px] text-[#74777e] dark:text-slate-400 font-medium">
                Copy link & share instantly
              </span>
            </div>

            {/* Prominent Social Share & Copy Button (Smaller, compact style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                id={`btn-social-share-copy-${product.id}`}
                type="button"
                onClick={() => handleCopyLink()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold text-xs shadow-2xs transition-all cursor-pointer ${
                  copied
                    ? 'bg-[#006b5b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] ring-2 ring-[#26fedc] scale-[1.01]'
                    : 'bg-[#000c1b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] hover:bg-[#0b1c30] dark:hover:bg-[#00f5d4] hover:text-[#26fedc] active:scale-[0.99]'
                }`}
                title="Copy product link to clipboard to share on social media"
                aria-label="Copy product link to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#26fedc] dark:text-[#000c1b]" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#26fedc] dark:text-[#000c1b]" />
                    <span>Share to Social Media (Copy Link)</span>
                  </>
                )}
              </button>

              <button
                id={`btn-device-share-${product.id}`}
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#eff4ff] dark:hover:bg-slate-700 text-[#000c1b] dark:text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                title="Open native share menu"
              >
                <Share2 className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" />
                <span>More</span>
              </button>
            </div>

            {/* Quick 1-Click Social Media Platforms (Smaller icons and compact buttons) */}
            <div>
              <div className="text-[10.5px] text-[#43474d] dark:text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Or share directly to:</span>
                {copyNotification && (
                  <span className="text-[10px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-1.5 py-0.5 rounded flex items-center gap-1 animate-fadeIn">
                    <Check className="w-2.5 h-2.5 text-[#006b5b] dark:text-[#26fedc]" />
                    {copyNotification}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                <button
                  id={`btn-share-twitter-${product.id}`}
                  type="button"
                  onClick={() => handleShareToSocial('twitter')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md bg-white dark:bg-slate-800 hover:bg-[#000c1b] dark:hover:bg-slate-700 hover:text-[#26fedc] text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 dark:border-slate-700 transition-all group shadow-2xs cursor-pointer"
                  title="Share product on X (Twitter)"
                  aria-label="Share on X (Twitter)"
                >
                  <span className="font-bold text-[11px] group-hover:scale-110 transition-transform leading-none">𝕏</span>
                  <span className="text-[9px] mt-0.5 font-medium">Post</span>
                </button>

                <button
                  id={`btn-share-whatsapp-${product.id}`}
                  type="button"
                  onClick={() => handleShareToSocial('whatsapp')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md bg-white dark:bg-slate-800 hover:bg-[#25D366] hover:text-white text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 dark:border-slate-700 transition-all group shadow-2xs cursor-pointer"
                  title="Share product on WhatsApp"
                  aria-label="Share on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#25D366] group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] mt-0.5 font-medium">WhatsApp</span>
                </button>

                <button
                  id={`btn-share-facebook-${product.id}`}
                  type="button"
                  onClick={() => handleShareToSocial('facebook')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md bg-white dark:bg-slate-800 hover:bg-[#1877F2] hover:text-white text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 dark:border-slate-700 transition-all group shadow-2xs cursor-pointer"
                  title="Share product on Facebook"
                  aria-label="Share on Facebook"
                >
                  <span className="font-bold text-[11px] text-[#1877F2] group-hover:text-white group-hover:scale-110 transition-transform leading-none">f</span>
                  <span className="text-[9px] mt-0.5 font-medium">Share</span>
                </button>

                <button
                  id={`btn-share-linkedin-${product.id}`}
                  type="button"
                  onClick={() => handleShareToSocial('linkedin')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md bg-white dark:bg-slate-800 hover:bg-[#0A66C2] hover:text-white text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 dark:border-slate-700 transition-all group shadow-2xs cursor-pointer"
                  title="Share product on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <span className="font-bold text-[11px] text-[#0A66C2] group-hover:text-white group-hover:scale-110 transition-transform leading-none">in</span>
                  <span className="text-[9px] mt-0.5 font-medium">LinkedIn</span>
                </button>

                <button
                  id={`btn-share-email-${product.id}`}
                  type="button"
                  onClick={() => handleShareToSocial('email')}
                  className="flex flex-col items-center justify-center py-1.5 px-1 rounded-md bg-white dark:bg-slate-800 hover:bg-[#006b5b] dark:hover:bg-[#006b5b] hover:text-white text-[#43474d] dark:text-slate-300 border border-[#c3c6ce]/40 dark:border-slate-700 transition-all group shadow-2xs cursor-pointer"
                  title="Share product via Email"
                  aria-label="Share via Email"
                >
                  <Mail className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc] group-hover:text-white group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] mt-0.5 font-medium">Email</span>
                </button>
              </div>
            </div>

            {/* URL Display with Quick Compact Copy Chip */}
            <div className="flex items-center gap-2 p-1 pl-2 bg-white dark:bg-slate-800 rounded-lg border border-[#c3c6ce]/50 dark:border-slate-700 text-xs">
              <Link2 className="w-3 h-3 text-[#74777e] dark:text-slate-400 shrink-0" />
              <span className="font-mono text-[10.5px] text-[#006b5b] dark:text-[#26fedc] truncate flex-1 min-w-[100px]">
                {product.affiliateUrl}
              </span>
              <button
                id={`btn-inline-copy-url-${product.id}`}
                type="button"
                onClick={() => handleCopyLink()}
                className="px-2 py-0.5 bg-[#eff4ff] dark:bg-slate-700 hover:bg-[#26fedc] dark:hover:bg-[#26fedc] text-[#000c1b] dark:text-white dark:hover:text-[#000c1b] font-semibold rounded text-[10px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                title="Copy link to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-2.5 h-2.5 text-[#006b5b]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Community User Reviews & Ratings Section */}
          <ProductUserReviewsSection
            product={product}
            userProfile={userProfile}
            onReviewSubmitted={onReviewSubmitted}
            onOpenActivity={onOpenActivity}
          />
        </div>

        {/* Modal Footer / Primary CTAs */}
        <div className="px-4 py-3 border-t border-[#eff4ff] dark:border-slate-800 bg-[#f8f9ff] dark:bg-[#0b1726] flex items-center justify-between gap-2.5 sm:gap-3">
          <button
            id="btn-modal-affiliate-cta"
            onClick={handleGoToMerchant}
            className="flex-1 bg-linear-to-r from-[#26fedc] to-[#00f0ce] hover:from-[#1fe5c6] hover:to-[#00deb9] text-[#000c1b] font-bold py-2 sm:py-2.5 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-[#000c1b]" />
            <span>Check Best Price on Amazon</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="shrink-0 px-3.5 py-2 sm:py-2.5 rounded-xl border border-[#c3c6ce]/70 dark:border-slate-700 text-[#43474d] dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div
          id="product-lightbox-modal"
          onClick={handleCloseZoom}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="fixed inset-0 z-70 bg-[#000c1b]/95 backdrop-blur-md flex flex-col items-center justify-between p-4 select-none animate-fadeIn"
        >
          {/* Lightbox Top Control Bar */}
          <div
            className="w-full max-w-4xl flex items-center justify-between z-10 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold truncate max-w-[200px] sm:max-w-md">
                {product.name}
              </span>
              <span className="text-xs bg-white/20 text-[#26fedc] font-mono px-2 py-0.5 rounded">
                {Math.round(zoomLevel * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="btn-zoom-out"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                title="Zoom Out (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                id="btn-zoom-reset"
                onClick={handleResetZoom}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                id="btn-zoom-in"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3.5}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:hover:bg-white/10 transition-colors"
                title="Zoom In (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <button
                id="btn-zoom-close"
                onClick={handleCloseZoom}
                className="p-2 rounded-xl bg-white/10 hover:bg-[#ffdad6]/20 hover:text-[#ffdad6] text-white transition-colors"
                title="Close Zoom View (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div
            className={`flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden relative ${
              zoomLevel > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (zoomLevel === 1) {
                handleZoomIn();
              }
            }}
            onMouseDown={handleMouseDown}
          >
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
              }}
              className="max-h-[75vh] max-w-[85vw] flex items-center justify-center"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                draggable={false}
                className="max-h-[70vh] max-w-[80vw] object-contain drop-shadow-2xl rounded-lg pointer-events-none"
              />
            </div>
          </div>

          {/* Lightbox Bottom Instructions */}
          <div
            className="text-[11px] sm:text-xs text-white/70 bg-white/10 backdrop-blur-xs px-4 py-1.5 rounded-full flex items-center gap-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Click or use buttons to zoom</span>
            <span>•</span>
            <span>{zoomLevel > 1 ? 'Drag to pan around' : 'Click to zoom in'}</span>
            <span>•</span>
            <span>Click outside or ✕ to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
