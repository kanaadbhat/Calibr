'use client'

import React, { createContext, useContext, useRef, useCallback, ReactNode, useState } from 'react'

/**
 * Warning Context for tracking exam protection warnings across components
 * This context manages warning counts and provides methods to update them
 */
interface WarningContextType {
  // Warning counts
  tabSwitchCount: number
  fullscreenExitCount: number
  audioWarningCount: number
  
  // Warning limits from aptitude model
  tabSwitchLimit: number
  fullscreenExitLimit: number
  audioWarningLimit: number
  
  // Methods to update warning counts
  incrementTabSwitch: () => void
  incrementFullscreenExit: () => void
  incrementAudioWarning: () => void
  

  hasExceededLimits: () => boolean
  getExceededWarnings: () => string[]
  

  getWarningState: () => {
    tabSwitch: { count: number; maxAllowed: number; exceeded: boolean }
    fullscreen: { count: number; maxAllowed: number; exceeded: boolean }
    audio: { count: number; maxAllowed: number; exceeded: boolean }
  }
  
  // Reset warnings (for new test session)
  resetWarnings: () => void
}

const WarningContext = createContext<WarningContextType | undefined>(undefined)

interface WarningProviderProps {
  children: ReactNode
  tabSwitchLimit: number
  fullscreenExitLimit: number
  audioWarningLimit: number
}

export function WarningProvider({
  children,
  tabSwitchLimit,
  fullscreenExitLimit,
  audioWarningLimit
}: WarningProviderProps) {
  const tabSwitchCount = useRef(0)
  const fullscreenExitCount = useRef(0)
  const audioWarningCount = useRef(0)
  

  const [, forceUpdate] = useState({})

  const incrementTabSwitch = useCallback(() => {
    tabSwitchCount.current += 1
    console.log(' Tab switch incremented. New count:', tabSwitchCount.current)
    forceUpdate({}) // Trigger re-render
  }, [])

  const incrementFullscreenExit = useCallback(() => {
    fullscreenExitCount.current += 1
    console.log('Fullscreen exit incremented. New count:', fullscreenExitCount.current)
    forceUpdate({}) // Trigger re-render
  }, [])

  const incrementAudioWarning = useCallback(() => {
    audioWarningCount.current += 1
    console.log('Audio warning incremented. New count:', audioWarningCount.current)
    forceUpdate({}) // Trigger re-render
  }, [])

  const hasExceededLimits = useCallback(() => {
    return (
      tabSwitchCount.current > tabSwitchLimit ||
      fullscreenExitCount.current > fullscreenExitLimit ||
      audioWarningCount.current > audioWarningLimit
    )
  }, [tabSwitchLimit, fullscreenExitLimit, audioWarningLimit])

  const getExceededWarnings = useCallback(() => {
    const exceeded: string[] = []
    if (tabSwitchCount.current > tabSwitchLimit) exceeded.push('tab_switch')
    if (fullscreenExitCount.current > fullscreenExitLimit) exceeded.push('fullscreen_exit')
    if (audioWarningCount.current > audioWarningLimit) exceeded.push('audio_warning')
    return exceeded
  }, [tabSwitchLimit, fullscreenExitLimit, audioWarningLimit])

  const getWarningState = useCallback(() => {
    const state = {
      tabSwitch: {
        count: tabSwitchCount.current,
        maxAllowed: tabSwitchLimit,
        exceeded: tabSwitchCount.current > tabSwitchLimit
      },
      fullscreen: {
        count: fullscreenExitCount.current,
        maxAllowed: fullscreenExitLimit,
        exceeded: fullscreenExitCount.current > fullscreenExitLimit
      },
      audio: {
        count: audioWarningCount.current,
        maxAllowed: audioWarningLimit,
        exceeded: audioWarningCount.current > audioWarningLimit
      }
    }
    console.log('Warning state retrieved:', state)
    return state
  }, [tabSwitchLimit, fullscreenExitLimit, audioWarningLimit])

  const resetWarnings = useCallback(() => {
    tabSwitchCount.current = 0
    fullscreenExitCount.current = 0
    audioWarningCount.current = 0
    console.log('Warning counts reset to 0')
    forceUpdate({}) // Trigger re-render
  }, [])

  const value: WarningContextType = {
    tabSwitchCount: tabSwitchCount.current,
    fullscreenExitCount: fullscreenExitCount.current,
    audioWarningCount: audioWarningCount.current,
    tabSwitchLimit,
    fullscreenExitLimit,
    audioWarningLimit,
    incrementTabSwitch,
    incrementFullscreenExit,
    incrementAudioWarning,
    hasExceededLimits,
    getExceededWarnings,
    getWarningState,
    resetWarnings
  }

  return (
    <WarningContext.Provider value={value}>
      {children}
    </WarningContext.Provider>
  )
}

/**
 * Hook to use warning context
 * @throws Error if used outside WarningProvider
 */
export function useWarningContext(): WarningContextType {
  const context = useContext(WarningContext)
  if (context === undefined) {
    throw new Error('useWarningContext must be used within a WarningProvider')
  }
  return context
}





