'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ExamProtectionWrapperProps {
  children: React.ReactNode
  tabSwitchLimit?: number        
  fullscreenExitLimit?: number  
  countdownSeconds?: number      
}

export default function ExamProtectionWrapper({
  children,
  tabSwitchLimit = 4,
  fullscreenExitLimit = 2,
  countdownSeconds = 10,
}: ExamProtectionWrapperProps) {
  const router = useRouter()
  const [hasStarted, setHasStarted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0)
  const [warning, setWarning] = useState<string | null>(null)
  const [redirectTimer, setRedirectTimer] = useState(countdownSeconds)

  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tabLockRef = useRef<boolean>(false) // 👈 Prevents double increments

  // Start fullscreen
  const startExam = async () => {
    const elem = document.documentElement
    if (elem.requestFullscreen) await elem.requestFullscreen()
    setIsFullscreen(true)
    setHasStarted(true)
  }

  // Start redirect countdown
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

  // 🚀 Robust tab switch increment logic
  const incrementTabSwitch = useCallback(() => {
    if (tabLockRef.current) return // Ignore duplicates
    tabLockRef.current = true

    setTabSwitchCount(prev => prev + 1)
    setWarning('⚠ You switched away from the test window!')

    // Unlock only after focus returns
    const unlockOnFocus = () => {
      tabLockRef.current = false
      window.removeEventListener('focus', unlockOnFocus)
    }
    window.addEventListener('focus', unlockOnFocus)
  }, [])

  // Detect tab/app switch & fullscreen changes
  useEffect(() => {
    if (!hasStarted) return

    const handleBlur = () => incrementTabSwitch()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') incrementTabSwitch()
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setFullscreenExitCount(prev => prev + 1)
        setIsFullscreen(false)
        setWarning(`You exited fullscreen! Return within ${countdownSeconds} seconds.`)
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
  }, [hasStarted, incrementTabSwitch, startRedirectCountdown, stopRedirectCountdown, countdownSeconds])

  // Redirect if limits exceeded
  useEffect(() => {
    if (tabSwitchCount > tabSwitchLimit) {
      router.push('/disqualified?reason=multiple_tab_switches')
    }
    if (fullscreenExitCount > fullscreenExitLimit) {
      router.push('/disqualified?reason=multiple_fullscreen_exits')
    }
  }, [tabSwitchCount, fullscreenExitCount, tabSwitchLimit, fullscreenExitLimit, router])

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center text-white bg-[#0a0a18]">
      {!hasStarted ? (
        <button
          onClick={startExam}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold shadow-lg"
        >
          Start Test (Fullscreen)
        </button>
      ) : (
        <>
          {warning && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-6 py-2 rounded-lg shadow-lg z-50">
              {warning}
              {!isFullscreen && (
                <div className="mt-2 text-sm flex flex-col items-center">
                  {redirectTimer > 0 && <p>Redirecting in {redirectTimer}s...</p>}
                  <button
                    onClick={startExam}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Return to Fullscreen
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="w-full h-full">{children}</div>
        </>
      )}
    </div>
  )
}
