import { useEffect, useRef } from 'react'
import { pageView, INACTIVE_THRESHOLD } from '../api/snippets'

const FLUENTD_URL = import.meta.env.VITE_FLUENTD_URL || 'http://localhost:9880'

function getKSTTimestamp() {
  const now = new Date()
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000)
  return kst.toISOString().replace('Z', '+09:00')
}

function getOrCreateUUID() {
  let uuid = localStorage.getItem('client_uuid')
  if (!uuid) {
    uuid = crypto.randomUUID()
    localStorage.setItem('client_uuid', uuid)
  }
  return uuid
}

export function usePageView(pageName, userId = null) {
  const activeDwellRef   = useRef(0)
  const activeStartRef   = useRef(null)
  const inactiveTimerRef = useRef(null)
  const userIdRef        = useRef(userId)
  const pageNameRef      = useRef(pageName)

  // userId, pageName이 바뀔 때마다 ref 업데이트
  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  useEffect(() => {
    pageNameRef.current = pageName
  }, [pageName])

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

    // ── 브라우저/탭 닫힐 때 sendBeacon으로 로그 전송 ──
    const handleBeforeUnload = () => {
      stopActive()
      const dwellTime = Math.floor(activeDwellRef.current / 1000)
      if (dwellTime > 0) {
        navigator.sendBeacon(
          `${FLUENTD_URL}/kafka.logs`,
          JSON.stringify({
            event_name:      'page_view',
            pageName:        pageNameRef.current,
            dwellTime:       dwellTime,
            user_login_id:   userIdRef.current,
            client_uuid:     getOrCreateUUID(),
            event_timestamp: getKSTTimestamp(),
          })
        )
      }
    }

    const events = ['mousemove', 'click', 'scroll', 'keydown']
    events.forEach(e => window.addEventListener(e, handleActivity))
    window.addEventListener('beforeunload', handleBeforeUnload)
    startActive()

    return () => {
      stopActive()
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
      events.forEach(e => window.removeEventListener(e, handleActivity))
      window.removeEventListener('beforeunload', handleBeforeUnload)

      const dwellTime = Math.floor(activeDwellRef.current / 1000)
      if (dwellTime > 0) {
        pageView({ pageName, dwellTime, userId: userIdRef.current })
      }

      activeDwellRef.current = 0
      activeStartRef.current = null
    }
  }, [pageName])
}