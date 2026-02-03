'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

export function useRecorder() {
      const [isRecording, setIsRecording] = useState(false)
      const [isPaused, setIsPaused] = useState(false)
      const [duration, setDuration] = useState(0)
      const [audioBlob, setAudioBlob] = useState(null)
      const [error, setError] = useState(null)

      const mediaRecorderRef = useRef(null)
      const chunksRef = useRef([])
      const streamRef = useRef(null)
      const timerRef = useRef(null)
      const isPausedRef = useRef(false)
      const elapsedBeforePauseRef = useRef(0)
      const lastResumeTimeRef = useRef(0)

      useEffect(() => {
            isPausedRef.current = isPaused
      }, [isPaused])

      const formatTime = useCallback((seconds) => {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }, [])

      const sendTimeUpdate = useCallback((time) => {
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('realtime-time-record', {
                        time,
                        formatted: formatTime(time)
                  })
            }
      }, [formatTime])

      const startRecording = useCallback(async (deviceId = null) => {
            setError(null)
            setAudioBlob(null)
            chunksRef.current = []

            try {
                  const constraints = {
                        audio: deviceId ? { deviceId: { exact: deviceId } } : true
                  }

                  const stream = await navigator.mediaDevices.getUserMedia(constraints)
                  streamRef.current = stream

                  let mimeType = 'audio/webm;codecs=opus'
                  if (typeof MediaRecorder !== 'undefined' && !MediaRecorder.isTypeSupported(mimeType)) {
                        if (MediaRecorder.isTypeSupported('audio/webm')) {
                              mimeType = 'audio/webm'
                        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
                              mimeType = 'audio/mp4'
                        } else {
                              mimeType = ''
                        }
                  }

                  const options = mimeType ? { mimeType } : {}
                  const mediaRecorder = new MediaRecorder(stream, options)
                  mediaRecorderRef.current = mediaRecorder

                  mediaRecorder.ondataavailable = (e) => {
                        if (e.data.size > 0) {
                              chunksRef.current.push(e.data)
                        }
                  }

                  mediaRecorder.onstop = () => {
                        const blobType = mediaRecorder.mimeType || 'audio/webm'
                        const blob = new Blob(chunksRef.current, { type: blobType })
                        setAudioBlob(blob)

                        if (streamRef.current) {
                              streamRef.current.getTracks().forEach(track => track.stop())
                              streamRef.current = null
                        }
                  }

                  mediaRecorder.start(1000)
                  setIsRecording(true)
                  setIsPaused(false)
                  isPausedRef.current = false
                  elapsedBeforePauseRef.current = 0
                  lastResumeTimeRef.current = Date.now()

                  if (typeof window !== 'undefined' && window.electron) {
                        window.electron.send('record-audio', { action: 'start' })
                  }

                  timerRef.current = setInterval(() => {
                        if (!isPausedRef.current) {
                              const elapsed = elapsedBeforePauseRef.current +
                                    Math.floor((Date.now() - lastResumeTimeRef.current) / 1000)
                              setDuration(elapsed)
                              sendTimeUpdate(elapsed)
                        }
                  }, 1000)

            } catch (err) {
                  console.error('Failed to start recording:', err)
                  setError('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบสิทธิ์การเข้าถึง')
            }
      }, [sendTimeUpdate])

      const pauseRecording = useCallback(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                  mediaRecorderRef.current.pause()
                  elapsedBeforePauseRef.current += Math.floor((Date.now() - lastResumeTimeRef.current) / 1000)
                  setIsPaused(true)
                  isPausedRef.current = true
            }
      }, [])

      const resumeRecording = useCallback(() => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                  mediaRecorderRef.current.resume()
                  lastResumeTimeRef.current = Date.now()
                  setIsPaused(false)
                  isPausedRef.current = false
            }
      }, [])

      const stopRecording = useCallback(() => {
            console.log('stopRecording')
            if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
                  mediaRecorderRef.current.stop()
                  setIsRecording(false)
                  setIsPaused(false)
                  isPausedRef.current = false

                  if (timerRef.current) {
                        clearInterval(timerRef.current)
                        timerRef.current = null
                  }
            }
      }, [])

      const saveRecording = useCallback(async () => {
            if (!audioBlob) return null

            try {
                  const reader = new FileReader()
                  const base64Promise = new Promise((resolve, reject) => {
                        reader.onloadend = () => {
                              const base64 = reader.result.split(',')[1]
                              resolve(base64)
                        }
                        reader.onerror = reject
                  })
                  reader.readAsDataURL(audioBlob)

                  const base64 = await base64Promise
                  const actualMimeType = audioBlob.type || 'audio/webm'

                  let userLanguage = 'en'
                  try {
                        const savedSettings = localStorage.getItem('ducksy_settings')
                        if (savedSettings) {
                              const settings = JSON.parse(savedSettings)
                              userLanguage = settings.language || 'en'
                        }
                  } catch (err) {
                        console.warn('Failed to get language setting:', err)
                  }

                  if (typeof window !== 'undefined' && window.electron) {
                        const result = await window.electron.invoke('save-audio-file', {
                              buffer: base64,
                              mimeType: actualMimeType,
                              duration: duration,
                              userLanguage: userLanguage
                        })
                        return result
                  }

                  return null
            } catch (err) {
                  console.error('Failed to save recording:', err)
                  setError('ไม่สามารถบันทึกไฟล์เสียงได้')
                  return null
            }
      }, [audioBlob, duration])

      const resetRecording = useCallback(() => {
            setAudioBlob(null)
            setDuration(0)
            setError(null)
            chunksRef.current = []
      }, [])

      useEffect(() => {
            if (typeof window === 'undefined' || !window.electron) return

            const handleControlUpdate = (data) => {
                  if (data.action === 'stop') {
                        stopRecording()
                  } else if (data.action === 'pause') {
                        if (isPausedRef.current) {
                              resumeRecording()
                        } else {
                              pauseRecording()
                        }
                  }
            }

            window.electron.receive('recording-control-update', handleControlUpdate)

            return () => {
                  window.electron.removeAllListeners?.('recording-control-update')
            }
      }, [stopRecording, pauseRecording, resumeRecording])

      useEffect(() => {
            return () => {
                  if (timerRef.current) {
                        clearInterval(timerRef.current)
                  }
                  if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop())
                  }
            }
      }, [])

      return {
            isRecording,
            isPaused,
            duration,
            formattedDuration: formatTime(duration),
            audioBlob,
            error,
            startRecording,
            pauseRecording,
            resumeRecording,
            stopRecording,
            saveRecording,
            resetRecording,
      }
}
