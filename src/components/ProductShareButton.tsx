import React, { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Product } from '../types';
import { shareProduct } from '../utils/shareProduct';

interface ProductShareButtonProps {
  product: Product;
  variant?: 'overlay' | 'footer' | 'pill';
  onNotify?: (message: string) => void;
  className?: string;
}

export const ProductShareButton: React.FC<ProductShareButtonProps> = ({
  product,
  variant = 'overlay',
  onNotify,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleShareClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isSharing) return;

    setIsSharing(true);
    try {
      const result = await shareProduct(product);
      if (result.success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);

        if (onNotify) {
          onNotify(result.message);
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const shareLabel = `Share ${product.name} - $${product.price}`;

  if (variant === 'footer') {
    return (
      <button
        type="button"
        id={`btn-share-footer-${product.id}`}
        onClick={handleShareClick}
        title={copied ? 'Details copied!' : shareLabel}
        aria-label={shareLabel}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-md transition-all duration-150 cursor-pointer ${
          copied
            ? 'bg-[#26fedc]/25 text-[#006b5b] font-bold'
            : 'bg-[#eff4ff] hover:bg-[#d8e6ff] text-[#43474d] hover:text-[#000c1b]'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-[#006b5b] stroke-[2.5]" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-3 h-3 text-current stroke-[2]" />
            <span>Share</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        id={`btn-share-pill-${product.id}`}
        onClick={handleShareClick}
        title={copied ? 'Details copied!' : shareLabel}
        aria-label={shareLabel}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 shadow-2xs cursor-pointer ${
          copied
            ? 'bg-[#26fedc]/30 text-[#006b5b] border border-[#006b5b]/30'
            : 'bg-white border border-[#c3c6ce]/40 text-[#000c1b] hover:bg-[#eff4ff]'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#006b5b]" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </>
        )}
      </button>
    );
  }

  // Default 'overlay' icon button matching Compare & Wishlist circular buttons
  return (
    <button
      type="button"
      id={`btn-share-card-${product.id}`}
      onClick={handleShareClick}
      title={copied ? 'Details copied!' : shareLabel}
      aria-label={shareLabel}
      className={`p-1.5 rounded-full backdrop-blur-xs transition-all duration-200 shadow-xs flex items-center justify-center cursor-pointer ${
        copied
          ? 'bg-[#000c1b] text-[#26fedc] scale-110 shadow-md ring-2 ring-[#26fedc]'
          : 'bg-white/80 hover:bg-white text-[#74777e] hover:text-[#000c1b] opacity-85 group-hover:opacity-100 hover:scale-110'
      } ${className}`}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-[#26fedc] stroke-[2.5]" />
      ) : (
        <Share2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
};
