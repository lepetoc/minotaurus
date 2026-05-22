'use client'

import * as React from 'react'
import { Progress } from '@/components/ui/progress'

export default function Loading() {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    let value = 0

    const interval = setInterval(() => {
      value += Math.random() * 8 // progression fluide

      if (value >= 90) {
        value = 90
        clearInterval(interval)
      }

      setProgress(value)
    }, 120)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[60%] space-y-2">
        <Progress value={progress} />
        <p className="text-center">{Math.floor(progress)}%</p>
      </div>
    </div>
  )
}
