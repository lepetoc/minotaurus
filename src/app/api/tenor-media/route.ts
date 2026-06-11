import { isTenorMediaUrl } from '@/lib/tenor'

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

export const revalidate = 31536000

export async function GET(request: Request) {
  const src = new URL(request.url).searchParams.get('src') ?? undefined

  if (!src || !isTenorMediaUrl(src)) {
    return new Response('Invalid Tenor media URL.', { status: 400 })
  }

  const upstream = await fetch(src, {
    next: { revalidate: ONE_YEAR_IN_SECONDS },
  }).catch(() => null)

  if (!upstream?.ok || !upstream.body) {
    return new Response('Failed to fetch Tenor media.', { status: upstream?.status ?? 502 })
  }

  const headers = new Headers()
  const contentType = upstream.headers.get('content-type')
  const contentLength = upstream.headers.get('content-length')
  const etag = upstream.headers.get('etag')
  const lastModified = upstream.headers.get('last-modified')

  if (contentType) headers.set('Content-Type', contentType)
  if (contentLength) headers.set('Content-Length', contentLength)
  if (etag) headers.set('ETag', etag)
  if (lastModified) headers.set('Last-Modified', lastModified)

  headers.set('Cache-Control', `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`)
  headers.set('Cross-Origin-Resource-Policy', 'same-origin')
  headers.set('X-Content-Type-Options', 'nosniff')

  return new Response(upstream.body, {
    status: upstream.status,
    headers,
  })
}
