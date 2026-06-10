'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import pool from '@/lib/db'

const UpdateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Au moins 3 caractères')
    .max(20, 'Maximum 20 caractères')
    .regex(/^[a-zA-Z0-9_]+$/, 'Lettres, chiffres et _ uniquement'),
})

export type UpdateState = {
  success?: string
  fieldError?: string
  error?: string
}

export async function updateUsernameAction(
  _prev: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  const session = await getServerSession(authOptions)
  const user = session?.user as { id?: string; name?: string } | undefined

  if (!user?.id) {
    return { error: 'Non authentifié. Reconnecte-toi.' }
  }

  const parsed = UpdateUsernameSchema.safeParse({
    username: formData.get('username'),
  })

  if (!parsed.success) {
    return { fieldError: parsed.error.issues[0].message }
  }

  const { username: newUsername } = parsed.data

  try {
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id',
      [newUsername, user.id]
    )

    if (result.rowCount === 0) {
      return { error: 'Utilisateur introuvable.' }
    }

    revalidateTag('users:list', { expire: 0 })
    revalidateTag(`users:${user.id}`, { expire: 0 })
  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return { fieldError: "Ce nom d'utilisateur est déjà pris." }
    }
    return { error: 'Erreur lors de la mise à jour.' }
  }

  return { success: 'Nom d\'utilisateur mis à jour. Reconnecte-toi pour voir le changement dans le menu.' }
}
