import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer, WebSocket } from 'ws'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (socket: WebSocket) => {
    console.log('Client connected')

    socket.send(JSON.stringify({ type: 'welcome', message: 'Connected!' }))

    socket.on('message', (data) => {
      const message = data.toString()
      console.log('Received:', message)

      // Echo back to sender
      socket.send(JSON.stringify({ type: 'echo', message }))
    })

    socket.on('close', () => {
      console.log('Client disconnected')
    })
  })

  httpServer.listen(3000, () => {
    console.log('> Ready on http://localhost:3000')
  })
})
