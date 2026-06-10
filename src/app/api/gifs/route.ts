import { NextRequest, NextResponse } from 'next/server'

type TenorResponse = {
  results?: Array<{
    id?: string
    content_description?: string
    media_formats?: {
      gif?: { url?: string }
      tinygif?: { url?: string }
    }
  }>
}

type GifItem = {
  id: string
  title: string
  url: string
}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const apiKey = process.env.API_KEY || process.env.TENOR_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      {
        gifs: [],
        error: 'API_KEY ou TENOR_API_KEY manquant.',
      },
      { status: 500 },
    )
  }

  const query = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  const endpoint = query
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}&limit=20&media_filter=gif,tinygif`
    : `https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(apiKey)}&limit=20&media_filter=gif,tinygif`

  let response: Response

  try {
    response = await fetch(endpoint, { cache: 'no-store' })
  } catch {
    return NextResponse.json(
      { gifs: [], error: 'Fetch GIF impossible.' },
      { status: 502 },
    )
  }

  if (!response.ok) {
    return NextResponse.json(
      { gifs: [], error: `API GIF error ${response.status}.` },
      { status: response.status },
    )
  }

  const data = (await response.json()) as TenorResponse
  const gifs: GifItem[] = (data.results ?? [])
    .map((item, index) => {
      const url = item.media_formats?.tinygif?.url ?? item.media_formats?.gif?.url
      if (!url) return null

      return {
        id: item.id ?? String(index),
        title: item.content_description ?? 'GIF',
        url,
      }
    })
    .filter((item): item is GifItem => Boolean(item))

  return NextResponse.json({ gifs })
}
