import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import styles from './dashboard.module.css'

// 5% facilitation fee
const calcFee = (amount) => Math.round(amount * 0.005)

function generateTrackingNumber() {
  return 'NFD-' + Math.random().toString(36).substr(2, 8).toUpperCase()
}

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// Loan status stages with timing
const STATUS_STAGES = [
  { key: 'application', label: 'Application Submitted', icon: '📝', desc: 'Your loan application has been received and is in our system.' },
  { key: 'fee_pending', label: 'Awaiting Facilitation Fee', icon: '💳', desc: 'Pay the facilitation fee via M-Pesa to proceed with disbursement.' },
  { key: 'fee_paid', label: 'Fee Confirmed', icon: '✅', desc: 'Your facilitation fee payment has been confirmed by M-Pesa.' },
  { key: 'processing', label: 'Processing Disbursement', icon: '⚙️', desc: 'Your loan is being processed and prepared for disbursement to your M-Pesa.' },
  { key: 'disbursed', label: 'Loan Disbursed', icon: '🏦', desc: 'Your loan has been sent to your M-Pesa wallet successfully.' },
]

export default function Dashboard() {
  const router = useRouter()
  const [loanData, setLoanData] = useState(null)
  const [loanStatus, setLoanStatus] = useState('fee_pending')
  const [trackingNumber] = useState(generateTrackingNumber)
  const [paymentRef] = useState(() => 'NFD-FEE-' + Math.random().toString(36).substr(2, 6).toUpperCase())

  // STK Push states
  const [stkStep, setStkStep] = useState('idle') // idle|form|sending|polling|manual_verification|success|failed|cancelled|timeout
  const [stkPhone, setStkPhone] = useState('')
  const [stkError, setStkError] = useState('')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [mpesaReceipt, setMpesaReceipt] = useState('')
  const [pollCount, setPollCount] = useState(0)
  const pollRef = useRef(null)

  // Manual verification states
  const [manualReceipt, setManualReceipt] = useState('')
  const [manualVerifying, setManualVerifying] = useState(false)
  const [manualError, setManualError] = useState('')

  // Dates
  const appliedAt = loanData?.appliedAt || new Date().toISOString()
  const disburseDate = addDays(appliedAt, 2).toISOString()
  const repayDate = addDays(appliedAt, 32).toISOString()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = sessionStorage.getItem('loanData')
      if (raw) {
        const data = JSON.parse(raw)
        setLoanData(data)
        setStkPhone(data.phone || '')
      } else {
        setLoanData({
          amount: 15000,
          loanType: 'Karo Loan',
          period: '1 – 3 months',
          rate: '10% per month',
          phone: '0712345678',
          name: 'Demo User',
          email: 'demo@nyotafund.co.ke',
          appliedAt: new Date().toISOString(),
        })
        setStkPhone('0712345678')
      }
    }
  }, [])

  useEffect(() => {
    if (loanStatus === 'fee_paid') {
      const t1 = setTimeout(() => setLoanStatus('processing'), 3000)
      return () => clearTimeout(t1)
    }
  }, [loanStatus])

  // ── STK Push flow ──
  const handleSendSTK = async () => {
    if (!stkPhone || stkPhone.replace(/\D/g, '').length < 9) {
      setStkError('Enter a valid M-Pesa number')
      return
    }
    setStkError('')
    setStkStep('sending')

    try {
      const res = await fetch('/api/stk-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: stkPhone,
          amount: calcFee(loanData?.amount || 0),
          reference: paymentRef,
          customerName: loanData?.name || '',
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.error && (data.error.includes('credentials') || res.status === 500)) {
          simulateDemoPayment()
          return
        }
        setStkStep('failed')
        setStkError(data.error || 'STK Push failed. Please try again.')
        return
      }

      setCheckoutRequestId(data.CheckoutRequestID)
      setStkStep('polling')
      startPolling(paymentRef)
    } catch (err) {
      simulateDemoPayment()
    }
  }

  const simulateDemoPayment = () => {
    setStkStep('polling')
    setTimeout(() => {
      setMpesaReceipt('SAE' + Math.random().toString(36).substr(2, 7).toUpperCase())
      setStkStep('success')
      setLoanStatus('fee_paid')
    }, 4000)
  }

  /*

  // Modified polling: stops after 10 seconds, shows manual verification
  const startPolling = (ref) => {
    let count = 0
    const POLL_INTERVAL = 3000   // every 3 seconds
    const MAX_WAIT_MS = 10000    // 10 seconds

    clearInterval(pollRef.current)

    const timeoutId = setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
        // If still polling after 10s, switch to manual verification
        if (stkStep === 'polling') {
          setStkStep('manual_verification')
        }
      }
    }, MAX_WAIT_MS)

    pollRef.current = setInterval(async () => {
      count++
      setPollCount(count)

      try {
        const res = await fetch(`/api/payment-status?ref=${ref}`)
        const data = await res.json()

        if (data.status === 'SUCCESS') {
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setMpesaReceipt(data.mpesaReceipt || '')
          setStkStep('success')
          setLoanStatus('fee_paid')
        } else if (data.status === 'CANCELLED') {
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setStkStep('cancelled')
          setStkError(data.friendlyMessage || 'You cancelled the M-Pesa request.')
        } else if (data.status === 'FAILED') {
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setStkStep('failed')
          setStkError(data.friendlyMessage || 'Payment failed. Please try again.')
        }
      } catch (e) {
        console.error('Polling error:', e)
      }
    }, POLL_INTERVAL)
  }

  */

