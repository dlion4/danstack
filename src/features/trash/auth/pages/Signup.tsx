import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import s from '../styles/auth.module.css'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: wire to your auth API / provider
  }

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.brand}>
          <span className={s.brandMark}>P</span>
          <span className={s.brandName}>Paymo</span>
        </div>

        <h1 className={s.title}>Create your account</h1>
        <p className={s.subtitle}>Start building with Paymo in minutes</p>

        <form className={s.form} onSubmit={onSubmit}>
          <label className={s.field}>
            <span className={s.label}>Full name</span>
            <input
              className={s.input}
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>Email</span>
            <input
              className={s.input}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>Password</span>
            <input
              className={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button type="submit" className={s.submit}>
            Create account
          </button>
        </form>

        <div className={s.divider}>or sign up with</div>

        <div className={s.social}>
          <a className={s.socialBtn} href="#"> Google </a>
          <a className={s.socialBtn} href="#"> GitHub </a>
        </div>

        <p className={s.footer}>
          Already have an account?{' '}
          <Link to="/auth/login" className={s.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
