import styles from './LoanCard.module.css'

export default function LoanCard({ loan, onApply }) {
  return (
    <div className={`${styles.card} ${loan.featured ? styles.featured : ''} ${loan.gold ? styles.gold : ''}`}>
      {loan.featured && <span className={styles.featuredBadge}>Most Popular</span>}

      <div className={styles.icon} style={{ background: loan.iconBg }}>{loan.icon}</div>
      <div className={styles.name}>{loan.name}</div>
      <div className={styles.range}>{loan.range}</div>
      <div className={styles.maxAmount}>
        KES {loan.maxAmount.toLocaleString()} <span>max limit</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.detail}><span>Repayment Period</span><strong>{loan.repayment}</strong></div>
      <div className={styles.detail}><span>Interest Rate</span><strong>{loan.interest}</strong></div>
      <div className={styles.detail}><span>Disbursement</span><strong>{loan.disbursement}</strong></div>
      <div className={styles.detail}><span>Eligibility</span><strong>{loan.eligibility}</strong></div>

      <button
        className={`${styles.applyBtn} ${!loan.featured && !loan.gold ? styles.outline : ''}`}
        style={loan.gold ? { background: '#8B6914' } : {}}
        onClick={() => onApply(loan)}
      >
        Apply Now
      </button>
    </div>
  )
}
