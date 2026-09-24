import React, { useState } from 'react';
import {
  X,
  Star,
  Award,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { ReviewItem } from '../types';

interface ReviewDetailModalProps {
  review: ReviewItem | null;
  onClose: () => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!review) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(review.affiliateUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisit = () => {
    window.open(review.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000c1b]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-[0_20px_50px_rgba(0,12,27,0.25)] border border-[#c3c6ce]/30 my-8 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#eff4ff] bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span className="bg-[#006b5b] text-[#26fedc] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              {review.tag || 'Expert Review'}
            </span>
            <span className="text-xs text-[#74777e] flex items-center gap-1">
              <Clock className="w-3 h-3" /> {review.date}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000c1b] p-1.5 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Main Hero Media */}
          <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-[#000c1b]">
            <img
              src={review.imageUrl}
              alt={review.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#000c1b]/95 via-[#000c1b]/30 to-transparent flex items-end p-5 sm:p-6">
              <div className="text-white">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {review.title}
                </h1>
                <p className="text-xs sm:text-sm text-gray-200 mt-1">
                  {review.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Author info & Score */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#000c1b] text-[#26fedc] flex items-center justify-center font-bold text-sm">
                {review.author
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <div className="text-sm font-bold text-[#000c1b] flex items-center gap-1">
                  {review.author}
                  <UserCheck className="w-3.5 h-3.5 text-[#006b5b]" />
                </div>
                <div className="text-xs text-[#74777e]">{review.authorRole}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-[#c3c6ce]/50 shadow-2xs">
              <Star className="w-4 h-4 fill-[#006b5b] text-[#006b5b]" />
              <span className="text-base font-extrabold text-[#000c1b]">
                {review.rating} / 5.0
              </span>
            </div>
          </div>

          {/* Verdict Callout */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#dce9ff] to-[#eff4ff] rounded-xl border-l-4 border-[#006b5b]">
            <h3 className="text-xs font-bold text-[#006b5b] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> Editorial Verdict
            </h3>
            <p className="text-sm text-[#0b1c30] font-medium leading-relaxed">
              "{review.verdict}"
            </p>
          </div>

          {/* Full Writeup Paragraphs */}
          <div className="space-y-3 text-sm text-[#43474d] leading-relaxed">
            {review.fullContent.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 bg-[#e5eeff]/70 rounded-xl border border-[#c3c6ce]/40">
              <h4 className="text-xs font-bold text-[#006b5b] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Pros
              </h4>
              <ul className="space-y-1.5 text-xs text-[#0b1c30]">
                {review.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#006b5b] font-bold">✓</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-[#ffdad6]/40 rounded-xl border border-[#ffdad6]">
              <h4 className="text-xs font-bold text-[#93000a] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Cons
              </h4>
              <ul className="space-y-1.5 text-xs text-[#0b1c30]">
                {review.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#93000a] font-bold">✗</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Technical Specs Table */}
          {review.specs && review.specs.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-[#43474d] uppercase tracking-wider mb-2">
                Key Specifications
              </h4>
              <div className="border border-[#c3c6ce]/40 rounded-xl overflow-hidden">
                {review.specs.map((spec, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-3.5 py-2 text-xs ${
                      i % 2 === 0 ? 'bg-[#f8f9ff]' : 'bg-white'
                    }`}
                  >
                    <span className="font-semibold text-[#43474d]">{spec.label}</span>
                    <span className="text-[#000c1b] font-mono text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Affiliate Link Monospace */}
          <div>
            <label className="block text-xs font-bold text-[#43474d] uppercase tracking-wider mb-1.5">
              Verified Merchant Link
            </label>
            <div className="flex items-center gap-2 p-2 bg-[#dce9ff]/50 rounded-lg border border-[#c3c6ce]/50">
              <span className="text-xs font-mono text-[#006b5b] truncate flex-1 px-2">
                {review.affiliateUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 text-xs font-semibold bg-white hover:bg-[#26fedc] text-[#000c1b] px-3 py-1.5 rounded-md border border-[#c3c6ce]/40 transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#006b5b]" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-[#eff4ff] bg-[#f8f9ff] flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={handleVisit}
            className="w-full sm:flex-1 bg-[#26fedc] hover:bg-[#00f5d4] text-[#000c1b] font-bold py-3 px-4 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-[1.01]"
          >
            <span>View Pricing & Deals on Amazon</span>
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-3 rounded-xl border border-[#c3c6ce] text-[#43474d] hover:bg-white text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
