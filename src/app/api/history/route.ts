import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import pool from '@/lib/db'

const DEFAULT_LIMIT = 50

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const limit = Math.min(Number(searchParams.get('limit') ?? DEFAULT_LIMIT), 100)

  const result = await pool.query(
    `SELECT m.id, m.content, m.created_at,
            u.id AS user_id, u.username
     FROM messages m
     JOIN users u ON u.id = m.user_id
     ORDER BY m.created_at DESC
     LIMIT $1`,
    [limit]
  )

  const messages = result.rows
    .reverse()
    .map((row) => ({
      id: row.id,
      content: row.content,
      timestamp: row.created_at,
      user: { id: row.user_id, username: row.username },
    }))

  return NextResponse.json({ messages })
}
