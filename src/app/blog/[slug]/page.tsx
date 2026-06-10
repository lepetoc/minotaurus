import Link from 'next/link'
import { notFound } from 'next/navigation'

type Post = {
  id: number
  title: string
  body: string
  userId: number
}

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params

  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${slug}`, {
    next: { revalidate: 3600, tags: [`blog:post:${slug}`] },
  })

  if (!res.ok) notFound()

  const post: Post = await res.json()

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link href="/blog" className="text-sm underline opacity-70">
          ← Retour au blog
        </Link>
        <div className="rounded-[var(--radius-base)] border border-border bg-secondary-background p-6 shadow-shadow space-y-4">
          <span className="text-xs opacity-50">Article #{post.id}</span>
          <h1 className="text-2xl font-heading capitalize">{post.title}</h1>
          <p className="leading-relaxed opacity-80">{post.body}</p>
        </div>
      </div>
    </div>
  )
}
