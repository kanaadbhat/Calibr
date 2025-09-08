'use client'
import { useState, useEffect } from 'react'
import { fetchTestSession } from './actions'


export function useTestQuestions(aptitudeId: string | null) {
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aptitudeData,setAptitudeData] = useState<any>(null)

  useEffect(() => {
    if (!aptitudeId) {
      setError('No aptitude allotted for you ')
      setLoading(false)
      return
    }

    const loadQuestions = async () => {
      try {
        const result = await fetchTestSession(aptitudeId)
        if (result.success && result.data) {
          setQuestions(result.data.allQuestions)
          setAptitudeData(result.data)

        } else {
          setError(result.error || 'Failed to load questions')
        }
      } catch (err) {
        setError('An unexpected error occurred')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadQuestions()
  }, [aptitudeId])

  return { questions , aptitudeData , loading , error }
}