import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar({ onApply }) {
  const router = useRouter()
  const { currentUser, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href) => router.pathname === href

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.inner}>
            <Link href="/" className={styles.logo}>
              Nyota<span>Fund</span>
            </Link>

            <ul className={styles.links}>
              <li><Link href="/" className={isActive('/') ? styles.activeLink : styles.link}>Home</Link></li>
              <li><Link href="/#loans" className={styles.link}>Loan Products</Link></li>
              <li><Link href="/#how" className={styles.link}>How It Works</Link></li>
              <li><Link href="/#eligibility" className={styles.link}>Eligibility</Link></li>
            </ul>

            <div className={styles.cta}>
              {currentUser ? (
                <>
                  <span className={styles.greeting}>Hi, {currentUser.name}</span>
                  <button onClick={logout} className={styles.loginBtn}>Log Out</button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.loginBtn}>Log In</Link>
                  <button onClick={onApply} className={styles.applyBtn}>Get a Loan</button>
                </>
              )}
            </div>

            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/#loans" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Loan Products</Link>
            <Link href="/#how" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>How It Works</Link>
            <Link href="/#eligibility" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Eligibility</Link>
            <div className={styles.mobileCta}>
              {currentUser ? (
                <button onClick={() => { logout(); setMobileOpen(false) }} className={styles.applyBtn} style={{ width: '100%' }}>Log Out</button>
              ) : (
                <>
                  <Link href="/auth/login" className={styles.loginBtn} onClick={() => setMobileOpen(false)}>Log In</Link>
                  <Link href="/auth/register" className={styles.applyBtn} onClick={() => setMobileOpen(false)}>Get a Loan</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
