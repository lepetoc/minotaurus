'use client'
import { useParams } from 'next/navigation'

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  //     {
  //   params,
  // }: {
  //   params: Promise<{ slug: string }>
  //         }
  const { slug } = params

  return <p>{slug}</p>
}
