import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const username = cookieStore.get('biscorb_user')?.value

  return (
    <div className="space-y-2">
      <h1 className="text-2xl">Bienvenue{username ? `, ${username}` : ''}</h1>
      <p className="opacity-80">
        Ceci est une page placeholder. Branche l'API/WebSocket ensuite.
      </p>
    </div>
  )
}
