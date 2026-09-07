import React from 'react';
import { ArrowRight, Award, ShieldCheck } from 'lucide-react';
import { ReviewItem } from '../types';

interface EditorsChoiceSectionProps {
  featuredReview: ReviewItem;
  onReadReview: (review: ReviewItem) => void;
}

export const EditorsChoiceSection: React.FC<EditorsChoiceSectionProps> = ({
  featuredReview,
  onReadReview,
}) => {
  return (
    <section className="py-6 md:py-8 px-4 md:px-8">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#006b5b] dark:text-[#26fedc]" />
          <h2 className="text-xl md:text-2xl font-bold text-[#000c1b] dark:text-slate-100 tracking-tight">
            Editor's Choice
          </h2>
        </div>
        <span className="text-xs font-semibold text-[#006b5b] dark:text-[#26fedc] bg-[#26fedc]/30 dark:bg-[#26fedc]/20 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Lab Tested
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Large Featured Item */}
        <div
          id="editors-choice-card"
          onClick={() => onReadReview(featuredReview)}
          className="bg-white dark:bg-[#0e1c2e] rounded-2xl shadow-[0_4px_25px_rgba(0,12,27,0.06)] hover:shadow-[0_12px_35px_rgba(0,12,27,0.1)] overflow-hidden border-l-4 border-[#000c1b] dark:border-[#26fedc] cursor-pointer group transition-all duration-300"
        >
          <div className="h-52 sm:h-64 md:h-72 w-full bg-[#e5eeff] dark:bg-slate-800 relative overflow-hidden">
            <img
              src={featuredReview.imageUrl}
              alt={featuredReview.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#000c1b]/90 via-[#000c1b]/30 to-transparent flex items-end p-4 md:p-6">
              <div className="text-white max-w-xl">
                <span className="bg-[#006b5b] dark:bg-[#26fedc] text-[#26fedc] dark:text-[#000c1b] text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block shadow-xs">
                  {featuredReview.tag}
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow-xs">
                  {featuredReview.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2">
                  {featuredReview.subtitle}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-[#0e1c2e] border-t border-[#eff4ff] dark:border-slate-800">
            <div>
              <p className="text-xs sm:text-sm text-[#43474d] dark:text-slate-300 font-medium line-clamp-1">
                {featuredReview.summary || 'The ultimate tool for creators.'}
              </p>
              <div className="text-[11px] text-[#74777e] dark:text-slate-400 mt-0.5">
                By {featuredReview.author} • {featuredReview.date}
              </div>
            </div>

            <button
              id="btn-read-editors-choice"
              onClick={(e) => {
                e.stopPropagation();
                onReadReview(featuredReview);
              }}
              className="flex items-center gap-1.5 text-[#006b5b] dark:text-[#26fedc] font-bold text-xs sm:text-sm hover:text-[#000c1b] dark:hover:text-white group-hover:translate-x-1 transition-all cursor-pointer"
            >
              <span>Read more</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
