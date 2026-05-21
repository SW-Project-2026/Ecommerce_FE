import { useEffect, useRef } from 'react'
import { pageView, INACTIVE_THRESHOLD } from '../api/snippets'

export function usePageView(pageName, userId = null) {
  const activeDwellRef   = useRef(0)
  const activeStartRef   = useRef(null)
  const inactiveTimerRef = useRef(null)
  const userIdRef        = useRef(userId)

  // userId가 바뀔 때마다 ref 업데이트
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    if (!pageName) return

    const startActive = () => {
      if (activeStartRef.current === null) {
        activeStartRef.current = Date.now()
      }
    }

    const stopActive = () => {
      if (activeStartRef.current !== null) {
        activeDwellRef.current += Date.now() - activeStartRef.current
        activeStartRef.current = null
      }
    }

    const handleActivity = () => {
      startActive()
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
      inactiveTimerRef.current = setTimeout(() => {
        stopActive()
      }, INACTIVE_THRESHOLD)
    }

    const events = ['mousemove', 'click', 'scroll', 'keydown']
    events.forEach(e => window.addEventListener(e, handleActivity))
    startActive()

    return () => {
      stopActive()
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))

      const dwellTime = Math.floor(activeDwellRef.current / 1000)
      if (dwellTime > 0) {
        pageView({ pageName, dwellTime, userId: userIdRef.current })
      }

      activeDwellRef.current = 0
      activeStartRef.current = null
    }
  }, [pageName])
}