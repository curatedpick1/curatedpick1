import type { StoreLink } from './catalog.ts';
// Missing, malformed or expired retailer data must never turn into invented prices/ratings.
export function retailerDetails(store: StoreLink, now = Date.now()) {
  const s=store.snapshot;
  const age=s ? now-Date.parse(s.checked_at) : Infinity;
  const valid=s?.source==='retailer-api' && Number.isFinite(age) && age>=0 && age<=3600000;
  let price:string|undefined;
  if(valid && typeof s.price==='number' && Number.isFinite(s.price) && s.price>0 && typeof s.currency==='string' && /^[A-Z]{3}$/.test(s.currency)) {
    try{price=new Intl.NumberFormat('en-US',{style:'currency',currency:s.currency}).format(s.price);}catch{}
  }
  const rating=valid && typeof s.rating==='number' && s.rating>=0 && s.rating<=5 ? s.rating : undefined;
  const count=valid && Number.isInteger(s.review_count) && s.review_count!>=0 ? s.review_count : undefined;
  const url=new URL(store.url);
  if(store.name.toLowerCase()==='amazon')url.hash='customerReviews';
  if(valid && s.review_url){try{const review=new URL(s.review_url);if(review.protocol==='https:' && review.hostname===url.hostname && !review.username && !review.password)url.href=review.href;}catch{}}
  return {price,rating,count,reviewUrl:url.href,checkedAt:valid?s.checked_at:undefined};
}
