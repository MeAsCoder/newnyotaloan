import Link from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <span className={styles.logo}>Zuri<span>Credit</span></span>
            <p className={styles.tagline}>Kenya&apos;s trusted digital lender. Fast, transparent, and M-Pesa powered loans for every Kenyan.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>M-Pesa Powered</span>
              <span className={styles.badge}>CBK Compliant</span>
            </div>
          </div>
          <div className={styles.col}>
            <h5>Products</h5>
            <Link href="/#loans">Flash Loan</Link>
            <Link href="/#loans">Karo Loan</Link>
            <Link href="/#loans">Biashara Loan</Link>
            <Link href="/#loans">Maisha Loan</Link>
            <Link href="/#loans">Zuri Premium</Link>
          </div>
          <div className={styles.col}>
            <h5>Company</h5>
            <Link href="#">About Us</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Blog</Link>
            <Link href="#">Contact</Link>
          </div>
          <div className={styles.col}>
            <h5>Legal</h5>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Loan Agreement</Link>
            <Link href="#">CRB Policy</Link>
          </div>
        </div>
        <div className={styles.bottom}>
          <span>© 2025 ZuriCredit Ltd. All rights reserved. Nairobi, Kenya.</span>
          <span>Licensed by the Central Bank of Kenya</span>
        </div>
      </div>
    </footer>
  )
}
