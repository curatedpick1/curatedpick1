import test from 'node:test';
import assert from 'node:assert/strict';
import { retailerDetails } from '../shared/retailer.ts';
import type { StoreLink } from '../shared/catalog.ts';
test('retailer prices and review counts appear only for fresh valid data',()=>{
  const now=Date.parse('2026-09-27T12:00:00Z');
  const store:StoreLink={name:'Amazon',url:'https://www.amazon.com/dp/B000000001?tag=curated-20',snapshot:{price:57.07,currency:'USD',rating:4.6,review_count:31,checked_at:'2026-09-27T11:45:00Z',source:'retailer-api'}};
  const details=retailerDetails(store,now);
  assert.equal(details.price,'$57.07');assert.equal(details.count,31);
  assert.equal(details.reviewUrl,'https://www.amazon.com/dp/B000000001?tag=curated-20#customerReviews');
  assert.equal(retailerDetails(store,now+3600000).price,undefined);
  assert.equal(retailerDetails(store,now+3600000).count,undefined);
  assert.equal(retailerDetails({...store,snapshot:undefined},now).price,undefined);
  assert.equal(retailerDetails({...store,snapshot:{...store.snapshot!,review_url:'https://evil.example/reviews'}},now).reviewUrl,details.reviewUrl);
});
