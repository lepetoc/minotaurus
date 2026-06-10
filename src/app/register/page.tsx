'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type RegisterError = {
  error?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const username = String(formData.get('username') ?? '')
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setPending(true)

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as RegisterError | null
      const message =
        body?.error === 'username already taken'
          ? 'Ce nom d\'utilisateur est deja pris.'
          : body?.error || 'Impossible de creer le compte.'

      setError(message)
      setPending(false)
      return
    }

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setPending(false)

    if (result?.error) {
      router.replace('/login')
    } else {
      router.replace('/')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md bg-secondary-background">
        <CardHeader className="border-b-2 border-border pb-6">
          <CardTitle className="text-2xl">Creer un compte</CardTitle>
          <CardDescription className="opacity-80">
            Choisis tes identifiants pour acceder au chat.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-base border-2 border-border bg-background px-3 py-2 text-sm">
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
                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base outline-none focus:ring-2 focus:ring-ring"
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
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-heading">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Creation...' : 'Creer le compte'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Deja un compte ?{' '}
              <Link href="/login" className="underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
