/**
 * GET /api/payment-status?ref=NFD-FEE-XXXXXX
 * 
 * Polled by the dashboard every 4 seconds after STK Push is sent.
 * Returns the latest payment status for the given reference.
 * 
 * Possible status values:
 *   PENDING   - callback not yet received from PayHero
 *   SUCCESS   - payment confirmed (ResultCode 0)
 *   CANCELLED - user dismissed/cancelled the STK prompt (ResultCode 1032/1037)
 *   FAILED    - payment failed for other reason (wrong PIN, insufficient funds, etc.)
 */

import { getPayment } from '@/lib/paymentStore'

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ref } = req.query
  if (!ref) {
    return res.status(400).json({ error: 'Missing ref parameter' })
  }

  const result = getPayment(ref)

  if (!result) {
    // Not yet received from PayHero — still waiting
    return res.status(200).json({
      status: 'PENDING',
      message: 'Awaiting payment confirmation from M-Pesa…',
    })
  }

  return res.status(200).json(result)
}
