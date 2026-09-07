import React from 'react';
import { Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewsViewProps {
  reviews: ReviewItem[];
  onSelectReview: (review: ReviewItem) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  onSelectReview,
}) => {
  return (
    <div className="py-6 px-4 md:px-8 max-w-5xl mx-auto animate-fadeIn">
      <div className="mb-6">
        <span className="text-xs font-bold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/15 px-3 py-1 rounded-full uppercase tracking-wider">
          Laboratory Tested & Field Evaluated
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000c1b] dark:text-white mt-2 tracking-tight">
          Comprehensive Product Reviews
        </h1>
        <p className="text-sm sm:text-base text-[#43474d] dark:text-slate-400 mt-1 max-w-2xl">
          Unbiased, rigorous hands-on assessments performed by industry specialists. We test every claim before giving our seal of approval.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => onSelectReview(review)}
            className="bg-white dark:bg-[#0e1c2e] rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,12,27,0.05)] hover:shadow-[0_10px_30px_rgba(0,12,27,0.09)] border border-[#c3c6ce]/30 dark:border-slate-800 cursor-pointer group flex flex-col justify-between transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              {/* Review Card Image */}
              <div className="relative h-48 sm:h-52 rounded-xl overflow-hidden mb-4 bg-[#e5eeff] dark:bg-slate-800">
                <img
                  src={review.imageUrl}
                  alt={review.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 bg-[#000c1b] text-[#26fedc] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {review.tag}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-[#000c1b] dark:text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#006b5b] dark:fill-[#26fedc] text-[#006b5b] dark:text-[#26fedc]" />
                  <span>{review.rating} / 5</span>
                </div>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-[#000c1b] dark:text-white group-hover:text-[#006b5b] dark:group-hover:text-[#26fedc] transition-colors leading-snug">
                {review.title}
              </h2>
              <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-400 mt-1.5 line-clamp-2">
                {review.subtitle}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-[#eff4ff] dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-[#74777e] dark:text-slate-400">
                By <span className="font-semibold text-[#000c1b] dark:text-white">{review.author}</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#006b5b] dark:text-[#26fedc] group-hover:text-[#000c1b] dark:group-hover:text-white transition-colors">
                <span>Read Full Review</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
