import { useState } from 'react'
import { calcFee } from '@/lib/loans'
import styles from './STKModal.module.css'

export default function STKModal({ isOpen, onClose, loanName, loanAmount }) {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState('form') // form | processing | success
  const [txnId] = useState(() => Math.random().toString(36).substr(2, 8).toUpperCase())

  const fee = calcFee(loanAmount)

  const handleSend = () => {
    if (!phone || phone.replace(/\s/g, '').length < 9) {
      alert('Please enter a valid M-Pesa number.')
      return
    }
    setStep('processing')
    // Simulate PayHero STK Push response (replace with real API call)
    setTimeout(() => setStep('success'), 3500)
  }

  const handleClose = () => {
    setStep('form')
    setPhone('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={styles.modal}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {step === 'form' && (
          <>
            <div className={styles.mpesaIcon}>
              <svg viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                <rect width="60" height="30" rx="6" fill="#4CAF50"/>
                <text x="50%" y="55%" fontFamily="Arial" fontSize="10" fill="white" textAnchor="middle" dominantBaseline="middle" fontWeight="bold">M-PESA</text>
              </svg>
            </div>
            <h3 className={styles.title}>Pay Processing Fee</h3>
            <p className={styles.sub}>{loanName} — KES {loanAmount.toLocaleString()}</p>

            <div className={styles.amountBox}>
              <div className={styles.amtLabel}>Processing Fee (10%)</div>
              <div className={styles.amtValue}>KES {fee.toLocaleString()}</div>
              <div className={styles.amtNote}>PayHero Gateway · Secure STK Push</div>
            </div>

            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input
                type="tel"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className={styles.sendBtn} onClick={handleSend}>
              Send M-Pesa Request →
            </button>
            <p className={styles.disclaimer}>
              You will receive an M-Pesa STK Push prompt. Enter your PIN to confirm. Powered by PayHero.
            </p>
          </>
        )}

        {step === 'processing' && (
          <div className={styles.processingView}>
            <div className="spinner" />
            <h3>Processing Payment…</h3>
            <p>Check your phone for the M-Pesa prompt. Enter your M-Pesa PIN to confirm.</p>
          </div>
        )}

        {step === 'success' && (
          <div className={styles.successView}>
            <div className={styles.successRing}>
              <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                <path d="M5 13l4 4L19 7" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Payment Confirmed!</h3>
            <p>Your processing fee has been received. Your loan will be disbursed to your M-Pesa within minutes.</p>
            <div className={styles.txnBox}>
              <div className={styles.txnRow}><span>Transaction ID</span><strong>NFD-{txnId}</strong></div>
              <div className={styles.txnRow}><span>Loan Product</span><strong>{loanName}</strong></div>
              <div className={styles.txnRow}><span>Disbursement ETA</span><strong className={styles.eta}>~5 minutes</strong></div>
            </div>
            <button className={styles.sendBtn} onClick={handleClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
