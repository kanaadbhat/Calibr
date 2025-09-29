'use client'
import { useState, useEffect } from 'react'
import { fetchTestSession } from './actions'
import type { UseTestQuestionsReturn, ProcessedQuestion, AptitudeData } from './types'

export function useTestQuestions(aptitudeId: string | null): UseTestQuestionsReturn {
  const [questions, setQuestions] = useState<ProcessedQuestion[]>([])
  const [aptitudeData, setAptitudeData] = useState<AptitudeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tabSwitchWarningCount, setTabSwitchWarningCount] = useState(0)

  useEffect(() => {
    if (!aptitudeId) {
      setError('No aptitude assessment ID provided')
      setLoading(false)
      return
    }

    const loadQuestions = async (): Promise<void> => {
      try {
        setLoading(true)
        setError(null)
        
        const result = await fetchTestSession(aptitudeId)
        
        if (result.success && result.data) {
          setQuestions(result.data.allQuestions)
          setAptitudeData(result.data)
        } else {
          setError(result.error || 'Failed to load questions')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
        setError(errorMessage)
        console.error('Error loading questions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [aptitudeId])

  return { 
    questions, 
    aptitudeData, 
    loading, 
    error ,
    tabSwitchWarningCount,
    setTabSwitchWarningCount
  }
}