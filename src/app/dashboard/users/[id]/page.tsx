type PageProps = {
  params: Promise<{ id: string }>
}

export default async function DashboardUserPage({ params }: PageProps) {
  const { id } = await params

  return (
    <div className="space-y-2">
      <h1 className="text-2xl">Utilisateur {id}</h1>
      <p className="opacity-80">Page placeholder (a implementer).</p>
    </div>
  )
}
