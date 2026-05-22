import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type PageProps = {
  searchParams?: { error?: string }
}

async function signInAction(formData: FormData) {
  'use server'

  const username = String(formData.get('username') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  if (!username) {
    redirect('/?error=missing-username')
  }

  if (!password) {
    redirect('/?error=missing-password')
  }

  // TODO: brancher la vraie API d'auth.
  // Placeholder volontairement simple.
  const cookieStore = await cookies()
  cookieStore.set('biscorb_user', username, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  redirect('/dashboard')
}

export default async function Page({ searchParams }: PageProps) {
  const sp = searchParams ?? {}
  const error = sp.error
  const errorMessage =
    error === 'missing-username'
      ? "Le nom d'utilisateur est requis."
      : error === 'missing-password'
        ? 'Le mot de passe est requis.'
        : error
          ? 'Identifiants invalides.'
          : null

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[var(--radius-base)] border border-border bg-secondary-background shadow-shadow">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl">Entrer</h1>
          <p className="text-sm opacity-80">Connecte-toi pour acceder au chat.</p>
        </div>

        <form action={signInAction} className="p-6 space-y-4">
          {errorMessage ? (
            <div className="rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 text-sm">
              {errorMessage}
            </div>
          ) : null}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-heading">
              Nom d'utilisateur
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
            className="w-full rounded-[var(--radius-base)] border border-border bg-main px-3 py-2 text-main-foreground shadow-shadow active:translate-x-[var(--spacing-boxShadowX)] active:translate-y-[var(--spacing-boxShadowY)] active:shadow-none"
          >
            Se connecter
          </button>
        </form>
      </div>
    </main>
  )
}
