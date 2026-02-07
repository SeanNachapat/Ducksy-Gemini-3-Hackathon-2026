'use client'

import { useState, useEffect, useCallback } from 'react'

export function useSessionLogs() {
      const [sessionLogs, setSessionLogs] = useState([])
      const [isLoading, setIsLoading] = useState(true)
      const [error, setError] = useState(null)

      const fetchSessionLogs = useCallback(async () => {
            if (typeof window === 'undefined' || !window.electron) {
                  setIsLoading(false)
                  return
            }

            try {
                  setIsLoading(true)
                  setError(null)

                  const result = await window.electron.invoke('get-session-logs')

                  if (result.success) {
                        setSessionLogs(result.data)
                  } else {
                        setError(result.error)
                  }
            } catch (err) {
                  console.error('Failed to fetch session logs:', err)
                  setError(err.message)
            } finally {
                  setIsLoading(false)
            }
      }, [])

      const refetch = useCallback(() => {
            fetchSessionLogs()
      }, [fetchSessionLogs])

      const deleteSession = useCallback(async (fileId) => {
            if (typeof window === 'undefined' || !window.electron) {
                  return { success: false, error: 'Electron not available' }
            }

            try {
                  const result = await window.electron.invoke('delete-session', { fileId })

                  if (result.success) {
                        setSessionLogs(prev => prev.filter(log => log.fileId !== fileId))
                  }

                  return result
            } catch (err) {
                  console.error('Failed to delete session:', err)
                  return { success: false, error: err.message }
            }
      }, [])

      // Initial fetch
      useEffect(() => {
            fetchSessionLogs()
      }, [fetchSessionLogs])

      // Listen for new recordings
      useEffect(() => {
            if (typeof window === 'undefined' || !window.electron) return

            const handleNewRecording = () => {
                  console.log('New recording saved, refreshing session logs...')
                  fetchSessionLogs()
            }

            const handleTranscriptionUpdate = (data) => {
                  console.log('Transcription updated:', data)
                  // Update specific session log
                  if (data.fileId) {
                        setSessionLogs(prev => prev.map(log => {
                              if (log.fileId === data.fileId) {
                                    return {
                                          ...log,
                                          transcriptionStatus: data.status,
                                          title: data.title || log.title,
                                          details: {
                                                ...log.details,
                                                ...data.details
                                          },
                                          calendarEvent: data.calendarEvent || log.calendarEvent
                                    }
                              }
                              return log
                        }))
                  } else {
                        // Refetch all if no specific fileId
                        fetchSessionLogs()
                  }
            }

            window.electron.receive('recording-saved', handleNewRecording)
            window.electron.receive('transcription-updated', handleTranscriptionUpdate)

            return () => {
                  window.electron.removeAllListeners?.('recording-saved')
                  window.electron.removeAllListeners?.('transcription-updated')
            }
      }, [fetchSessionLogs])

      return {
            sessionLogs,
            isLoading,
            error,
            refetch,
            deleteSession
      }
}