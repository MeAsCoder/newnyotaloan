export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { reference } = req.query
  if (!reference) {
    return res.status(400).json({ error: 'Missing reference parameter' })
  }

  // Use the same PayHero credentials as in stk-push
  const authToken = 'Basic UjFjMVVuYmF3SW1YamJvdHVZWDk6WWdQT0prSDJCUUhieVpCRFpjbXJqWlM3VmlZNkF5YzFoVWExa3hnWQ=='

  try {
    const response = await fetch(
      `https://backend.payhero.co.ke/api/v2/transaction-status?reference=${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data.message || 'Invalid Transaction Details',
      })
    }

    // Expected response: { status: "SUCCESS"|"QUEUED"|"FAILED", provider_reference, ... }
    const isSuccess = data.status === 'SUCCESS'
    return res.status(200).json({
      success: isSuccess,
      status: data.status,
      provider_reference: data.provider_reference,
      third_party_reference: data.third_party_reference,
      message: isSuccess ? 'Payment confirmed' : 'Payment not successful',
    })
  } catch (err) {
    console.error('Manual verification error:', err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}