const startPolling = (ref) => {
  let count = 0
  const POLL_INTERVAL = 3000   // every 3 seconds
  const MAX_WAIT_MS = 10000    // 10 seconds
  let didComplete = false       // prevent multiple transitions

  clearInterval(pollRef.current)

  const timeoutId = setTimeout(() => {
    if (!didComplete && pollRef.current) {
      didComplete = true
      clearInterval(pollRef.current)
      pollRef.current = null
      console.log('[Polling] Timeout reached, switching to manual verification')
      // Use a functional update to avoid stale closure
      setStkStep((prevStep) => {
        if (prevStep === 'polling') {
          return 'manual_verification'
        }
        return prevStep
      })
    }
  }, MAX_WAIT_MS)

  pollRef.current = setInterval(async () => {
    count++
    setPollCount(count)

    try {
      const res = await fetch(`/api/payment-status?ref=${ref}`)
      const data = await res.json()

      if (data.status === 'SUCCESS') {
        if (!didComplete) {
          didComplete = true
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setMpesaReceipt(data.mpesaReceipt || '')
          setStkStep('success')
          setLoanStatus('fee_paid')
        }
      } else if (data.status === 'CANCELLED') {
        if (!didComplete) {
          didComplete = true
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setStkStep('cancelled')
          setStkError(data.friendlyMessage || 'You cancelled the M-Pesa request.')
        }
      } else if (data.status === 'FAILED') {
        if (!didComplete) {
          didComplete = true
          clearInterval(pollRef.current)
          clearTimeout(timeoutId)
          setStkStep('failed')
          setStkError(data.friendlyMessage || 'Payment failed. Please try again.')
        }
      }
      // If status is PENDING or anything else, keep polling
    } catch (e) {
      console.error('Polling error:', e)
      // Do not stop polling on network errors – keep trying until timeout
    }
  }, POLL_INTERVAL)
}




  // Manual verification using PayHero transaction-status API
  const handleManualVerification = async () => {
    if (!manualReceipt.trim()) {
      setManualError('Please paste your M-Pesa confirmation message')
      return
    }

    // Extract receipt code (e.g., SKQ96C7K7H) from message
    const receiptMatch = manualReceipt.match(/[A-Z0-9]{8,}/)
    const receiptCode = receiptMatch ? receiptMatch[0] : null

    if (!receiptCode) {
      setManualError('Could not find a valid M-Pesa receipt code in the message')
      return
    }

    setManualVerifying(true)
    setManualError('')

    try {
      const res = await fetch(`/api/verify-payment?reference=${receiptCode}`)
      const data = await res.json()

      if (data.success && data.status === 'SUCCESS') {
        setMpesaReceipt(receiptCode)
        setStkStep('success')
        setLoanStatus('fee_paid')
      } else {
        setManualError(data.message || 'Payment not confirmed. Please try again or contact support.')
      }
    } catch (err) {
      setManualError('Verification failed. Check your network and try again.')
    } finally {
      setManualVerifying(false)
    }
  }

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current)
  }, [])

  const fee = calcFee(loanData?.amount || 0)
  const currentStageIdx = STATUS_STAGES.findIndex(s => s.key === loanStatus)

  if (!loanData) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loadingSpinner} />
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  return (
    <>
      <Head><title>Dashboard — NyotaFund</title></Head>

      <nav className={styles.topNav}>
        <Link href="/" className={styles.navLogo}>Nyota<span>Fund</span></Link>
        <div className={styles.navRight}>
          <span className={styles.navUser}>👤 {loanData.name}</span>
          <Link href="/" className={styles.navLogout}>← Home</Link>
        </div>
      </nav>

      <div className={styles.pageWrap}>
        <div className={styles.pageInner}>

          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>My Loan Dashboard</h1>
              <p className={styles.pageSubtitle}>Track your loan application and disbursement status in real-time.</p>
            </div>
            <div className={styles.trackingBadge}>
              <span className={styles.trackingLabel}>Tracking Number</span>
              <span className={styles.trackingNum}>{trackingNumber}</span>
            </div>
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Approved Loan</div>
              <div className={styles.summaryValue} style={{ color: 'var(--brand)' }}>KES {loanData.amount.toLocaleString()}</div>
              <div className={styles.summaryMeta}>{loanData.loanType}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Facilitation Fee</div>
              <div className={styles.summaryValue} style={{ color: loanStatus === 'fee_paid' || loanStatus === 'processing' || loanStatus === 'disbursed' ? 'var(--success)' : 'var(--danger)' }}>
                KES {fee.toLocaleString()}
              </div>
              <div className={styles.summaryMeta}>{loanStatus === 'fee_pending' ? 'Not yet paid' : 'Paid ✓'}</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Expected Disbursement</div>
              <div className={styles.summaryValue} style={{ fontSize: 18 }}>{formatDate(disburseDate)}</div>
              <div className={styles.summaryMeta}>~2 business days</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryLabel}>Repayment Due</div>
              <div className={styles.summaryValue} style={{ fontSize: 18 }}>{formatDate(repayDate)}</div>
              <div className={styles.summaryMeta}>{loanData.period}</div>
            </div>
          </div>

          <div className={styles.mainGrid}>

            {/* LEFT COLUMN */}
            <div className={styles.leftCol}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Loan Status Tracker</h3>
                  <span className={`${styles.statusPill} ${styles['status_' + loanStatus]}`}>
                    {loanStatus === 'fee_pending' ? '⏳ Pending' :
                     loanStatus === 'fee_paid' ? '🔄 Fee Confirmed' :
                     loanStatus === 'processing' ? '⚙️ Processing' :
                     loanStatus === 'disbursed' ? '✅ Disbursed' : '📝 Submitted'}
                  </span>
                </div>
                <div className={styles.stageTracker}>
                  {STATUS_STAGES.map((stage, idx) => {
                    const isDone = idx < currentStageIdx
                    const isCurrent = idx === currentStageIdx
                    const isFuture = idx > currentStageIdx
                    return (
                      <div key={stage.key} className={styles.stageRow}>
                        <div className={styles.stageLeft}>
                          <div className={`${styles.stageDot}
                            ${isDone ? styles.stageDotDone : ''}
                            ${isCurrent ? styles.stageDotCurrent : ''}
                            ${isFuture ? styles.stageDotFuture : ''}`}>
                            {isDone ? '✓' : idx + 1}
                          </div>
                          {idx < STATUS_STAGES.length - 1 && (
                            <div className={`${styles.stageLine} ${isDone ? styles.stageLineDone : ''}`} />
                          )}
                        </div>
                        <div className={`${styles.stageContent} ${isFuture ? styles.stageContentFuture : ''}`}>
                          <div className={styles.stageTitle}>
                            <span>{stage.icon}</span>
                            <strong>{stage.label}</strong>
                            {isCurrent && <span className={styles.currentTag}>Current</span>}
                          </div>
                          <p className={styles.stageDesc}>{stage.desc}</p>
                          {stage.key === 'fee_paid' && mpesaReceipt && (
                            <div className={styles.stageExtra}>M-Pesa Receipt: <strong>{mpesaReceipt}</strong></div>
                          )}
                          {stage.key === 'disbursed' && loanStatus === 'disbursed' && (
                            <div className={styles.stageExtra}>
                              KES {loanData.amount.toLocaleString()} sent to {loanData.phone} · {formatDateTime(new Date().toISOString())}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {(loanStatus === 'processing' || loanStatus === 'disbursed') && (
                <div className={`${styles.card} ${styles.disbursementCard}`}>
                  <div className={styles.disbursementHeader}>
                    <div className={styles.mpesaIcon}>M</div>
                    <div>
                      <h3>Loan Disbursement</h3>
                      <p>Your loan is being processed for disbursement</p>
                    </div>
                  </div>
                  <div className={styles.disbursementGrid}>
                    <div className={styles.disbItem}><span>Amount</span><strong>KES {loanData.amount.toLocaleString()}</strong></div>
                    <div className={styles.disbItem}><span>M-Pesa Number</span><strong>{loanData.phone}</strong></div>
                    <div className={styles.disbItem}><span>Expected Date</span><strong>{formatDate(disburseDate)}</strong></div>
                    <div className={styles.disbItem}><span>Reference</span><strong>{trackingNumber}</strong></div>
                    <div className={styles.disbItem}><span>M-Pesa Receipt</span><strong>{mpesaReceipt || 'Pending'}</strong></div>
                    <div className={styles.disbItem}><span>Status</span>
                      <strong className={loanStatus === 'disbursed' ? styles.textSuccess : styles.textWarning}>
                        {loanStatus === 'disbursed' ? '✅ Disbursed' : '⚙️ Processing'}
                      </strong>
                    </div>
                  </div>
                  {loanStatus === 'processing' && (
                    <div className={styles.processingBanner}>
                      <div className={styles.miniSpinner} />
                      Your loan is being reviewed and will be sent to your M-Pesa by {formatDate(disburseDate)}.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN */}
            <div className={styles.rightCol}>
              {(loanStatus === 'fee_pending' || loanStatus === 'application') && (
                <div className={`${styles.card} ${styles.feeCard}`}>
                  <div className={styles.feeCardHeader}>
                    <h3>Pay Facilitation Fee</h3>
                    <span className={styles.feePill}>Required</span>
                  </div>
                  <p className={styles.feeDesc}>
                    To unlock disbursement of your <strong>KES {loanData.amount.toLocaleString()}</strong> loan, pay the one-time facilitation fee via M-Pesa.
                  </p>
                  <div className={styles.feeAmountBox}>
                    <div className={styles.feeAmtLabel}>Fee Amount (5%)</div>
                    <div className={styles.feeAmtVal}>KES {fee.toLocaleString()}</div>
                  </div>

                  {stkStep === 'idle' && (
                    <>
                      <div className="form-group">
                        <label>M-Pesa Number</label>
                        <input
                          type="tel"
                          placeholder="07XXXXXXXX"
                          value={stkPhone}
                          onChange={e => setStkPhone(e.target.value)}
                        />
                        {stkError && <span className={styles.stkErr}>{stkError}</span>}
                      </div>
                      <button className={styles.mpesaBtn} onClick={() => setStkStep('form')}>
                        Pay KES {fee.toLocaleString()} via M-Pesa →
                      </button>
                    </>
                  )}

                  {stkStep === 'form' && (
                    <>
                      <div className={styles.stkConfirmBox}>
                        <div className={styles.stkConfirmRow}><span>Amount</span><strong>KES {fee.toLocaleString()}</strong></div>
                        <div className={styles.stkConfirmRow}><span>To</span><strong>{stkPhone}</strong></div>
                        <div className={styles.stkConfirmRow}><span>Reference</span><strong>{paymentRef}</strong></div>
                        <div className={styles.stkConfirmRow}><span>Gateway</span><strong>PayHero · M-Pesa</strong></div>
                      </div>
                      {stkError && <div className={styles.stkErrBox}>{stkError}</div>}
                      <button className={styles.mpesaBtn} onClick={handleSendSTK}>
                        Confirm &amp; Send STK Push →
                      </button>
                      <button className={styles.cancelBtn} onClick={() => setStkStep('idle')}>Cancel</button>
                      <p className={styles.stkNote}>You will receive a prompt on your phone. Enter your M-Pesa PIN to confirm.</p>
                    </>
                  )}

                  {stkStep === 'sending' && (
                    <div className={styles.stkWaiting}>
                      <div className={styles.miniSpinner} />
                      <p>Sending STK Push to <strong>{stkPhone}</strong>…</p>
                    </div>
                  )}

                  {stkStep === 'polling' && (
                    <div className={styles.stkWaiting}>
                      <div className={styles.miniSpinner} />
                      <p>Waiting for M-Pesa confirmation… <span className={styles.pollTimer}>({Math.min(pollCount * 3, 10)}s / 10s)</span></p>
                      <p className={styles.stkSmall}>📱 Check your phone — enter your M-Pesa PIN to approve <strong>KES {fee.toLocaleString()}</strong>.</p>
                      <button className={styles.cancelPollBtn} onClick={() => { clearInterval(pollRef.current); setStkStep('idle'); setStkError(''); }}>Cancel</button>
                    </div>
                  )}

                  {stkStep === 'manual_verification' && (
                    <div className={styles.manualVerification}>
                      <div className={styles.manualIcon}>⏰</div>
                      <strong>Payment confirmation not received automatically</strong>
                      <p>
                        If you already entered your M-Pesa PIN and saw a success message, please paste the M-Pesa SMS below to verify your payment.
                      </p>
                      <textarea
                        rows={3}
                        placeholder="Paste the full M-Pesa confirmation message here...
Example: Confirmed. KES 13 sent to NyotaFund. Receipt: SKQ96C7K7H. Date: ..."
                        value={manualReceipt}
                        onChange={(e) => setManualReceipt(e.target.value)}
                        className={styles.manualTextarea}
                      />
                      {manualError && <div className={styles.manualError}>{manualError}</div>}
                      <button
                        className={styles.verifyBtn}
                        onClick={handleManualVerification}
                        disabled={manualVerifying}
                      >
                        {manualVerifying ? 'Verifying...' : 'Verify Payment →'}
                      </button>
                      <button
                        className={styles.retryBtn}
                        onClick={() => { setStkStep('idle'); setManualReceipt(''); setManualError(''); }}
                      >
                        Cancel & Try Again
                      </button>
                    </div>
                  )}

                  {stkStep === 'success' && (
                    <div className={styles.stkSuccess}>
                      <div className={styles.stkSuccessIcon}>✓</div>
                      <strong>Payment Confirmed!</strong>
                      <p>KES {fee.toLocaleString()} received via M-Pesa. Your loan is now being processed.</p>
                      {mpesaReceipt && <p className={styles.receiptNum}>M-Pesa Receipt: <strong>{mpesaReceipt}</strong></p>}
                    </div>
                  )}

                  {stkStep === 'cancelled' && (
                    <div className={styles.stkCancelled}>
                      <div className={styles.stkCancelIcon}>✕</div>
                      <strong>Payment Cancelled</strong>
                      <p>{stkError}</p>
                      <button className={styles.retryBtn} onClick={() => { setStkStep('idle'); setStkError(''); }}>Try Again</button>
                    </div>
                  )}

                  {stkStep === 'failed' && (
                    <div className={styles.stkFailed}>
                      <div className={styles.stkFailIcon}>!</div>
                      <strong>Payment Failed</strong>
                      <p>{stkError}</p>
                      <button className={styles.retryBtn} onClick={() => { setStkStep('idle'); setStkError(''); }}>Try Again</button>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Loan Details</h3>
                <div className={styles.detailsList}>
                  <div className={styles.detailRow}><span>Loan Type</span><strong>{loanData.loanType}</strong></div>
                  <div className={styles.detailRow}><span>Amount</span><strong>KES {loanData.amount.toLocaleString()}</strong></div>
                  <div className={styles.detailRow}><span>Interest Rate</span><strong>{loanData.rate}</strong></div>
                  <div className={styles.detailRow}><span>Repayment Period</span><strong>{loanData.period}</strong></div>
                  <div className={styles.detailRow}><span>Applied On</span><strong>{formatDate(appliedAt)}</strong></div>
                  <div className={styles.detailRow}><span>Disbursement By</span><strong>{formatDate(disburseDate)}</strong></div>
                  <div className={styles.detailRow}><span>Repayment Due</span><strong>{formatDate(repayDate)}</strong></div>
                  <div className={styles.detailRow}><span>Tracking No.</span><strong>{trackingNumber}</strong></div>
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Repayment Information</h3>
                <div className={styles.repayBox}>
                  <div className={styles.repayRow}><span>Loan Principal</span><strong>KES {loanData.amount.toLocaleString()}</strong></div>
                  <div className={styles.repayRow}><span>Interest (8% flat)</span><strong>KES {Math.round(loanData.amount * 0.08).toLocaleString()}</strong></div>
                  <div className={`${styles.repayRow} ${styles.repayTotal}`}>
                    <span>Total Repayment</span>
                    <strong>KES {Math.round(loanData.amount * 1.08).toLocaleString()}</strong>
                  </div>
                </div>
                <div className={styles.repayNote}>
                  Pay via M-Pesa Paybill. Early repayment earns a 2% interest discount. Late payments attract a 5% weekly penalty.
                </div>
              </div>

              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Quick Actions</h3>
                <div className={styles.actionGrid}>
                  <button className={styles.actionBtn} onClick={() => alert('Repayment via M-Pesa Paybill: coming soon!')}>
                    <span>💰</span> Repay Loan
                  </button>
                  <button className={styles.actionBtn} onClick={() => alert('Statement download: coming soon!')}>
                    <span>📄</span> Download Statement
                  </button>
                  <button className={styles.actionBtn} onClick={() => alert('Support: +254 700 000 000')}>
                    <span>📞</span> Call Support
                  </button>
                  <button className={styles.actionBtn} onClick={() => window.location.reload()}>
                    <span>🔄</span> Refresh Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}