import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  PenLine,
  X,
  Sparkles,
  Check,
  User,
  Search,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { Product, ProductUserReview, UserProfile } from '../types';
import { getInitialProductReviews } from '../data/seedProductReviews';

interface ProductUserReviewsSectionProps {
  product: Product;
  userProfile?: UserProfile;
  onReviewSubmitted?: (review: ProductUserReview) => void;
  onOpenActivity?: () => void;
}

export const ProductUserReviewsSection: React.FC<ProductUserReviewsSectionProps> = ({
  product,
  userProfile,
  onReviewSubmitted,
  onOpenActivity,
}) => {
  // Local storage keys
  const storageReviewsKey = `curated_pick_user_reviews_${product.id}`;
  const storageHelpfulKey = 'curated_pick_helpful_review_votes';

  // State
  const [reviews, setReviews] = useState<ProductUserReview[]>(() => {
    try {
      const stored = localStorage.getItem(storageReviewsKey);
      const userAdded: ProductUserReview[] = stored ? JSON.parse(stored) : [];
      const seeds = getInitialProductReviews(product.id, product.name);
      return [...userAdded, ...seeds];
    } catch {
      return getInitialProductReviews(product.id, product.name);
    }
  });

  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(storageHelpfulKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Review Form States - open by default so the review input section is immediately accessible
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [formRating, setFormRating] = useState<number>(5);
  const [formHoverRating, setFormHoverRating] = useState<number>(0);
  const [formAuthor, setFormAuthor] = useState(userProfile?.name || '');
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formRecommend, setFormRecommend] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Filter & Sort States
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Rating labels for picker
  const ratingLabels: Record<number, string> = {
    1: '1 - Poor',
    2: '2 - Fair',
    3: '3 - Average',
    4: '4 - Very Good',
    5: '5 - Excellent!',
  };

  // Synchronize when product changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`curated_pick_user_reviews_${product.id}`);
      const userAdded: ProductUserReview[] = stored ? JSON.parse(stored) : [];
      const seeds = getInitialProductReviews(product.id, product.name);
      setReviews([...userAdded, ...seeds]);
    } catch {
      setReviews(getInitialProductReviews(product.id, product.name));
    }
    setStarFilter(null);
    setSearchQuery('');
    setSubmitSuccess(null);
    if (userProfile?.name && !formAuthor) {
      setFormAuthor(userProfile.name);
    }
  }, [product.id, product.name, userProfile?.name]);

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (formRating < 1 || formRating > 5) {
      setFormError('Please select a rating between 1 and 5 stars.');
      return;
    }
    if (!formComment.trim() || formComment.trim().length < 10) {
      setFormError('Please write a review with at least 10 characters.');
      return;
    }

    setFormError(null);

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newReview: ProductUserReview = {
      id: `user-rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      author: formAuthor.trim() || userProfile?.name || 'Verified Community Member',
      rating: formRating,
      title: formTitle.trim() || (formRating >= 4 ? 'Great purchase!' : 'Product feedback'),
      comment: formComment.trim(),
      date: formattedDate,
      isVerifiedBuyer: true,
      helpfulCount: 0,
    };

    // Save to user reviews storage (persists to localStorage for My Activity)
    try {
      const stored = localStorage.getItem(storageReviewsKey);
      const userAdded: ProductUserReview[] = stored ? JSON.parse(stored) : [];
      const updated = [newReview, ...userAdded];
      localStorage.setItem(storageReviewsKey, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save review in localStorage', err);
    }

    setReviews((prev) => [newReview, ...prev]);
    setSubmitSuccess('Thank you! Your review has been saved to localStorage and is now visible in "My Activity".');
    setSortBy('recent');
    setStarFilter(null);

    // Call callback to notify parent App
    if (onReviewSubmitted) {
      onReviewSubmitted(newReview);
    }

    // Reset input fields
    setFormTitle('');
    setFormComment('');
    setFormRating(5);

    // Clear success message after 8 seconds
    setTimeout(() => {
      setSubmitSuccess(null);
    }, 8000);
  };

  // Toggle Helpful Vote
  const handleToggleHelpful = (reviewId: string) => {
    const isCurrentlyVoted = Boolean(helpfulVotes[reviewId]);
    const nextVotedState = !isCurrentlyVoted;

    const updatedVotes = {
      ...helpfulVotes,
      [reviewId]: nextVotedState,
    };
    setHelpfulVotes(updatedVotes);

    try {
      localStorage.setItem(storageHelpfulKey, JSON.stringify(updatedVotes));
    } catch (e) {
      console.warn('Failed to save helpful votes', e);
    }

    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return {
            ...r,
            helpfulCount: Math.max(0, r.helpfulCount + (nextVotedState ? 1 : -1)),
          };
        }
        return r;
      })
    );
  };

  // Calculate Community Ratings Breakdown
  const totalCount = reviews.length;
  const averageRating = totalCount
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1))
    : product.rating;

  const starDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rClamped = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rClamped] = (counts[rClamped] || 0) + 1;
    });
    return counts;
  }, [reviews]);

  const recommendPercent = useMemo(() => {
    if (!totalCount) return 96;
    const positive = reviews.filter((r) => r.rating >= 4).length;
    return Math.round((positive / totalCount) * 100);
  }, [reviews, totalCount]);

  // Filter and Sort Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    // Star filter
    if (starFilter !== null) {
      result = result.filter((r) => Math.round(r.rating) === starFilter);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.comment.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.author.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'highest') {
        return b.rating - a.rating;
      }
      if (sortBy === 'helpful') {
        return b.helpfulCount - a.helpfulCount;
      }
      // 'recent' by default - user reviews first then seed
      return 0;
    });

    return result;
  }, [reviews, starFilter, searchQuery, sortBy]);

  return (
    <section
      id={`product-user-reviews-${product.id}`}
      className="mt-6 pt-6 border-t border-[#c3c6ce]/30 dark:border-slate-800 space-y-5"
    >
      {/* Header & Write Review Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#006b5b] dark:text-[#26fedc]" />
            <h3 className="text-base sm:text-lg font-bold text-[#000c1b] dark:text-white">
              Community Reviews & Ratings
            </h3>
          </div>
          <p className="text-xs text-[#74777e] dark:text-slate-400 mt-0.5">
            Real feedback from verified purchasers and community enthusiasts
          </p>
        </div>

        <button
          id={`btn-open-review-form-${product.id}`}
          type="button"
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            setFormError(null);
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-2xs cursor-pointer ${
            isFormOpen
              ? 'bg-[#eff4ff] dark:bg-slate-800 text-[#000c1b] dark:text-white border border-[#c3c6ce] dark:border-slate-700'
              : 'bg-[#000c1b] dark:bg-[#26fedc] text-white dark:text-[#000c1b] hover:bg-[#0b1c30] dark:hover:bg-[#00f5d4] hover:text-[#26fedc] dark:hover:text-[#000c1b]'
          }`}
        >
          {isFormOpen ? (
            <>
              <X className="w-4 h-4 text-[#74777e] dark:text-slate-400" />
              <span>Cancel Review</span>
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4 text-[#26fedc] dark:text-[#000c1b]" />
              <span>Write a Review</span>
            </>
          )}
        </button>
      </div>

      {/* Success Notification Alert */}
      {submitSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl flex items-center justify-between gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">{submitSuccess}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onOpenActivity && (
              <button
                id="btn-view-review-in-activity"
                type="button"
                onClick={onOpenActivity}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                title="Open My Activity to see your reviews"
              >
                <span>View in My Activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setSubmitSuccess(null)}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white p-1 cursor-pointer"
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Write Review Form (Expandable) */}
      {isFormOpen && (
        <form
          id={`form-write-review-${product.id}`}
          onSubmit={handleSubmitReview}
          className="p-4 sm:p-5 bg-gradient-to-br from-[#eff4ff] via-white to-[#f8f9ff] dark:from-[#112338] dark:via-[#0e1c2e] dark:to-[#091524] rounded-2xl border border-[#c3c6ce]/60 dark:border-slate-700 shadow-xs space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#c3c6ce]/20 dark:border-slate-800">
            <span className="text-xs font-bold text-[#000c1b] dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#006b5b] dark:text-[#26fedc]" /> Share Your Experience
            </span>
            <span className="text-[11px] text-[#74777e] dark:text-slate-400">Reviewing: {product.name}</span>
          </div>

          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1.5">
              Overall Rating <span className="text-[#ba1a1a] dark:text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-[#c3c6ce]/40 dark:border-slate-700"
                onMouseLeave={() => setFormHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = (formHoverRating || formRating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      id={`btn-form-star-${star}`}
                      onClick={() => setFormRating(star)}
                      onMouseEnter={() => setFormHoverRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                      title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          active
                            ? 'fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]'
                            : 'text-[#c3c6ce] dark:text-slate-600 hover:text-[#006b5b] dark:hover:text-[#26fedc]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-semibold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/25 dark:bg-[#26fedc]/15 px-2.5 py-1 rounded-lg">
                {ratingLabels[formHoverRating || formRating]}
              </span>
            </div>
          </div>

          {/* Reviewer Name and Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
                Your Name / Alias
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-[#74777e] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-review-author"
                  type="text"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                  placeholder="e.g. Jordan Miller (or leave blank for Community Member)"
                  className="w-full text-xs pl-8 pr-3 py-2 bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
                Headline / Title
              </label>
              <input
                id="input-review-title"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Exceptional battery life and build quality"
                className="w-full text-xs px-3 py-2 bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white rounded-lg border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b]"
              />
            </div>
          </div>

          {/* Text-Based Review Content */}
          <div>
            <label className="block text-xs font-bold text-[#43474d] dark:text-slate-300 mb-1">
              Your Review & Thoughts <span className="text-[#ba1a1a] dark:text-rose-400">*</span>
            </label>
            <textarea
              id="input-review-comment"
              rows={3}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="What did you like or dislike? How does it perform daily? Share helpful specifics with the community..."
              className="w-full text-xs p-3 bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white rounded-xl border border-[#c3c6ce]/60 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 focus:border-[#006b5b] leading-relaxed"
            />
            <span className="text-[10px] text-[#74777e] dark:text-slate-400 mt-1 block">
              Minimum 10 characters ({formComment.length}/500)
            </span>
          </div>

          {/* Recommendation Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              id="checkbox-review-recommend"
              type="checkbox"
              checked={formRecommend}
              onChange={(e) => setFormRecommend(e.target.checked)}
              className="rounded text-[#006b5b] dark:text-[#26fedc] focus:ring-[#006b5b] w-4 h-4 cursor-pointer"
            />
            <span className="text-xs text-[#000c1b] dark:text-slate-200 font-medium">
              Yes, I recommend this product to others
            </span>
          </label>

          {/* Error notice */}
          {formError && (
            <p className="text-xs font-semibold text-[#ba1a1a] dark:text-rose-400 bg-[#ffdad6]/50 dark:bg-rose-950/40 p-2.5 rounded-lg">
              {formError}
            </p>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-submit-review"
              type="submit"
              className="bg-[#006b5b] dark:bg-[#26fedc] hover:bg-[#005245] dark:hover:bg-[#00f5d4] text-white dark:text-[#000c1b] font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Publish Review</span>
            </button>
          </div>
        </form>
      )}

      {/* Community Ratings Breakdown Summary Card */}
      <div
        id={`rating-breakdown-card-${product.id}`}
        className="p-4 bg-[#eff4ff]/60 dark:bg-[#132338]/80 rounded-2xl border border-[#c3c6ce]/30 dark:border-slate-700 flex flex-col md:flex-row items-center gap-5"
      >
        {/* Left: Big Score Display */}
        <div className="flex flex-col items-center justify-center text-center sm:min-w-[140px] px-2 py-1">
          <span className="text-4xl font-extrabold text-[#000c1b] dark:text-white tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 mt-1 text-[#006b5b] dark:text-[#26fedc]">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]'
                    : 'text-[#c3c6ce] dark:text-slate-600'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-[#74777e] dark:text-slate-400 mt-1.5 font-medium">
            Based on {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
          </span>
          <span className="text-[11px] font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-2 py-0.5 rounded-full mt-2">
            {recommendPercent}% Recommend
          </span>
        </div>

        {/* Center: Rating Distribution Bars */}
        <div className="flex-1 w-full space-y-1.5 border-t md:border-t-0 md:border-l border-[#c3c6ce]/30 dark:border-slate-700 pt-3 md:pt-0 md:pl-5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = starDistribution[stars] || 0;
            const pct = totalCount ? Math.round((count / totalCount) * 100) : 0;
            const isSelected = starFilter === stars;

            return (
              <button
                key={stars}
                type="button"
                id={`btn-filter-star-${stars}`}
                onClick={() => setStarFilter(isSelected ? null : stars)}
                className={`w-full flex items-center gap-2.5 text-xs group text-left px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 shadow-2xs'
                    : 'hover:bg-white/70 dark:hover:bg-slate-800/70'
                }`}
                title={`Filter by ${stars} star reviews (${count})`}
              >
                <span className="w-7 font-bold text-[#000c1b] dark:text-white flex items-center gap-0.5">
                  {stars} <Star className="w-3 h-3 fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]" />
                </span>

                <div className="flex-1 h-2 bg-[#dce9ff] dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#000c1b] dark:bg-[#26fedc]'
                        : 'bg-[#006b5b] group-hover:bg-[#26fedc] dark:bg-[#26fedc]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <span className="w-10 text-right text-[11px] text-[#74777e] dark:text-slate-400 font-mono">
                  {pct}%
                </span>
                <span className="w-6 text-right text-[11px] text-[#43474d] dark:text-slate-300 font-semibold">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        {/* Search within reviews */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-[#74777e] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-reviews"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by topic or keyword (e.g. battery, comfort)..."
            className="w-full text-xs pl-8 pr-7 py-2 bg-white dark:bg-slate-800 text-[#000c1b] dark:text-white rounded-xl border border-[#c3c6ce]/50 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#74777e] dark:text-slate-400 hover:text-[#000c1b] dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls: Active filter tag + Sort dropdown */}
        <div className="flex items-center gap-2">
          {starFilter !== null && (
            <button
              onClick={() => setStarFilter(null)}
              className="text-xs bg-[#000c1b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-bold hover:bg-[#0b1c30] dark:hover:bg-[#00f5d4] cursor-pointer"
            >
              <span>{starFilter}★ Only</span>
              <X className="w-3 h-3" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs text-[#74777e] dark:text-slate-400">
            <span className="hidden sm:inline font-medium">Sort:</span>
            <select
              id="select-sort-reviews"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'highest' | 'helpful')}
              className="bg-white dark:bg-slate-800 border border-[#c3c6ce]/50 dark:border-slate-700 text-[#000c1b] dark:text-white font-semibold text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#006b5b]/30 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-[#f8f9ff] dark:bg-slate-900/60 rounded-2xl border border-dashed border-[#c3c6ce]/60 dark:border-slate-800 space-y-2">
            <MessageSquare className="w-8 h-8 text-[#74777e] dark:text-slate-500 mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#000c1b] dark:text-white">No matching reviews found</p>
            <p className="text-xs text-[#74777e] dark:text-slate-400">
              {starFilter !== null || searchQuery
                ? 'Try clearing your search query or star filter to see all community reviews.'
                : 'Be the first community member to write a review for this product!'}
            </p>
            {(starFilter !== null || searchQuery) && (
              <button
                onClick={() => {
                  setStarFilter(null);
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-bold text-[#006b5b] dark:text-[#26fedc] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>
        ) : (
          filteredReviews.map((review) => {
            const hasVotedHelpful = Boolean(helpfulVotes[review.id]);

            return (
              <div
                key={review.id}
                id={`review-item-${review.id}`}
                className="p-4 bg-white dark:bg-[#112338] rounded-xl border border-[#c3c6ce]/40 dark:border-slate-800 hover:border-[#c3c6ce] dark:hover:border-slate-700 transition-colors shadow-2xs space-y-2.5"
              >
                {/* Top Row: Stars + Date + Verified Badge */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-[#006b5b] dark:text-[#26fedc]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? 'fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]'
                              : 'text-[#c3c6ce] dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#000c1b] dark:text-white">
                      {review.rating}.0
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#74777e] dark:text-slate-400">
                    <span>{review.date}</span>
                    {review.isVerifiedBuyer && (
                      <span className="bg-[#26fedc]/30 dark:bg-[#26fedc]/20 text-[#006b5b] dark:text-[#26fedc] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#006b5b] dark:text-[#26fedc]" /> Verified Buyer
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Title & Author */}
                <div>
                  <h4 className="text-sm font-bold text-[#000c1b] dark:text-white">
                    {review.title}
                  </h4>
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400 font-medium">
                    By {review.author}
                  </span>
                </div>

                {/* Commentary Body */}
                <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-300 leading-relaxed">
                  {review.comment}
                </p>

                {/* Footer: Helpful Action Button */}
                <div className="flex items-center justify-between pt-2 border-t border-[#c3c6ce]/20 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-[#74777e] dark:text-slate-400">
                    Was this review helpful to you?
                  </span>

                  <button
                    id={`btn-helpful-${review.id}`}
                    type="button"
                    onClick={() => handleToggleHelpful(review.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      hasVotedHelpful
                        ? 'bg-[#006b5b] dark:bg-[#26fedc] text-white dark:text-[#000c1b]'
                        : 'bg-[#eff4ff] dark:bg-slate-800 hover:bg-[#dce9ff] dark:hover:bg-slate-700 text-[#000c1b] dark:text-white'
                    }`}
                    title="Mark this review as helpful"
                  >
                    <ThumbsUp
                      className={`w-3 h-3 ${
                        hasVotedHelpful ? 'fill-current text-white dark:text-[#000c1b]' : 'text-[#006b5b] dark:text-[#26fedc]'
                      }`}
                    />
                    <span>
                      Helpful ({review.helpfulCount})
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
