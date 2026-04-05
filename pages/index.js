import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LoanCard from '@/components/LoanCard'
import ApplyFlow from '@/components/ApplyFlow'
import { LOANS } from '@/lib/loans'
import styles from './index.module.css'

const PUBLIC_LOANS = LOANS.slice(0, 4)

export default function Home() {
  const [applyOpen, setApplyOpen] = useState(false)
  const [triggeredLoan, setTriggeredLoan] = useState(null)

  const handleApply = (loan) => {
    setTriggeredLoan(loan)
    setApplyOpen(true)
  }

  return (
    <>
      <Navbar onApply={() => setApplyOpen(true)} />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroInner}>
            <div className={styles.heroLeft}>
              <div className={styles.heroEyebrow}>
                <div className={styles.mpesaPill}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
                    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  M-Pesa Powered
                </div>
                <span className={`badge ${styles.heroBadge}`}>Kenya&apos;s #1 Micro-Lender</span>
              </div>
              <h1 className={styles.heroH1}>
                Fast Loans,<br/>Sent Straight to<br/><em>Your M-Pesa</em>
              </h1>
              <p className={styles.heroSub}>
                Access instant credit from KES 3,000 to KES 500,000. No collateral, no long queues. Just your phone and a few minutes.
              </p>
              <div className={styles.heroBtns}>
                <button className={`btn-primary ${styles.heroCtaBtn}`} onClick={() => setApplyOpen(true)}>
                  Apply for a Loan
                </button>
                <button
                  className={`btn-outline ${styles.heroOutlineBtn}`}
                  onClick={() => document.getElementById('loans').scrollIntoView({ behavior: 'smooth' })}
                >
                  View Loan Plans
                </button>
              </div>
              <div className={styles.heroStats}>
                <div className={styles.stat}><div className={styles.statNum}>50K+</div><div className={styles.statLbl}>Active Borrowers</div></div>
                <div className={styles.stat}><div className={styles.statNum}>2 Min</div><div className={styles.statLbl}>Average Approval</div></div>
                <div className={styles.stat}><div className={styles.statNum}>KES 2B+</div><div className={styles.statLbl}>Disbursed</div></div>
              </div>
            </div>

            <div className={styles.heroCard}>
              <h3>Available Loan Products</h3>
              {LOANS.map(l => (
                <div key={l.id} className={styles.loanRow}>
                  <span className={styles.lrName}>{l.icon} {l.name}</span>
                  <span className={styles.lrAmount}>up to KES {(l.maxAmount / 1000).toFixed(0)}K</span>
                  <span className={styles.lrPeriod}>{l.repayment}</span>
                </div>
              ))}
              <div className={styles.trustChips}>
                <span className={styles.chip}>✓ CRB Compliant</span>
                <span className={styles.chip}>✓ CBK Regulated</span>
                <span className={styles.chip}>✓ Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.how} id="how">
        <div className="container">
          <div className="section-header">
            <span className="badge">Simple Process</span>
            <h2>Get Your Loan in 4 Steps</h2>
            <p>We&apos;ve made borrowing as simple as sending an M-Pesa. Here&apos;s how NyotaFund works.</p>
          </div>
          <div className={styles.stepsGrid}>
            {[
              { n: 1, title: 'Check Eligibility', desc: 'Answer a few quick questions to confirm you qualify. Takes under 30 seconds with zero impact on your credit score.' },
              { n: 2, title: 'Create Account', desc: 'Sign up with your phone number, national ID, and basic details. Your information is encrypted and secure.' },
              { n: 3, title: 'Get Your Offer', desc: 'Tell us about your income and employment. We instantly calculate a personalised loan offer just for you.' },
              { n: 4, title: 'Receive Funds', desc: 'Accept your offer and your loan is disbursed directly to your M-Pesa — usually within minutes.' },
            ].map(step => (
              <div key={step.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{step.n}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOANS (public teaser – first 3 only, no fees) ── */}
      <section id="loans" className={styles.loansSection}>
        <div className="container">
          <div className="section-header">
            <span className="badge">Loan Products</span>
            <h2>Flexible Loans for Every Kenyan</h2>
            <p>From small emergency cash to business capital — choose the plan that fits your life.</p>
          </div>
          <div className={styles.loansGrid}>
            {PUBLIC_LOANS.map(loan => (
              <LoanCard key={loan.id} loan={loan} onApply={handleApply} />
            ))}
          </div>
          <div className={styles.moreLoansTeaser}>
            <div className={styles.teaserText}>
              <span style={{ fontSize: 22 }}>🌟</span>
              <div>
                <strong>Explore more — Nyota Premium unlocked after registration</strong>
                <p>Registered members get access to our exclusive Nyota Premium product with loans up to KES 500,000, lower rates, and longer repayment periods.</p>
              </div>
            </div>
            <button className={styles.teaserBtn} onClick={() => setApplyOpen(true)}>
              Apply Now — It&apos;s Free →
            </button>
          </div>
        </div>
      </section>

      {/* ── TERMS ── */}
      <section className={styles.termsSection}>
        <div className="container">
          <div className="section-header">
            <span className="badge">Loan Terms</span>
            <h2>Transparent &amp; Fair Terms</h2>
            <p>We believe in zero surprises. Here&apos;s what you need to know before you borrow.</p>
          </div>
          <div className={styles.termsGrid}>
            {[
              { icon: '📅', title: 'Repayment Schedule', body: 'Repayments are structured in equal monthly instalments (EMIs). Early repayment attracts a 2% discount on outstanding interest. Late payments incur a 5% penalty per week.' },
              { icon: '📋', title: 'Eligibility Criteria', body: "Kenyan citizen aged 18–65. Active M-Pesa line for at least 6 months. Valid national ID or passport. Regular income. Clean CRB record required for higher loan limits." },
              { icon: '🔒', title: 'Data & Privacy', body: "Your data is encrypted with 256-bit SSL. We comply with Kenya's Data Protection Act 2019. We do not sell your personal information. CRB checks done with your explicit consent." },
              { icon: '⚖️', title: 'Defaulting & CRB', body: 'Loans overdue by 90+ days are reported to the Credit Reference Bureau. CRB listing affects your ability to borrow from any Kenyan lender. Contact us early if facing challenges.' },
              { icon: '📲', title: 'M-Pesa Disbursement', body: 'All loans are disbursed directly to your registered Safaricom M-Pesa line. Repayments are also made via M-Pesa Paybill. Ensure your line is active and registered.' },
              { icon: '🌍', title: 'Regulation', body: 'NyotaFund operates under Central Bank of Kenya (CBK) guidelines for digital credit providers. Licensed under the Business Registration Act and member of Kenya Bankers Association.' },
            ].map(t => (
              <div key={t.title} className={styles.termCard}>
                <div className={styles.termIcon}>{t.icon}</div>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className={styles.eligSection} id="eligibility">
        <div className="container">
          <div className={styles.eligInner}>
            <div className={styles.eligText}>
              <span className="badge" style={{ background: 'rgba(255,255,255,.15)', color: '#74C69D' }}>Instant Check</span>
              <h2>Ready to Get Your Loan?</h2>
              <p>Check your eligibility in under 30 seconds. No credit score impact — it&apos;s a soft check only.</p>
              <ul className={styles.eligReqs}>
                {[
                  'Kenyan citizen aged 18 and above',
                  'Active Safaricom M-Pesa line',
                  'Regular income (employed or self-employed)',
                  'Valid National ID or Passport',
                ].map(req => (
                  <li key={req}>
                    <div className={styles.eligCheck}>
                      <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
                        <path d="M5 13l4 4L19 7" stroke="#1B4332" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {req}
                  </li>
                ))}
              </ul>
              <button className={`btn-primary ${styles.eligCta}`} onClick={() => setApplyOpen(true)}>
                Apply Now — It&apos;s Free →
              </button>
            </div>
            <div className={styles.eligVisual}>
              <div className={styles.eligCard}>
                <div className={styles.eligCardHeader}>
                  <span>Sample Loan Offer</span>
                  <span className={styles.eligScoreBadge}>Approved ✓</span>
                </div>
                <div className={styles.eligScore}>KES 15,000</div>
                <div className={styles.eligBar}><div className={styles.eligBarFill} /></div>
                <div className={styles.eligCardRow}><span>Loan Type</span><strong>Karo Loan</strong></div>
                <div className={styles.eligCardRow}><span>Repayment</span><strong>30 days</strong></div>
                <div className={styles.eligCardRow}><span>Disbursement</span><strong>~5 minutes</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <ApplyFlow
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        triggeredLoan={triggeredLoan}
      />
    </>
  )
}
