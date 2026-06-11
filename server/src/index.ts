import { WebSocketServer, WebSocket } from 'ws'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
import { config } from 'dotenv'

config()

const PORT = Number(process.env.PORT ?? 8080)
const WS_SECRET = process.env.WS_SECRET ?? 'change-me'
const AUTH_TIMEOUT_MS = 10000

const db = new Pool({ connectionString: process.env.DATABASE_URL })

type User = { id: string; username: string }

type AuthenticatedWebSocket = WebSocket & { user?: User }

type ClientMessage =
  | { type: 'auth'; token: string }
  | { type: 'message'; content: string }
  | { type: 'gif'; url: string; title?: string }

type ServerMessage =
  | { type: 'message'; content: string; user: User; timestamp: string }
  | { type: 'gif'; url: string; title: string; user: User; timestamp: string }
  | { type: 'userlist'; users: User[] }

const wss = new WebSocketServer({ port: PORT })

function getConnectedUsers(): User[] {
  const seen = new Set<string>()
  const users: User[] = []
  wss.clients.forEach((client) => {
    const ws = client as AuthenticatedWebSocket
    if (ws.readyState === WebSocket.OPEN && ws.user && !seen.has(ws.user.id)) {
      seen.add(ws.user.id)
      users.push(ws.user)
    }
  })
  return users
}

function broadcast(message: ServerMessage) {
  const data = JSON.stringify(message)
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  })
}

wss.on('connection', (ws: AuthenticatedWebSocket) => {
  const authTimeout = setTimeout(() => {
    if (!ws.user) ws.close(1008, 'Auth timeout')
  }, AUTH_TIMEOUT_MS)

  ws.on('message', async (data) => {
    let parsed: ClientMessage

    try {
      parsed = JSON.parse(data.toString())
    } catch {
      return
    }

    if (parsed.type === 'auth') {
      try {
        const payload = jwt.verify(parsed.token, WS_SECRET) as { sub: string }
        const result = await db.query(
          'SELECT id, username FROM users WHERE id = $1',
          [payload.sub]
        )
        if (!result.rows[0]) throw new Error('user not found')

        ws.user = result.rows[0]
        clearTimeout(authTimeout)
        broadcast({ type: 'userlist', users: getConnectedUsers() })
      } catch (err) {
        console.error('Auth failed:', err)
        ws.close(1008, 'Unauthorized')
      }
      return
    }

    if (!ws.user) return

    if (parsed.type === 'message' && parsed.content?.trim()) {
      const msg: ServerMessage = {
        type: 'message',
        content: parsed.content,
        user: ws.user,
        timestamp: new Date().toISOString(),
      }
      broadcast(msg)
      db.query('INSERT INTO messages (user_id, content) VALUES ($1, $2)', [ws.user.id, parsed.content])
        .catch((err) => console.error('Failed to save message:', err))
    }

    if (parsed.type === 'gif' && parsed.url) {
      const title = parsed.title ?? 'GIF'
      const msg: ServerMessage = {
        type: 'gif',
        url: parsed.url,
        title,
        user: ws.user,
        timestamp: new Date().toISOString(),
      }
      broadcast(msg)
      db.query(
        'INSERT INTO messages (user_id, gif_url, gif_title) VALUES ($1, $2, $3)',
        [ws.user.id, parsed.url, title]
      ).catch((err) => console.error('Failed to save gif:', err))
    }
  })

  ws.on('close', () => {
    clearTimeout(authTimeout)
    if (ws.user) {
      broadcast({ type: 'userlist', users: getConnectedUsers() })
    }
  })
})

console.log(`WS server running on ws://localhost:${PORT}`)
