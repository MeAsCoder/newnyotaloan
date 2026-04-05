/**
 * lib/paymentStore.js
 * 
 * Uses Node.js global object so the store persists across
 * all API route calls within the same Next.js server process.
 * 
 * In production, replace with a real database (Supabase, Firebase, Redis, etc.)
 */

if (!global._paymentStore) {
  global._paymentStore = {}
}

export const paymentStore = global._paymentStore

/**
 * Set a payment result by reference key.
 */
export function setPayment(ref, data) {
  global._paymentStore[ref] = {
    ...data,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Get a payment result by reference key.
 * Returns null if not found.
 */
export function getPayment(ref) {
  return global._paymentStore[ref] || null
}
