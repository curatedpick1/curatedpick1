import React from 'react';
import { X, ShieldCheck, Mail, FileText, Lock } from 'lucide-react';

interface DisclosureModalProps {
  type: 'disclosure' | 'privacy' | 'terms' | 'contact' | null;
  onClose: () => void;
}

export const DisclosureModal: React.FC<DisclosureModalProps> = ({
  type,
  onClose,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000c1b]/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#c3c6ce]/30 my-8 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#eff4ff] bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            {type === 'disclosure' && (
              <ShieldCheck className="w-5 h-5 text-[#006b5b]" />
            )}
            {type === 'privacy' && <Lock className="w-5 h-5 text-[#006b5b]" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-[#006b5b]" />}
            {type === 'contact' && <Mail className="w-5 h-5 text-[#006b5b]" />}
            <h3 className="font-bold text-base text-[#000c1b]">
              {type === 'disclosure' && 'Affiliate Disclosure'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'terms' && 'Terms of Service'}
              {type === 'contact' && 'Contact Us'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#74777e] hover:text-[#000c1b] p-1.5 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-[#43474d] leading-relaxed">
          {type === 'disclosure' && (
            <>
              <p className="font-semibold text-[#000c1b]">
                Transparency and editorial independence are the foundation of The Curated Pick.
              </p>
              <p>
                In compliance with the FTC guidelines, please assume that any links leading to third-party retailers (such as Amazon, Best Buy, or merchant storefronts) are affiliate links.
              </p>
              <p>
                When you click through our affiliate links and complete a purchase, we may earn a small referral commission at <strong className="text-[#000c1b]">no additional cost to you</strong>.
              </p>
              <p>
                Our editorial ratings, lab benchmarks, and pros/cons are strictly independent. Brands cannot purchase placement or alter our testing verdicts.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                We respect your privacy. We do not sell your personal data. Any browsing information is strictly anonymized to evaluate conversion metrics and enhance user interface responsiveness.
              </p>
              <p>
                Third-party merchants to which we link may place tracking cookies upon redirect according to their standard associate policies.
              </p>
            </>
          )}

          {type === 'terms' && (
            <>
              <p>
                All product specs, retail pricing, discounts, and availability are subject to change by respective third-party merchants at any moment.
              </p>
              <p>
                The Curated Pick strives to maintain accurate real-time telemetry, but always confirm final pricing at retailer checkout.
              </p>
            </>
          )}

          {type === 'contact' && (
            <>
              <p>
                Have a product suggestion, editorial correction, or partnership inquiry?
              </p>
              <div className="p-3.5 bg-[#eff4ff] rounded-xl border border-[#c3c6ce]/30 space-y-2 text-xs">
                <div>
                  <div className="font-bold text-[#000c1b]">Editorial & Support Inquiries:</div>
                  <a
                    href="mailto:curatedpick.store@gmail.com"
                    className="text-[#006b5b] font-mono hover:underline font-semibold"
                  >
                    curatedpick.store@gmail.com
                  </a>
                </div>
                <div className="pt-1">
                  <div className="font-bold text-[#000c1b]">Affiliate & Partnership Relations:</div>
                  <a
                    href="mailto:curatedpick.store@gmail.com"
                    className="text-[#006b5b] font-mono hover:underline font-semibold"
                  >
                    curatedpick.store@gmail.com
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#eff4ff] bg-[#f8f9ff] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#26fedc] text-[#000c1b] font-bold text-xs px-4 py-2 rounded-lg hover:scale-105 transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
