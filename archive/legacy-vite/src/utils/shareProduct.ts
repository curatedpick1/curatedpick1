import { Product } from '../types';

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard';
  message: string;
}

/**
 * Triggers the browser's native share dialog containing product name and current price.
 * Falls back to copying details to clipboard if native share is not supported or fails.
 */
export async function shareProduct(product: Product): Promise<ShareResult> {
  const shareText = `${product.name} - Current Price: $${product.price}${
    product.originalPrice && product.originalPrice > product.price
      ? ` (Original: $${product.originalPrice})`
      : ''
  }\n${product.description ? product.description.slice(0, 140) : 'Curated pick on Curated Pick'}`;

  const shareUrl = product.affiliateUrl || window.location.href;

  const shareData: ShareData = {
    title: product.name,
    text: `${product.name} ($${product.price})\n${shareText}`,
    url: shareUrl,
  };

  // Check if native Web Share API is available and can share this data
  if (
    typeof navigator !== 'undefined' &&
    navigator.share &&
    (typeof navigator.canShare === 'function' ? navigator.canShare(shareData) : true)
  ) {
    try {
      await navigator.share(shareData);
      return {
        success: true,
        method: 'native',
        message: `Shared "${product.name}" ($${product.price})`,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User closed or dismissed the native share sheet
        return {
          success: false,
          method: 'native',
          message: 'Share dismissed',
        };
      }
      // If native sharing failed due to permission or sandbox, fallback to clipboard
      console.warn('Native share failed, falling back to clipboard:', error);
    }
  }

  // Fallback to Clipboard API
  try {
    const copyContent = `${product.name} ($${product.price})\n${shareUrl}`;
    await navigator.clipboard.writeText(copyContent);
    return {
      success: true,
      method: 'clipboard',
      message: `Copied "${product.name}" ($${product.price}) to clipboard!`,
    };
  } catch {
    return {
      success: false,
      method: 'clipboard',
      message: `Unable to share "${product.name}".`,
    };
  }
}
