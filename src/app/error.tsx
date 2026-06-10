'use client'

export default function Error({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Une erreur interne est survenue (500)</h2>
      <button onClick={() => reset()}>Réessayer</button>
    </div>
  )
}
