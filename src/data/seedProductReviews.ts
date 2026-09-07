import { ProductUserReview } from '../types';

export const SEED_PRODUCT_REVIEWS: Record<string, ProductUserReview[]> = {
  'prod-1': [
    {
      id: 'rev-p1-1',
      productId: 'prod-1',
      author: 'Marcus Vance',
      rating: 5,
      title: 'Best fitness and outdoor tracking smartwatch I have owned',
      comment:
        'The GPS lock is virtually instantaneous even under dense forest canopy. The titanium bezel has taken a few knocks against granite without a single scratch. Plus, solar recharging gives me over 2 full weeks between wall charges.',
      date: 'Aug 28, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 19,
    },
    {
      id: 'rev-p1-2',
      productId: 'prod-1',
      author: 'Dr. Sarah Chen',
      rating: 5,
      title: 'Outstanding biometric accuracy and sleep tracking',
      comment:
        'As an avid marathon runner and physician, I tested the HRV and VO2 max readings against medical grade chest straps. The telemetry is within 1.5% variance. Highly recommended for endurance athletes.',
      date: 'Aug 14, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 12,
    },
    {
      id: 'rev-p1-3',
      productId: 'prod-1',
      author: 'David Kowalski',
      rating: 4,
      title: 'Premium hardware, strap is a bit stiff at first',
      comment:
        'Phenomenal sapphire screen and tactile buttons that work even with thick winter gloves. Only minor gripe is the silicone strap takes about a week to break in comfortably.',
      date: 'Jul 29, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 5,
    },
  ],
  'prod-2': [
    {
      id: 'rev-p2-1',
      productId: 'prod-2',
      author: 'Jordan Patel',
      rating: 5,
      title: 'ANC rivals the top tier flagships for significantly less',
      comment:
        'I commute daily on the subway and these completely silence track screeches and ambient chatter. The beryllium drivers deliver deep, textured sub-bass without muddying vocals.',
      date: 'Aug 25, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 26,
    },
    {
      id: 'rev-p2-2',
      productId: 'prod-2',
      author: 'Elena Rostova',
      rating: 4,
      title: 'Plush ear cushions, great spatial stage',
      comment:
        'Super comfortable for 8-hour workday calls and editing sessions. The multipoint pairing between MacBook and iPhone works seamlessly.',
      date: 'Aug 03, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 8,
    },
  ],
  'prod-3': [
    {
      id: 'rev-p3-1',
      productId: 'prod-3',
      author: 'Antonio Rossi',
      rating: 5,
      title: 'True cafe-quality microfoam and rich crema at home',
      comment:
        'The dual-boiler setup allows simultaneous extraction and milk steaming without temperature drop. The 15-bar Italian pump extracts a velvety 25-second double shot.',
      date: 'Aug 20, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 34,
    },
    {
      id: 'rev-p3-2',
      productId: 'prod-3',
      author: 'Chloe Miller',
      rating: 5,
      title: 'Fast heat-up and PID temperature precision',
      comment:
        'Heats up in under 3 minutes compared to 15 minutes on older machines. The commercial grade portafilter has substantial weight and balance.',
      date: 'Jul 15, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 15,
    },
  ],
  'prod-4': [
    {
      id: 'rev-p4-1',
      productId: 'prod-4',
      author: 'Devon Wright',
      rating: 5,
      title: 'Infinite contrast and razor-sharp 240Hz fluidity',
      comment:
        'Coming from an IPS panel, the pure blacks and HDR specular highlights in competitive games and color grading work blew me away. No noticeable burn-in or text fringing.',
      date: 'Aug 19, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 17,
    },
    {
      id: 'rev-p4-2',
      productId: 'prod-4',
      author: 'Maya Lin',
      rating: 4,
      title: 'Gorgeous panel, recommend dimming in very bright rooms',
      comment:
        'Color calibration out of the box was 99.8% DCI-P3 accurate. The matte finish helps diffuse light, but OLED shines best in controlled lighting.',
      date: 'Aug 02, 2026',
      isVerifiedBuyer: true,
      helpfulCount: 7,
    },
  ],
};

export function getInitialProductReviews(productId: string, productName?: string): ProductUserReview[] {
  if (SEED_PRODUCT_REVIEWS[productId]) {
    return [...SEED_PRODUCT_REVIEWS[productId]];
  }

  // Fallback realistic reviews for any custom product
  const name = productName || 'product';
  return [
    {
      id: `rev-${productId}-1`,
      productId,
      author: 'Alex Morgan',
      rating: 5,
      title: `Exceeded expectations for the price`,
      comment: `Really satisfied with this ${name}. Build quality is solid, delivery was fast, and it matches all the specifications listed. Would purchase again.`,
      date: '1 week ago',
      isVerifiedBuyer: true,
      helpfulCount: 7,
    },
    {
      id: `rev-${productId}-2`,
      productId,
      author: 'Sam Taylor',
      rating: 4,
      title: `High quality and reliable daily performance`,
      comment: `Everything works exactly as advertised. Clean design, good ergonomics, and intuitive functionality right out of the packaging.`,
      date: '2 weeks ago',
      isVerifiedBuyer: true,
      helpfulCount: 4,
    },
  ];
}
