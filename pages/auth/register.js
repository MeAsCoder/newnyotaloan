import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/context/AuthContext'
import styles from './auth.module.css'

export default function Register() {
  const router = useRouter()
  const { register, loading } = useAuth()
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    nationalId: '', email: '', password: '', confirmPassword: ''
  })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { firstName, lastName, phone, nationalId, email, password, confirmPassword } = form
    if (!firstName || !lastName || !phone || !nationalId || !email || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    const ok = await register(form)
    if (ok) router.push('/')
    else setError('Registration failed. Please try again.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.logoBox}>
            <Link href="/" className={styles.logo}>Zuri<span>Credit</span></Link>
          </div>
          <h2>Create Account</h2>
          <p className={styles.sub}>Start your ZuriCredit journey today</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input name="firstName" placeholder="Amina" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input name="lastName" placeholder="Wanjiru" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number (M-Pesa)</label>
              <input type="tel" name="phone" placeholder="07XXXXXXXX" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>National ID Number</label>
              <input name="nationalId" placeholder="e.g. 12345678" value={form.nationalId} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" placeholder="Create a strong password" value={form.password} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Repeat your password" value={form.confirmPassword} onChange={handleChange} />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account →'}
            </button>
          </form>

          <div className={styles.switchRow}>
            Already have an account?{' '}
            <Link href="/auth/login" className={styles.switchLink}>Log In</Link>
          </div>
          <p className={styles.terms}>
            By registering, you agree to our{' '}
            <Link href="#">Terms of Service</Link>,{' '}
            <Link href="#">Loan Agreement</Link>, and{' '}
            <Link href="#">Privacy Policy</Link>.
            You consent to CRB checks as required.
          </p>
        </div>
      </div>
    </div>
  )
}
