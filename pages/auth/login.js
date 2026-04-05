import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import styles from './auth.module.css'

export default function Login() {
  const router = useRouter()
  const { login, loading } = useAuth()
  const [form, setForm] = useState({ phone: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.phone || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    const ok = await login(form.phone, form.password)
    if (ok) router.push('/')
    else setError('Invalid credentials. Please try again.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.logoBox}>
            <Link href="/" className={styles.logo}>Nyota<span>Fund</span></Link>
          </div>
          <h2>Welcome Back</h2>
          <p className={styles.sub}>Log in to manage your loans and account</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Phone Number (M-Pesa)</label>
              <input
                type="tel"
                name="phone"
                placeholder="07XXXXXXXX"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className={styles.forgotRow}>
              <Link href="#" className={styles.forgotLink}>Forgot Password?</Link>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className={styles.switchRow}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className={styles.switchLink}>Register →</Link>
          </div>
          <p className={styles.terms}>
            By continuing, you agree to our{' '}
            <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
