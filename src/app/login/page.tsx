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

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
      router.replace('/dashboard')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="w-full max-w-md bg-secondary-background">
        <CardHeader className="border-b-2 border-border pb-6">
          <CardTitle className="text-2xl">Entrer</CardTitle>
          <CardDescription className="opacity-80">
            Connecte-toi pour acceder au chat.
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
                autoComplete="current-password"
                required
                className="w-full rounded-base border-2 border-border bg-background px-3 py-2 font-base outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Connexion...' : 'Se connecter'}
            </Button>
            <div className="mt-4 text-center text-sm">
              Pas encore de compte ?{' '}
              <Link href="/register" className="underline underline-offset-4">
                Creer un compte
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
