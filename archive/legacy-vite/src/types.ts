export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  affiliateUrl: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  tag?: string;
  tagType?: 'top-rated' | 'deal' | 'editor' | 'custom';
  isFeatured?: boolean;
  pros?: string[];
  cons?: string[];
  clicks?: number;
  brand?: string;
  dateAdded?: string;
  hasPriceAlert?: boolean;
  priceAlertTarget?: number;
  priceAlertEmail?: string;
  priceTrend30d?: PriceTrend;
  barcode?: string;
  qrCodeValue?: string;
  retailer?: string;
  warranty?: string;
  shippingInfo?: string;
  availability?: 'In Stock' | 'Limited Stock' | 'Pre-Order';
  specs?: { label: string; value: string }[];
}

export interface PriceTrend {
  direction: 'down' | 'up' | 'stable';
  changeAmount: number;
  changePercentage: number;
  previousPrice: number;
  timeframe?: string;
}

export interface PriceAlertConfig {
  productId: string;
  enabled: boolean;
  targetPrice: number;
  email?: string;
  notifyOnAnyDrop?: boolean;
  createdAt: string;
}

export interface ReviewItem {
  id: string;
  productId?: string;
  title: string;
  subtitle: string;
  author: string;
  authorRole: string;
  date: string;
  rating: number;
  verdict: string;
  summary: string;
  fullContent: string[];
  imageUrl: string;
  tag: string;
  pros: string[];
  cons: string[];
  specs: { label: string; value: string }[];
  affiliateUrl: string;
  price: number;
}

export interface DealItem {
  id: string;
  productName: string;
  category: string;
  discountPercentage: number;
  originalPrice: number;
  dealPrice: number;
  couponCode?: string;
  expiresIn: string;
  affiliateUrl: string;
  imageUrl: string;
  badgeText: string;
  claimedCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  content: string[];
  imageUrl: string;
  likes?: number;
}

export type NavigationTab = 'home' | 'reviews' | 'deals' | 'saved' | 'blog';

export interface ProductUserReview {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  isVerifiedBuyer?: boolean;
  helpfulCount: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
  memberSince: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  notifications: {
    priceDrops: boolean;
    weeklyDigest: boolean;
    reviewReplies: boolean;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  recommendedProductIds?: string[];
}
