import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidateTag } from 'next/cache'

type GifItem = {
  id: string
  title: string
  url: string
}

type GifResult = {
  gifs: GifItem[]
  error?: string
}

type PageProps = {
  searchParams?: Promise<{ q?: string }>
}

function normalizeQuery(q: string | undefined) {
  const value = String(q ?? '').trim()
  return value.length ? value : null
}

async function fetchKlipyGifs(query: string | null): Promise<GifResult> {
  const apiKey = process.env.API_KEY || process.env.TENOR_API_KEY
  if (!apiKey) {
    return {
      gifs: [],
      error:
        'API_KEY (ou TENOR_API_KEY) manquant: ajoute une cle Tenor dans .env.local puis redemarre `npm run dev`.',
    }
  }

  const endpoint = query
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}&limit=24&media_filter=gif,tinygif`
    : `https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(apiKey)}&limit=24&media_filter=gif,tinygif`

  let res: Response
  try {
    res = await fetch(endpoint, {
      next: {
        revalidate: query ? 60 : 300,
        tags: [query ? `tenor:search:${query}` : 'tenor:featured'],
      },
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch failed'
    return { gifs: [], error: `Fetch GIF impossible: ${msg}` }
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const snippet = body.length > 280 ? `${body.slice(0, 280)}...` : body
    return {
      gifs: [],
      error: `API GIF error ${res.status} ${res.statusText}${snippet ? `: ${snippet}` : ''}`,
    }
  }

  const data = (await res.json()) as {
    results?: Array<{
      id?: string
      content_description?: string
      media_formats?: {
        gif?: { url?: string }
        tinygif?: { url?: string }
      }
    }>
  }

  const results = data.results ?? []
  const gifs = results
    .map((r, idx) => {
      const url = r.media_formats?.tinygif?.url ?? r.media_formats?.gif?.url
      if (!url) return null
      return {
        id: r.id ?? String(idx),
        title: r.content_description ?? 'GIF',
        url,
      }
    })
    .filter((x): x is GifItem => Boolean(x))

  return { gifs }
}

async function refreshKlipyAction(formData: FormData) {
  'use server'

  const q = normalizeQuery(String(formData.get('q') ?? ''))
  revalidateTag(q ? `tenor:search:${q}` : 'tenor:featured', { expire: 0 })
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)
  const username = session?.user?.name
  const sp = (await searchParams) ?? {}
  const q = normalizeQuery(sp.q)
  const result = await fetchKlipyGifs(q)
  const gifs = result.gifs
  const hasKey = Boolean(process.env.API_KEY || process.env.TENOR_API_KEY)

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl">Bienvenue{username ? `, ${username}` : ''}</h1>
        <p className="opacity-80">Recherche des GIFs via Tenor (avec cache).</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <form className="flex-1" action="/dashboard" method="get">
          <label htmlFor="q" className="text-sm font-heading">
            Recherche
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="q"
              name="q"
              defaultValue={q ?? ''}
              placeholder="ex: chat, wow, reaction..."
              className="w-full rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              className="shrink-0 rounded-[var(--radius-base)] border border-border bg-main px-3 py-2 text-main-foreground shadow-shadow active:translate-x-[var(--spacing-boxShadowX)] active:translate-y-[var(--spacing-boxShadowY)] active:shadow-none"
            >
              Chercher
            </button>
          </div>
        </form>

        <form action={refreshKlipyAction}>
          <input type="hidden" name="q" value={q ?? ''} />
          <button
            type="submit"
            className="rounded-[var(--radius-base)] border border-border bg-secondary-background px-3 py-2 shadow-shadow active:translate-x-[var(--spacing-boxShadowX)] active:translate-y-[var(--spacing-boxShadowY)] active:shadow-none"
          >
            Rafraichir
          </button>
        </form>
      </div>

      {result.error ? (
        <div className="rounded-[var(--radius-base)] border border-border bg-background px-3 py-2 text-sm">
          {result.error}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {gifs.map((g) => (
          <a
            key={g.id}
            href={g.url}
            target="_blank"
            rel="noreferrer"
            className="block overflow-hidden rounded-[var(--radius-base)] border border-border bg-secondary-background shadow-shadow"
            title={g.title}
          >
            <img
              src={g.url}
              alt={g.title}
              loading="lazy"
              className="h-40 w-full object-cover"
            />
          </a>
        ))}
      </div>

      {hasKey && gifs.length === 0 ? (
        <div className="text-sm opacity-80">Aucun GIF trouve.</div>
      ) : null}
    </div>
  )
}
