'use client'

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from 'react'
import { deriveTenorVideoUrls, toTenorProxyUrl } from '@/lib/tenor'
import { cn } from '@/lib/utils'

type GifMediaProps = {
  title: string
  url?: string
  gifUrl?: string
  mp4Url?: string
  webmUrl?: string
  className?: string
}

function isVideoUrl(url: string) {
  return url.endsWith('.mp4') || url.endsWith('.webm')
}

export function GifMedia({ title, url, gifUrl, mp4Url, webmUrl, className }: GifMediaProps) {
  const derived = useMemo(
    () => (!gifUrl && !mp4Url && !webmUrl ? deriveTenorVideoUrls(url) : null),
    [gifUrl, mp4Url, url, webmUrl],
  )
  const resolvedWebm = toTenorProxyUrl(
    webmUrl ?? derived?.webmUrl ?? (url?.endsWith('.webm') ? url : undefined),
  )
  const resolvedMp4 = toTenorProxyUrl(
    mp4Url ?? derived?.mp4Url ?? (url?.endsWith('.mp4') ? url : undefined),
  )
  const resolvedGif = toTenorProxyUrl(gifUrl ?? derived?.gifUrl ?? (url && !isVideoUrl(url) ? url : undefined))
  const [videoFailed, setVideoFailed] = useState(false)

  if (!videoFailed && (resolvedWebm || resolvedMp4)) {
    return (
      <video
        className={cn(className, 'object-cover')}
        aria-label={title}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster={resolvedGif}
        onError={() => setVideoFailed(true)}
      >
        {resolvedWebm ? <source src={resolvedWebm} type="video/webm" /> : null}
        {resolvedMp4 ? <source src={resolvedMp4} type="video/mp4" /> : null}
      </video>
    )
  }

  if (resolvedGif) {
    return (
      <img
        src={resolvedGif}
        alt={title}
        loading="lazy"
        className={cn(className, 'object-cover')}
      />
    )
  }

  return <div className={className} role="img" aria-label={title} />
}
