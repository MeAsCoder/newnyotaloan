import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from './ApplyFlow.module.css'

const STEPS = {
  ELIGIBILITY: 'eligibility',
  REGISTER: 'register',
  QUESTIONNAIRE: 'questionnaire',
  PROCESSING: 'processing',
  RESULT: 'result',
}

function randomLoanAmount() {
  // Random between 4000–35000 in multiples of 500
  const min = 8   // 8 * 500 = 4000
  const max = 70  // 70 * 500 = 35000
  const steps = Math.floor(Math.random() * (max - min + 1)) + min
  return steps * 500
}

function getLoanType(amount) {
  if (amount <= 15000) return { name: 'Flash Loan', period: '14 – 30 days', rate: '8% flat' }
  if (amount <= 35000) return { name: 'Karo Loan', period: '1 – 3 months', rate: '10% per month' }
  return { name: 'Karo Loan', period: '1 – 3 months', rate: '10% per month' }
}

export default function ApplyFlow({ isOpen, onClose }) {
  const router = useRouter()
  const [step, setStep] = useState(STEPS.ELIGIBILITY)
  const [eligForm, setEligForm] = useState({ firstName: '', phone: '' })
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', phone: '', nationalId: '', email: '', password: '' })
  const [qForm, setQForm] = useState({ employment: '', employer: '', monthlyIncome: '', mpesaFrequency: '', existingLoans: '' })
  const [awardedLoan, setAwardedLoan] = useState(0)
  const [errors, setErrors] = useState({})
  const [processingDots, setProcessingDots] = useState(0)

  const loanType = getLoanType(awardedLoan)

  const reset = () => {
    setStep(STEPS.ELIGIBILITY)
    setEligForm({ firstName: '', phone: '' })
    setRegForm({ firstName: '', lastName: '', phone: '', nationalId: '', email: '', password: '' })
    setQForm({ employment: '', employer: '', monthlyIncome: '', mpesaFrequency: '', existingLoans: '' })
    setAwardedLoan(0)
    setErrors({})
  }

  const handleClose = () => { reset(); onClose() }

  const validate = (fields, required) => {
    const e = {}
    required.forEach(k => { if (!fields[k]) e[k] = 'Required' })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleEligSubmit = () => {
    if (!validate(eligForm, ['firstName', 'phone'])) return
    setRegForm(f => ({ ...f, firstName: eligForm.firstName, phone: eligForm.phone }))
    setStep(STEPS.REGISTER)
  }

  const handleRegSubmit = () => {
    if (!validate(regForm, ['firstName', 'lastName', 'phone', 'nationalId', 'email', 'password'])) return
    setStep(STEPS.QUESTIONNAIRE)
  }

  const handleQSubmit = () => {
    if (!validate(qForm, ['employment', 'monthlyIncome', 'mpesaFrequency', 'existingLoans'])) return
    setStep(STEPS.PROCESSING)
    let dots = 0
    const interval = setInterval(() => {
      dots = (dots + 1) % 4
      setProcessingDots(dots)
    }, 400)
    setTimeout(() => {
      clearInterval(interval)
      setAwardedLoan(randomLoanAmount())
      setStep(STEPS.RESULT)
    }, 3000)
  }

  const handleGoToDashboard = () => {
    // Pass loan data to dashboard via sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('loanData', JSON.stringify({
        amount: awardedLoan,
        loanType: loanType.name,
        period: loanType.period,
        rate: loanType.rate,
        phone: regForm.phone,
        name: `${regForm.firstName} ${regForm.lastName}`,
        email: regForm.email,
        nationalId: regForm.nationalId,
        appliedAt: new Date().toISOString(),
      }))
    }
    handleClose()
    router.push('/dashboard')
  }

  if (!isOpen) return null

  const stepLabels = ['Eligibility', 'Register', 'Profile', 'Processing', 'Offer']
  const currentStepIdx = Object.values(STEPS).indexOf(step)

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={handleClose}>✕</button>

        {/* Progress bar */}
        {step !== STEPS.PROCESSING && step !== STEPS.RESULT && (
          <div className={styles.progressWrap}>
            {stepLabels.slice(0, 3).map((label, i) => (
              <div key={label} className={styles.progressItem}>
                <div className={`${styles.progressDot} ${i <= currentStepIdx ? styles.progressDotActive : ''}`}>
                  {i < currentStepIdx ? '✓' : i + 1}
                </div>
                <span className={`${styles.progressLabel} ${i <= currentStepIdx ? styles.progressLabelActive : ''}`}>{label}</span>
                {i < 2 && <div className={`${styles.progressLine} ${i < currentStepIdx ? styles.progressLineActive : ''}`} />}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 1: ELIGIBILITY ── */}
        {step === STEPS.ELIGIBILITY && (
          <div className={styles.stepWrap}>
            <div className={styles.iconRing} style={{ background: '#E8F5EE' }}>
              <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
                <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Check Your Eligibility</h2>
            <p className={styles.sub}>Quick 30-second check. Zero impact on your credit score.</p>
            <div className="form-group">
              <label>First Name</label>
              <input placeholder="e.g. Amina" value={eligForm.firstName} onChange={e => setEligForm(f => ({ ...f, firstName: e.target.value }))} />
              {errors.firstName && <span className={styles.err}>{errors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>M-Pesa Phone Number</label>
              <input type="tel" placeholder="07XXXXXXXX" value={eligForm.phone} onChange={e => setEligForm(f => ({ ...f, phone: e.target.value }))} />
              {errors.phone && <span className={styles.err}>{errors.phone}</span>}
            </div>
            <div className={styles.eligChecks}>
              {['Kenyan citizen aged 18+', 'Active Safaricom M-Pesa line', 'Regular income source', 'Valid National ID or Passport'].map(c => (
                <div key={c} className={styles.eligCheck}><div className={styles.checkDot} />{c}</div>
              ))}
            </div>
            <button className={styles.primaryBtn} onClick={handleEligSubmit}>I Qualify — Continue →</button>
          </div>
        )}

        {/* ── STEP 2: REGISTER ── */}
        {step === STEPS.REGISTER && (
          <div className={styles.stepWrap}>
            <div className={styles.iconRing} style={{ background: '#E8F0FF' }}>
              <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Create Your Account</h2>
            <p className={styles.sub}>Encrypted and secure. Takes under 2 minutes.</p>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input placeholder="Amina" value={regForm.firstName} onChange={e => setRegForm(f => ({ ...f, firstName: e.target.value }))} />
                {errors.firstName && <span className={styles.err}>{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input placeholder="Wanjiru" value={regForm.lastName} onChange={e => setRegForm(f => ({ ...f, lastName: e.target.value }))} />
                {errors.lastName && <span className={styles.err}>{errors.lastName}</span>}
              </div>
            </div>
            <div className="form-group">
              <label>Phone (M-Pesa)</label>
              <input type="tel" placeholder="07XXXXXXXX" value={regForm.phone} onChange={e => setRegForm(f => ({ ...f, phone: e.target.value }))} />
              {errors.phone && <span className={styles.err}>{errors.phone}</span>}
            </div>
            <div className="form-group">
              <label>National ID Number</label>
              <input placeholder="e.g. 12345678" value={regForm.nationalId} onChange={e => setRegForm(f => ({ ...f, nationalId: e.target.value }))} />
              {errors.nationalId && <span className={styles.err}>{errors.nationalId}</span>}
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="you@email.com" value={regForm.email} onChange={e => setRegForm(f => ({ ...f, email: e.target.value }))} />
              {errors.email && <span className={styles.err}>{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="Min. 6 characters" value={regForm.password} onChange={e => setRegForm(f => ({ ...f, password: e.target.value }))} />
              {errors.password && <span className={styles.err}>{errors.password}</span>}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(STEPS.ELIGIBILITY)}>← Back</button>
              <button className={styles.primaryBtn} onClick={handleRegSubmit}>Create Account →</button>
            </div>
            <p className={styles.terms}>By registering you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>.</p>
          </div>
        )}

        {/* ── STEP 3: QUESTIONNAIRE ── */}
        {step === STEPS.QUESTIONNAIRE && (
          <div className={styles.stepWrap}>
            <div className={styles.iconRing} style={{ background: '#FFF9E6' }}>
              <svg viewBox="0 0 24 24" fill="none" width="30" height="30">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Your Financial Profile</h2>
            <p className={styles.sub}>Helps us calculate your personalised loan limit. Stays private.</p>
            <div className="form-group">
              <label>Employment Status</label>
              <select value={qForm.employment} onChange={e => setQForm(f => ({ ...f, employment: e.target.value }))}>
                <option value="">Select your status</option>
                <option value="employed">Employed (Full-time / Part-time)</option>
                <option value="self_employed">Self-Employed / Business Owner</option>
                <option value="freelancer">Freelancer / Gig Worker</option>
                <option value="casual">Casual Labourer</option>
                <option value="other">Other Income Source</option>
              </select>
              {errors.employment && <span className={styles.err}>{errors.employment}</span>}
            </div>
            {(qForm.employment === 'employed' || qForm.employment === 'self_employed') && (
              <div className="form-group">
                <label>{qForm.employment === 'employed' ? 'Employer / Company' : 'Business Name / Nature'}</label>
                <input placeholder={qForm.employment === 'employed' ? 'e.g. Safaricom, County Govt...' : 'e.g. Mama Mboga, Bodaboda...'} value={qForm.employer} onChange={e => setQForm(f => ({ ...f, employer: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label>Average Monthly Income (KES)</label>
              <select value={qForm.monthlyIncome} onChange={e => setQForm(f => ({ ...f, monthlyIncome: e.target.value }))}>
                <option value="">Select income range</option>
                <option value="below_10k">Below KES 10,000</option>
                <option value="10k_30k">KES 10,000 – 30,000</option>
                <option value="30k_60k">KES 30,000 – 60,000</option>
                <option value="60k_100k">KES 60,000 – 100,000</option>
                <option value="above_100k">Above KES 100,000</option>
              </select>
              {errors.monthlyIncome && <span className={styles.err}>{errors.monthlyIncome}</span>}
            </div>
            <div className="form-group">
              <label>Monthly M-Pesa Transaction Frequency</label>
              <select value={qForm.mpesaFrequency} onChange={e => setQForm(f => ({ ...f, mpesaFrequency: e.target.value }))}>
                <option value="">Select frequency</option>
                <option value="rarely">Rarely (1–5 transactions)</option>
                <option value="sometimes">Sometimes (6–15 transactions)</option>
                <option value="often">Often (16–30 transactions)</option>
                <option value="very_often">Very often (30+ transactions)</option>
              </select>
              {errors.mpesaFrequency && <span className={styles.err}>{errors.mpesaFrequency}</span>}
            </div>
            <div className="form-group">
              <label>Do you have any active loans?</label>
              <select value={qForm.existingLoans} onChange={e => setQForm(f => ({ ...f, existingLoans: e.target.value }))}>
                <option value="">Select option</option>
                <option value="none">No active loans</option>
                <option value="one">Yes, one loan</option>
                <option value="multiple">Yes, multiple loans</option>
              </select>
              {errors.existingLoans && <span className={styles.err}>{errors.existingLoans}</span>}
            </div>
            <div className={styles.btnRow}>
              <button className={styles.backBtn} onClick={() => setStep(STEPS.REGISTER)}>← Back</button>
              <button className={styles.primaryBtn} onClick={handleQSubmit}>Process My Application →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: PROCESSING ANIMATION ── */}
        {step === STEPS.PROCESSING && (
          <div className={styles.centeredStep}>
            <div className={styles.processingRing}>
              <svg className={styles.processingCircle} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#E8F5EE" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1B4332" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="264" strokeDashoffset="66"
                  className={styles.spinCircle}/>
              </svg>
              <div className={styles.processingInner}>
                <span style={{ fontSize: 28 }}>🔍</span>
              </div>
            </div>
            <h2 className={styles.processingTitle}>
              Analysing Your Profile{'.'.repeat(processingDots + 1)}
            </h2>
            <p className={styles.sub}>Checking your details and calculating your personalised offer.</p>
            <div className={styles.processingSteps}>
              <div className={styles.pStep}><div className={styles.pDotGreen} />Verifying identity</div>
              <div className={styles.pStep}><div className={styles.pDotGreen} />Checking M-Pesa activity</div>
              <div className={`${styles.pStep} ${styles.pStepFading}`}><div className={styles.pDotPulse} />Calculating your loan limit…</div>
            </div>
          </div>
        )}

        {/* ── STEP 5: RESULT ── */}
        {step === STEPS.RESULT && (
          <div className={styles.centeredStep}>
            <div className={styles.confettiRow}>🎊 🎉 🎊</div>
            <div className={styles.bigSuccessRing}>
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                <path d="M5 13l4 4L19 7" stroke="#1B6B3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Congratulations, {regForm.firstName}! 🎉</h2>
            <p className={styles.sub}>Your profile has been reviewed. Here is your approved loan offer:</p>

            <div className={styles.loanOfferBox}>
              <div className={styles.offerLabel}>Your Approved Loan</div>
              <div className={styles.offerAmount}>KES {awardedLoan.toLocaleString()}</div>
              <div className={styles.offerRow}><span>Loan Type</span><strong>{loanType.name}</strong></div>
              <div className={styles.offerRow}><span>Repayment Period</span><strong>{loanType.period}</strong></div>
              <div className={styles.offerRow}><span>Interest Rate</span><strong>{loanType.rate}</strong></div>
              <div className={styles.offerRow}><span>Disbursement</span><strong>Instant to M-Pesa</strong></div>
            </div>

            <button className={styles.primaryBtn} onClick={handleGoToDashboard}>
              Get My Loan — Go to Dashboard →
            </button>
            <p className={styles.offerNote}>You will complete payment on the next screen. Offer valid for 24 hours.</p>
          </div>
        )}
      </div>
    </div>
  )
}
