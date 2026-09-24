import type { Catalog } from '../../shared/catalog';
// These are illustrative concepts, not live merchant listings. Never imported into Supabase.
const picks = [
  ['a-little-light', 'A little light, a softer evening.', 'Home & living', 'lamp', 'A warm corner starts with a simple lamp. Look for a shade that softens the light and a size that fits your bedside table.', ['lighting', 'slow living'], 'Table lamp in a softly lit interior'],
  ['make-room-to-unwind', 'Make room to unwind.', 'Home & living', 'chair', 'A simple stool can find a home in a quiet corner, beside a desk, or at the kitchen counter. Check height and materials before choosing yours.', ['furniture', 'slow living'], 'Minimal wooden stool against a blue background'],
  ['your-own-little-world', 'Your own little world.', 'Tech & desk', 'headphones', 'Over-ear headphones for the moments you want to tune in. Compare comfort, compatibility, and the included accessories at each store.', ['audio', 'work'], 'Over-ear headphones'],
  ['take-the-slow-route', 'Take the slow route.', 'On the go', 'bag', 'An everyday tote for carrying a little less and heading a little further. Check dimensions and materials before choosing your version.', ['travel', 'everyday'], 'Natural canvas tote bag'],
  ['time-well-spent', 'Time, well spent.', 'Style & essentials', 'watch', 'A simple watch makes an easy everyday companion. Explore the details that matter to you, from strap material to case size.', ['everyday', 'accessories'], 'Minimal wristwatch on a light background'],
  ['the-morning-pause', 'The morning pause.', 'Kitchen & dining', 'coffee', 'A favorite cup makes the first few minutes of the day feel different. Find a shape, finish, and capacity that feels right.', ['coffee', 'slow living'], 'A cup of coffee'],
] as const;
export const demoCatalog: Catalog = {
  revision: 0, demo: true,
  products: picks.map((p, i) => ({
    id: `demo-${i + 1}`, slug: p[0], title: p[1], category: p[2], poster_url: `/demo/${p[3]}.jpg`,
    description: p[4], tags: [...p[5]], poster_alt: p[6], stores: [], featured: i === 0,
    revision: 1, created_at: `2026-09-0${8 - i}T12:00:00Z`,
  })),
};
