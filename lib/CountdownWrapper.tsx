'use client'

import React, { useEffect, useState } from 'react'

interface CountdownWrapperProps {
  children: React.ReactNode
  startTime: Date | string        // Start time of the session
  durationMinutes: number         // Duration in minutes
}

export default function CountdownWrapper({
  children,
  startTime,
  durationMinutes
}: CountdownWrapperProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()
    const end = start + durationMinutes * 60 * 1000

    const updateCountdown = () => {
      const now = Date.now()
      const diff = end - now
      setTimeLeft(diff > 0 ? diff : 0)
    }

    // Initial update
    updateCountdown()

    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [startTime, durationMinutes])


  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative min-h-screen">
      
      <div className="fixed top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 font-mono">
        Time Left: {formatTime(timeLeft)}
      </div>

      




      
      {children}
    </div>
  )
}