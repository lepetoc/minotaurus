'use client'

export default function AboutPage() {
  // throw new Error('Ceci est une erreur')
  return (
    <button
      onClick={() => {
        console.log('test')
        throw new Error('Ceci est une erreur')
      }}
    >
      Click me
    </button>
  )
}
