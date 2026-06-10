import Link from 'next/link'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import pool from '@/lib/db'

type User = { id: string; username: string; created_at: string }

async function getUser(id: string): Promise<User | null> {
  const cached = unstable_cache(
    async () => {
      const result = await pool.query(
        'SELECT id, username, created_at FROM users WHERE id = $1',
        [id]
      )
      return result.rows[0] ?? null
    },
    [`users:${id}`],
    { revalidate: 60, tags: [`users:${id}`] }
  )
  return cached()
}

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DashboardUserPage({ params }: PageProps) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) notFound()

  return (
    <div className="space-y-6">
      <Link href="/dashboard/users" className="text-sm underline opacity-70">
        ← Retour aux utilisateurs
      </Link>
      <div className="rounded-[var(--radius-base)] border border-border bg-secondary-background p-6 shadow-shadow space-y-3">
        <h1 className="text-2xl font-heading">{user.username}</h1>
        <p className="text-sm opacity-60">
          Membre depuis le {new Date(user.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  )
}
