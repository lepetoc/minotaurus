import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SettingsForm from './settings-form'

export default async function DashboardSettingsPage() {
  const session = await getServerSession(authOptions)
  const currentUsername = session?.user?.name ?? ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading">Paramètres</h1>
        <p className="text-sm opacity-60 mt-1">Modifie ton profil.</p>
      </div>

      <div className="rounded-[var(--radius-base)] border border-border bg-secondary-background p-6 shadow-shadow max-w-md">
        <h2 className="font-heading mb-4">Nom d&apos;utilisateur</h2>
        <SettingsForm currentUsername={currentUsername} />
      </div>
    </div>
  )
}
