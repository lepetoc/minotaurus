import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null

        const result = await pool.query(
          'SELECT id, username, password_hash FROM users WHERE username = $1',
          [credentials.username]
        )
        const user = result.rows[0]

        if (!user || !(await bcrypt.compare(credentials.password, user.password_hash))) {
          return null
        }

        return { id: user.id, name: user.username }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string
        session.user.name = token.name
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
