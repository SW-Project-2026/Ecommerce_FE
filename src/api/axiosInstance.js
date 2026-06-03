import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

function setCookie(name, value, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function getCookie(name) {
  return document.cookie.split('; ').reduce((acc, part) => {
    const [k, v] = part.split('=')
    return k === name ? decodeURIComponent(v) : acc
  }, null)
}

function removeCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

// ── axios 인스턴스 생성 ──
const axiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // refresh token 쿠키 포함
})

// ── 요청 interceptor: accessToken 자동 첨부 ──
axiosInstance.interceptors.request.use(
  config => {
    const token = getCookie('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// ── refresh 중복 호출 방지 플래그 ──
let isRefreshing = false
let failedQueue = [] // refresh 중 대기 중인 요청들

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

// ── 응답 interceptor: 401 시 자동 refresh ──
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // BE 응답 메시지 추출
    const beMessage = error.response?.data?.message

    // 403: 권한 없음 → refresh 시도 없이 바로 에러
    if (error.response?.status === 403) {
      return Promise.reject(new Error(beMessage || '접근 권한이 없습니다.'))
    }

    // 401이 아니거나 이미 retry한 요청이면 그냥 에러
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(new Error(beMessage || error.message))
    }

    // refresh API 자체가 401이면 바로 로그아웃
    if (originalRequest.url === '/api/users/refresh') {
      clearAuthAndRedirect()
      return Promise.reject(new Error(beMessage || error.message))
    }

    // 이미 refresh 중이면 queue에 추가해서 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      }).catch(err => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const res = await axiosInstance.post('/api/users/refresh')
      const newToken = res.data?.data?.accessToken
      const newRole  = res.data?.data?.role

      if (newToken) {
        setCookie('accessToken', newToken)
        if (newRole) localStorage.setItem('role', newRole)
        axiosInstance.defaults.headers.Authorization = `Bearer ${newToken}`
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
      }

      return axiosInstance(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      clearAuthAndRedirect()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

function clearAuthAndRedirect() {
  removeCookie('accessToken')
  localStorage.removeItem('role')
  localStorage.removeItem('userId')
  sessionStorage.clear()
  window.location.href = '/'
}

export default axiosInstance