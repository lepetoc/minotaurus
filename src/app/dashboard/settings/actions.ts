'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
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
  const cookieStore = await cookies()
  const currentUsername = cookieStore.get('biscorb_user')?.value

  if (!currentUsername) {
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
      'UPDATE users SET username = $1 WHERE username = $2 RETURNING id',
      [newUsername, currentUsername]
    )

    if (result.rowCount === 0) {
      return { error: 'Utilisateur introuvable.' }
    }

    const userId: string = result.rows[0].id

    cookieStore.set('biscorb_user', newUsername, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    revalidateTag('users:list', { expire: 0 })
    revalidateTag(`users:${userId}`, { expire: 0 })

  } catch (e: unknown) {
    if ((e as { code?: string }).code === '23505') {
      return { fieldError: 'Ce nom d\'utilisateur est déjà pris.' }
    }
    return { error: 'Erreur lors de la mise à jour.' }
  }

  return { success: 'Nom d\'utilisateur mis à jour.' }
}
