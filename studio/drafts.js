// Browser-local data only: never store passwords, sessions, or privileged keys.
const database = new Promise((resolve, reject) => {
  const open = indexedDB.open('curated-studio-drafts', 1);
  open.onupgradeneeded = () => open.result.createObjectStore('drafts', {keyPath: 'id'});
  open.onsuccess = () => resolve(open.result);
  open.onerror = () => reject(open.error);
});
// Attach a handler immediately, including browsers that deny local storage.
database.catch(() => {});

async function transaction(mode, action) {
  const db = await database;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('drafts', mode);
    let result, failure;
    tx.oncomplete = () => resolve(result);
    tx.onabort = () => reject(failure || tx.error || new Error('Local draft could not be saved.'));
    action(tx.objectStore('drafts'), value => {result = value;}, message => {failure = new Error(message); tx.abort();});
  });
}
export function listDrafts() {
  return transaction('readonly', (store, done) => {store.getAll().onsuccess = event => done(event.target.result.sort((a,b) => b.updatedAt-a.updatedAt));});
}
export function putDraft(draft, expectedVersion) {
  return transaction('readwrite', (store, done, fail) => {
    store.get(draft.id).onsuccess = event => {
      const current = event.target.result;
      if ((current?.version || 0) !== expectedVersion) {fail('This local draft changed in another tab. Reopen it before saving; your current edits are still in the form.'); return;}
      const saved = {...draft, version: expectedVersion+1, updatedAt: Date.now()};
      store.put(saved); done(saved);
    };
  });
}
export function deleteDraft(id, expectedVersion) {
  return transaction('readwrite', (store, done, fail) => {
    store.get(id).onsuccess = event => {
      if ((event.target.result?.version || 0) !== expectedVersion) {fail('This local draft changed in another tab. Reopen it before deleting.'); return;}
      store.delete(id); done();
    };
  });
}
