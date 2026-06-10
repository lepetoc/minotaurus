'use client'

import { ImagePlus, Loader2, Search, Send, Users } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type FormEvent } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type GifItem = {
  id: string
  title: string
  url: string
}

type GifResponse = {
  gifs?: GifItem[]
  error?: string
}

type ChatMessage = {
  id: string
  author: string
  body?: string
  gif?: GifItem
  createdAt: string
}

type ChatInterfaceProps = {
  username: string
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function UserSidebarToggle() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      type="button"
      variant="neutral"
      size="icon"
      className="md:hidden"
      onClick={toggleSidebar}
      aria-label="Afficher les membres"
    >
      <Users />
    </Button>
  )
}

export function ChatInterface({ username }: ChatInterfaceProps) {
  const displayName = username.trim() || 'Moi'
  const initials = useMemo(() => getInitials(displayName) || 'M', [displayName])
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [gifOpen, setGifOpen] = useState(false)
  const [gifQuery, setGifQuery] = useState('')
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [gifError, setGifError] = useState<string | null>(null)
  const [gifLoading, setGifLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const addMessage = useCallback(
    ({ body, gif }: Pick<ChatMessage, 'body' | 'gif'>) => {
      const now = new Date()

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          author: displayName,
          body,
          gif,
          createdAt: formatTime(now),
        },
      ])

      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ block: 'end' })
      })
    },
    [displayName],
  )

  const loadGifs = useCallback(async (query: string) => {
    setGifLoading(true)
    setGifError(null)

    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('q', query.trim())
    }

    try {
      const response = await fetch(`/api/gifs?${params.toString()}`)
      const data = (await response.json()) as GifResponse

      if (!response.ok) {
        setGifError(data.error ?? 'Impossible de charger les GIFs.')
        setGifs([])
        return
      }

      setGifs(data.gifs ?? [])
      setGifError(data.error ?? null)
    } catch {
      setGifError('Impossible de charger les GIFs.')
      setGifs([])
    } finally {
      setGifLoading(false)
    }
  }, [])

  function handleGifOpenChange(open: boolean) {
    setGifOpen(open)

    if (open && gifs.length === 0 && !gifLoading) {
      void loadGifs(gifQuery)
    }
  }

  function handleSendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const trimmed = message.trim()
    if (!trimmed) return

    addMessage({ body: trimmed })
    setMessage('')
  }

  function handleSearchGifs(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void loadGifs(gifQuery)
  }

  function handleSendGif(gif: GifItem) {
    addMessage({ gif })
    setGifOpen(false)
  }

  return (
    <SidebarProvider>
      <SidebarInset className="min-h-screen bg-background">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b-2 border-border bg-secondary-background px-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-heading">Biscord</h1>
          </div>
          <UserSidebarToggle />
        </header>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex min-h-full items-center justify-center">
                <div className="max-w-sm rounded-base border-2 border-border bg-secondary-background px-4 py-3 text-center shadow-shadow">
                  <p className="font-heading">Aucun message</p>
                  <p className="mt-1 text-sm opacity-70">
                    Envoie ton premier message dans # general.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((item) => (
                  <article
                    key={item.id}
                    className="flex gap-3 rounded-base border-2 border-transparent px-2 py-2 hover:border-border hover:bg-secondary-background"
                  >
                    <Avatar className="mt-0.5 size-10 outline-2">
                      <AvatarFallback className="bg-main font-heading text-main-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <span className="font-heading">{item.author}</span>
                        <span className="text-xs opacity-60">{item.createdAt}</span>
                      </div>
                      {item.body ? (
                        <p className="mt-1 break-words text-sm leading-6 sm:text-base">
                          {item.body}
                        </p>
                      ) : null}
                      {item.gif ? (
                        <div
                          className="mt-2 aspect-video w-full max-w-sm rounded-base border-2 border-border bg-secondary-background bg-cover bg-center shadow-shadow"
                          role="img"
                          aria-label={item.gif.title}
                          style={{ backgroundImage: `url(${item.gif.url})` }}
                        />
                      ) : null}
                    </div>
                  </article>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t-2 border-border bg-secondary-background p-3 sm:p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Popover open={gifOpen} onOpenChange={handleGifOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="neutral"
                    size="icon"
                    className="size-11 shrink-0"
                    aria-label="Ajouter un GIF"
                  >
                    <ImagePlus />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  side="top"
                  className="w-[min(calc(100vw-2rem),24rem)] bg-secondary-background"
                >
                  <form onSubmit={handleSearchGifs} className="flex gap-2">
                    <Input
                      value={gifQuery}
                      onChange={(event) => setGifQuery(event.target.value)}
                      placeholder="Rechercher un GIF"
                      className="bg-background"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={gifLoading}
                      aria-label="Rechercher"
                    >
                      {gifLoading ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                  </form>

                  <div className="mt-3 h-72 overflow-y-auto pr-1">
                    {gifError ? (
                      <div className="rounded-base border-2 border-border bg-background px-3 py-2 text-sm">
                        {gifError}
                      </div>
                    ) : null}

                    {!gifError && gifLoading ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={index}
                            className="aspect-video animate-pulse rounded-base border-2 border-border bg-background"
                          />
                        ))}
                      </div>
                    ) : null}

                    {!gifError && !gifLoading ? (
                      <div className="grid grid-cols-2 gap-2">
                        {gifs.map((gif) => (
                          <button
                            key={gif.id}
                            type="button"
                            className={cn(
                              'aspect-video rounded-base border-2 border-border bg-background bg-cover bg-center shadow-shadow transition-all',
                              'hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
                            )}
                            style={{ backgroundImage: `url(${gif.url})` }}
                            onClick={() => handleSendGif(gif)}
                            aria-label={`Envoyer ${gif.title}`}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </PopoverContent>
              </Popover>

              <Input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={`Message # general en tant que ${displayName}`}
                className="h-11 min-w-0 flex-1 bg-background"
              />
              <Button
                type="submit"
                size="icon"
                className="size-11 shrink-0"
                aria-label="Envoyer"
              >
                <Send />
              </Button>
            </form>
          </div>
        </section>
      </SidebarInset>

      <Sidebar side="right" collapsible="offcanvas">
        <SidebarHeader className="h-16 shrink-0 justify-center">
          <div className="px-2">
            <h2 className="font-heading">Membres connectes</h2>
            <p className="text-sm opacity-70">1 en ligne</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>En ligne</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" className="h-14">
                    <Avatar className="size-9 outline-2">
                      <AvatarFallback className="bg-main font-heading text-main-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1 truncate">{displayName}</span>
                    <span className="size-2 rounded-full border-2 border-border bg-chart-4" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
