import Link from 'next/link'

type Post = {
  id: number
  title: string
  body: string
}

export default async function BlogPage() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=12', {
    next: { revalidate: 3600, tags: ['blog:list'] },
  })
  const posts: Post[] = await res.json()

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <h1 className="text-2xl font-heading">Blog</h1>
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/blog/${p.id}`}
                className="block rounded-[var(--radius-base)] border border-border bg-secondary-background px-4 py-3 shadow-shadow transition-opacity hover:opacity-80"
              >
                <span className="text-sm opacity-50">#{p.id}</span>
                <p className="mt-1 font-heading capitalize">{p.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
