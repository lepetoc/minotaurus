'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Une erreur interne est survenue (500)</h2>
      {error.digest ? <p className="text-sm opacity-70">Reference: {error.digest}</p> : null}
      <button onClick={() => reset()}>Reessayer</button>
    </div>
  )
}
