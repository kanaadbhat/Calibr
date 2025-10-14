'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useWarningContext } from './WarningContext'

interface ExamProtectionWrapperProps {
  children: React.ReactNode
  countdownSeconds?: number      
}

export default function ExamProtectionWrapper({
  children,
  countdownSeconds = 10,
}: ExamProtectionWrapperProps) {
  const router = useRouter()
  const warningContext = useWarningContext()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [redirectTimer, setRedirectTimer] = useState(countdownSeconds)

  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabLockRef = useRef<boolean>(false)

  // 🧩 Auto start fullscreen immediately when component mounts
  useEffect(() => {
    const enterFullscreen = async () => {
      // Check if already in fullscreen mode
      if (document.fullscreenElement) {
        setIsFullscreen(true)
        return
      }

      const elem = document.documentElement
      try {
        if (elem.requestFullscreen) await elem.requestFullscreen()
        setIsFullscreen(true)
      } catch (err) {
        console.warn('Fullscreen not allowed:', err)
        setWarning('⚠ Please enable fullscreen to continue the test.')
      }
    }
    enterFullscreen()
  }, [])

  // Start redirect countdown when fullscreen exits
  const startRedirectCountdown = useCallback(() => {
    if (countdownRef.current) return 

    let timeLeft = countdownSeconds
    setRedirectTimer(timeLeft)
    countdownRef.current = setInterval(() => {
      timeLeft -= 1
      setRedirectTimer(timeLeft)
      if (timeLeft <= 0) {
        clearInterval(countdownRef.current!)
        router.push('/disqualified?reason=left_fullscreen')
      }
    }, 1000)
  }, [countdownSeconds, router])

  const stopRedirectCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
    setRedirectTimer(countdownSeconds)
  }, [countdownSeconds])

  // Detect tab switch
  const incrementTabSwitch = useCallback(() => {
    if (tabLockRef.current) return
    tabLockRef.current = true

    warningContext.incrementTabSwitch()
    setWarning('⚠ You switched away from the test window!')

    const unlockOnFocus = () => {
      tabLockRef.current = false
      window.removeEventListener('focus', unlockOnFocus)
    }
    window.addEventListener('focus', unlockOnFocus)
  }, [warningContext])

  // Handle visibility & fullscreen changes
  useEffect(() => {
    const handleBlur = () => incrementTabSwitch()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') incrementTabSwitch()
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        warningContext.incrementFullscreenExit()
        setIsFullscreen(false)
        setWarning(`⚠ You exited fullscreen! Return within ${countdownSeconds}s.`)
        startRedirectCountdown()
      } else {
        setIsFullscreen(true)
        setWarning(null)
        stopRedirectCountdown()
      }
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [incrementTabSwitch, startRedirectCountdown, stopRedirectCountdown, countdownSeconds, warningContext])

  // Redirect if limit exceeded
  useEffect(() => {
    if (warningContext.hasExceededLimits()) {
      const exceededWarnings = warningContext.getExceededWarnings()
      if (exceededWarnings.includes('tab_switch')) {
        router.push('/disqualified?reason=multiple_tab_switches')
      } else if (exceededWarnings.includes('fullscreen_exit')) {
        router.push('/disqualified?reason=multiple_fullscreen_exits')
      }
    }
  }, [warningContext, router])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white bg-[#0a0a18]">
      {warning && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-lg shadow-lg z-50 text-center">
          {warning}
          {!isFullscreen && (
            <div className="mt-2 text-sm flex flex-col items-center">
              {redirectTimer > 0 && <p>Redirecting in {redirectTimer}s...</p>}
              <button
                onClick={async () => {
                  const elem = document.documentElement
                  try {
                    await elem.requestFullscreen()
                    setWarning(null)
                  } catch {
                    setWarning('⚠ Please allow fullscreen to continue.')
                  }
                }}
                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Return to Fullscreen
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🧠 The actual exam content */}
      <div className="w-full h-full">{children}</div>
    </div>
  )
}
