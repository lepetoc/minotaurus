'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type WsUser = { id: string; username: string }

export type WsChatMessage =
  | { type: 'message'; content: string; user: WsUser; timestamp: string }
  | { type: 'gif'; url: string; title: string; user: WsUser; timestamp: string }

type IncomingMessage =
  | WsChatMessage
  | { type: 'userlist'; users: WsUser[] }

export type WsStatus = 'connecting' | 'connected' | 'disconnected'

type UseWebSocketOptions = {
  url: string
  onMessage: (msg: WsChatMessage) => void
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const [status, setStatus] = useState<WsStatus>('disconnected')
  const [users, setUsers] = useState<WsUser[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const onMessageRef = useRef(onMessage)
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  onMessageRef.current = onMessage

  const connect = useCallback(async () => {
    if (!mountedRef.current) return
    const state = wsRef.current?.readyState
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return

    setStatus('connecting')

    let token: string
    try {
      const res = await fetch('/api/ws-token')
      if (!res.ok) throw new Error('token fetch failed')
      const data = (await res.json()) as { token: string }
      token = data.token
    } catch {
      if (!mountedRef.current) return
      setStatus('disconnected')
      reconnectRef.current = setTimeout(connect, 5000)
      return
    }

    if (!mountedRef.current) return

    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', token }))
    }

    ws.onmessage = (event) => {
      let parsed: IncomingMessage
      try {
        parsed = JSON.parse(event.data as string)
      } catch {
        return
      }

      if (parsed.type === 'userlist') {
        setUsers(parsed.users)
        setStatus('connected')
        return
      }

      onMessageRef.current(parsed)
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setStatus('disconnected')
      wsRef.current = null
      reconnectRef.current = setTimeout(connect, 3000)
    }

    ws.onerror = () => ws.close()
  }, [url])

  useEffect(() => {
    mountedRef.current = true
    void connect()
    return () => {
      mountedRef.current = false
      if (reconnectRef.current) clearTimeout(reconnectRef.current)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [connect])

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'message', content }))
  }, [])

  const sendGif = useCallback((gifUrl: string, title: string) => {
    wsRef.current?.send(JSON.stringify({ type: 'gif', url: gifUrl, title }))
  }, [])

  return { status, users, sendMessage, sendGif }
}
