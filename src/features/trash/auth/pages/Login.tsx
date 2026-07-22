import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import s from '../styles/auth.module.css'

export default function Login() {
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

        <h1 className={s.title}>Welcome back</h1>
        <p className={s.subtitle}>Sign in to your Paymo dashboard</p>

        <form className={s.form} onSubmit={onSubmit}>
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
              autoComplete="current-password"
            />
          </label>

          <div className={s.row}>
            <label className={s.remember}>
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/auth/forgot-password" className={s.forgot}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className={s.submit}>
            Sign in
          </button>
        </form>

        <div className={s.divider}>or continue with</div>

        <div className={s.social}>
          <a className={s.socialBtn} href="#"> Google </a>
          <a className={s.socialBtn} href="#"> GitHub </a>
        </div>

        <p className={s.footer}>
          Don&apos;t have an account?{' '}
          <Link to="/auth/signup" className={s.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
