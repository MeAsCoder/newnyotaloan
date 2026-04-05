import { useState } from 'react'
import { LOANS, calcFee } from '@/lib/loans'
import styles from './EligibilityModal.module.css'

export default function EligibilityModal({ isOpen, onClose, onApply }) {
  const [step, setStep] = useState('form') // form | result
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', employment: '', income: '' })
  const [eligibleLoans, setEligibleLoans] = useState([])

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleCheck = () => {
    const { firstName, phone, employment, income } = form
    if (!firstName || !phone || !employment || !income) {
      alert('Please fill in all fields.')
      return
    }
    const incomeNum = parseInt(income)
    const matched = LOANS.filter(l => incomeNum >= l.minIncome)
    setEligibleLoans(matched)
    setStep('result')
  }

  const handleClose = () => {
    setStep('form')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className={styles.modal}>
        <button className="modal-close" onClick={handleClose}>✕</button>

        {step === 'form' && (
          <>
            <h2 className={styles.title}>Check Your Eligibility</h2>
            <p className={styles.sub}>Find out which loans you qualify for instantly.</p>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input name="firstName" placeholder="e.g. Amina" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" placeholder="e.g. Wanjiru" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number (M-Pesa)</label>
              <input name="phone" type="tel" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Employment Status</label>
              <select name="employment" value={form.employment} onChange={handleChange}>
                <option value="">Select status</option>
                <option>Employed (Full-time)</option>
                <option>Self-employed / Business Owner</option>
                <option>Freelancer / Gig Worker</option>
                <option>Casual Labourer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Monthly Income (KES)</label>
              <select name="income" value={form.income} onChange={handleChange}>
                <option value="">Select range</option>
                <option value="5000">Below KES 10,000</option>
                <option value="15000">KES 10,000 – 30,000</option>
                <option value="40000">KES 30,000 – 60,000</option>
                <option value="80000">KES 60,000 – 100,000</option>
                <option value="150000">Above KES 100,000</option>
              </select>
            </div>
            <button className={styles.checkBtn} onClick={handleCheck}>Check My Eligibility →</button>
          </>
        )}

        {step === 'result' && (
          <>
            <div className={styles.successRing}>
              <svg viewBox="0 0 24 24" fill="none" width="36" height="36">
                <path d="M5 13l4 4L19 7" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className={styles.title}>You&apos;re Eligible! 🎉</h2>
            <p className={styles.sub}>
              Hi {form.firstName}! You qualify for {eligibleLoans.length} loan product{eligibleLoans.length !== 1 ? 's' : ''}:
            </p>
            <div className={styles.loansList}>
              {eligibleLoans.map(loan => (
                <div key={loan.id} className={styles.loanItem}>
                  <div>
                    <div className={styles.loanName}>{loan.name}</div>
                    <div className={styles.loanLimit}>Up to KES {loan.maxAmount.toLocaleString()} · Fee: KES {calcFee(loan.maxAmount).toLocaleString()}</div>
                  </div>
                  <div className={styles.loanRight}>
                    <span className={styles.loanAmt}>KES {loan.maxAmount.toLocaleString()}</span>
                    <div className={styles.checkBadge}>
                      <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                        <path d="M5 13l4 4L19 7" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.feeNote}>
              <strong>⚠ Processing Fee Reminder</strong>
              A 10% facilitation fee is required before disbursement, paid via M-Pesa STK Push.
            </div>
            <button
              className={styles.checkBtn}
              onClick={() => {
                const best = eligibleLoans[eligibleLoans.length - 1]
                handleClose()
                onApply(best.maxAmount, best.name)
              }}
            >
              Proceed to Apply →
            </button>
            <button className={styles.backBtn} onClick={() => setStep('form')}>← Change Details</button>
          </>
        )}
      </div>
    </div>
  )
}
