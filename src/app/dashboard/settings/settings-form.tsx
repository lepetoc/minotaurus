'use client'

import { useActionState } from 'react'
import { updateUsernameAction, type UpdateState } from './actions'

const initialState: UpdateState = {}

export default function SettingsForm({ currentUsername }: { currentUsername: string }) {
  const [state, formAction, isPending] = useActionState(updateUsernameAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {state.success ? (
        <div className="rounded-[var(--radius-base)] border border-border bg-secondary-background px-3 py-2 text-sm">
          {state.success}
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 text-sm opacity-80">
          {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="username" className="text-sm font-heading">
          Nouveau nom d&apos;utilisateur
        </label>
        <input
          id="username"
          name="username"
          defaultValue={currentUsername}
          required
          className="w-full rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        />
        {state.fieldError ? (
          <p className="text-xs opacity-70">{state.fieldError}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-[var(--radius-base)] border border-border bg-main px-4 py-2 text-main-foreground shadow-shadow active:translate-x-[var(--spacing-boxShadowX)] active:translate-y-[var(--spacing-boxShadowY)] active:shadow-none disabled:opacity-50"
      >
        {isPending ? 'Mise à jour...' : 'Enregistrer'}
      </button>
    </form>
  )
}
