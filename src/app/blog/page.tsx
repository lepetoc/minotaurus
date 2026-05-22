import Link from 'next/link'

const posts = [
  { slug: 'bienvenue', title: 'Bienvenue' },
  { slug: 'roadmap', title: 'Roadmap' },
]

export default function BlogIndexPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Blog</h1>

      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link className="underline" href={`/blog/${p.slug}`}>
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
