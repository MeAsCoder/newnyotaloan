/**
 * POST /api/payhero-callback
 * 
 * PayHero calls this URL after the user responds to the STK Push.
 * Handles: success, user cancellation, timeout, insufficient funds, etc.
 * 
 * PayHero ResultCodes:
 *   0    = Success
 *   1    = Insufficient funds
 *   17   = Rule limited
 *   1032 = User cancelled (dismissed STK prompt)
 *   1037 = Request timeout (user did not respond)
 *   2001 = Wrong PIN
 */

import { setPayment } from '@/lib/paymentStore'

const CANCEL_CODES = [1032, 1037]
const FAIL_MESSAGES = {
  0:    'Payment successful',
  1:    'Insufficient M-Pesa balance',
  17:   'Transaction limit exceeded',
  1032: 'You cancelled the payment request',
  1037: 'Payment request timed out — no response from phone',
  2001: 'Incorrect M-Pesa PIN entered',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body
    console.log('[PayHero Callback]', JSON.stringify(body, null, 2))

    // PayHero wraps result inside a "response" key
    const response = body.response || body || {}

    const {
      Amount,
      CheckoutRequestID,
      ExternalReference,
      MpesaReceiptNumber,
      Phone,
      ResultCode,
      ResultDesc,
      Status,
    } = response

    const resultCode = parseInt(ResultCode ?? -1)
    const isSuccess = resultCode === 0 && Status === 'Success'
    const isCancelled = CANCEL_CODES.includes(resultCode)
    const friendlyMessage = FAIL_MESSAGES[resultCode] || ResultDesc || 'Payment could not be completed'

    let finalStatus = 'FAILED'
    if (isSuccess) finalStatus = 'SUCCESS'
    else if (isCancelled) finalStatus = 'CANCELLED'

    if (ExternalReference) {
      setPayment(ExternalReference, {
        status: finalStatus,
        success: isSuccess,
        cancelled: isCancelled,
        amount: Amount,
        checkoutRequestId: CheckoutRequestID,
        mpesaReceipt: MpesaReceiptNumber || null,
        phone: Phone,
        resultCode,
        resultDesc: ResultDesc,
        friendlyMessage,
        processedAt: new Date().toISOString(),
      })
    }

    console.log(`[PayHero Callback] ref=${ExternalReference} status=${finalStatus} code=${resultCode}`)

    // Always acknowledge PayHero immediately
    return res.status(200).json({ received: true })

  } catch (err) {
    console.error('[PayHero Callback] Error:', err)
    return res.status(500).json({ error: 'Callback processing failed' })
  }
}
