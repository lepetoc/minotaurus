const TENOR_MEDIA_HOST = 'media.tenor.com'

function hasAllowedTenorExtension(pathname: string) {
  return /\.(gif|mp4|webm)$/i.test(pathname)
}

export function isTenorMediaUrl(url?: string) {
  if (!url) return false

  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && parsed.hostname === TENOR_MEDIA_HOST && hasAllowedTenorExtension(parsed.pathname)
  } catch {
    return false
  }
}

export function deriveTenorVideoUrls(url?: string) {
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (parsed.hostname !== TENOR_MEDIA_HOST || !parsed.pathname.endsWith('.gif')) {
      return null
    }

    return {
      gifUrl: url,
      mp4Url: url.replace(/\.gif(?=($|\?))/, '.mp4'),
      webmUrl: url.replace(/\.gif(?=($|\?))/, '.webm'),
    }
  } catch {
    return null
  }
}

export function toTenorProxyUrl(url?: string) {
  if (!url || !isTenorMediaUrl(url)) return url
  return `/api/tenor-media?src=${encodeURIComponent(url)}`
}
