import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'
import type { AuthBody, AuthErrorResponse } from '@/types/auth'

type RegisterResponse = { id: string; username: string }

export async function POST(
  req: NextRequest
): Promise<NextResponse<RegisterResponse | AuthErrorResponse>> {
  const body: AuthBody | null = await req.json().catch(() => null)
  const { username, password } = body ?? {}

  if (!username || !password) {
    return NextResponse.json(
      { error: 'username and password are required' },
      { status: 400 }
    )
  }

  const existing = await db.query('SELECT id FROM users WHERE username = $1', [username])
  if (existing.rowCount) {
    return NextResponse.json({ error: 'username already taken' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const result = await db.query(
    'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
    [username, passwordHash]
  )

  return NextResponse.json(result.rows[0], { status: 201 })
}
