'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)

    const formData = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      setError('Identifiants invalides.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[var(--radius-base)] border border-border bg-secondary-background shadow-shadow">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl">Entrer</h1>
          <p className="text-sm opacity-80">Connecte-toi pour acceder au chat.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error ? (
            <div className="rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 text-sm">
              {error}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-heading">
              Nom d&apos;utilisateur
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              required
              className="w-full rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-heading">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-[var(--radius-base)] border border-border bg-main px-3 py-2 text-main-foreground shadow-shadow active:translate-x-[var(--spacing-boxShadowX)] active:translate-y-[var(--spacing-boxShadowY)] active:shadow-none disabled:opacity-50"
          >
            {pending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </main>
  )
}
