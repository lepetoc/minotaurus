import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = session.user as { id: string; name?: string | null }

  const secret = process.env.WS_SECRET ?? 'change-me'

  const token = jwt.sign(
    { sub: user.id, name: user.name },
    secret,
    { expiresIn: '5m' }
  )

  return NextResponse.json({ token })
}
