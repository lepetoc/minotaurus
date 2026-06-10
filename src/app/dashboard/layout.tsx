export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-secondary-background">
        <div className="mx-auto w-full max-w-5xl px-6 py-4">
          <div className="text-lg font-heading">Dashboard</div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
