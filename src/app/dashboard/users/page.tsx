import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import pool from '@/lib/db'

type User = { id: string; username: string; created_at: string }

const getUsers = unstable_cache(
  async (): Promise<User[]> => {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users ORDER BY created_at DESC'
    )
    return result.rows
  },
  ['users:list'],
  { revalidate: 60, tags: ['users:list'] }
)

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-heading">Utilisateurs</h1>

      {users.length === 0 ? (
        <p className="opacity-60 text-sm">Aucun utilisateur inscrit.</p>
      ) : (
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id}>
              <Link
                href={`/dashboard/users/${u.id}`}
                className="block rounded-[var(--radius-base)] border border-border bg-background px-4 py-3 shadow-shadow transition-opacity hover:opacity-80"
              >
                <p className="font-heading">{u.username}</p>
                <p className="text-xs opacity-50 mt-0.5">
                  Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
