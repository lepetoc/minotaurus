import { NextRequest, NextResponse } from 'next/server'

type TenorResponse = {
  results?: Array<{
    id?: string
    content_description?: string
    media_formats?: {
      tinymp4?: { url?: string }
      tinywebm?: { url?: string }
      gif?: { url?: string }
      tinygif?: { url?: string }
    }
  }>
}

type GifItem = {
  id: string
  title: string
  url: string
  gifUrl?: string
  mp4Url?: string
  webmUrl?: string
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
    ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${encodeURIComponent(apiKey)}&limit=20&media_filter=tinymp4,tinywebm,tinygif`
    : `https://tenor.googleapis.com/v2/featured?key=${encodeURIComponent(apiKey)}&limit=20&media_filter=tinymp4,tinywebm,tinygif`

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
  const gifs = (data.results ?? []).flatMap((item, index): GifItem[] => {
    const mp4Url = item.media_formats?.tinymp4?.url
    const webmUrl = item.media_formats?.tinywebm?.url
    const gifUrl = item.media_formats?.tinygif?.url ?? item.media_formats?.gif?.url
    const url = mp4Url ?? webmUrl ?? gifUrl

    if (!url) return []

    return [
      {
        id: item.id ?? String(index),
        title: item.content_description ?? 'GIF',
        url,
        gifUrl,
        mp4Url,
        webmUrl,
      },
    ]
  })

  return NextResponse.json({ gifs })
}
