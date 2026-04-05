export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phone, amount, reference, customerName } = req.body

  if (!phone || !amount || !reference) {
    return res.status(400).json({ error: 'Missing required fields: phone, amount, reference' })
  }

  // ----- FIXED PHONE FORMATTING -----
  let formattedPhone = phone.replace(/^\+/, '').replace(/\s/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1)
  } else if (!formattedPhone.startsWith('254')) {
    formattedPhone = '254' + formattedPhone
  }
  // Ensure 9 digits after 254
  let after254 = formattedPhone.slice(3)
  if (after254.length === 10) {
    after254 = after254.slice(0, -1)
    formattedPhone = '254' + after254
  }
  if (formattedPhone.length !== 12) {
    return res.status(400).json({ error: 'Invalid phone number. Must be 9 digits after 254.' })
  }
  // ---------------------------------

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const callbackUrl = `${baseUrl}/api/payhero-callback`

  const payload = {
    amount: parseInt(amount),
    phone_number: formattedPhone,
    channel_id: 5403,
    provider: 'm-pesa',
    external_reference: reference,
    customer_name: customerName || '',
    callback_url: callbackUrl,
  }

  console.log('STK Push payload:', JSON.stringify(payload))

  try {
    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic UjFjMVVuYmF3SW1YamJvdHVZWDk6WWdQT0prSDJCUUhieVpCRFpjbXJqWlM3VmlZNkF5YzFoVWExa3hnWQ==',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    console.log('PayHero response:', JSON.stringify(data))

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error_message || data.message || 'PayHero request failed',
        details: data,
      })
    }

    return res.status(201).json({
      success: true,
      status: data.status,
      reference: data.reference,
      CheckoutRequestID: data.CheckoutRequestID,
    })

  } catch (err) {
    console.error('STK Push fetch error:', err)
    return res.status(500).json({ error: 'Internal server error', message: err.message })
  }
}