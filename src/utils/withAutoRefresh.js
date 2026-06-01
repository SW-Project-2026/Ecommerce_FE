import { refreshToken } from "../api/auth";

export class UnauthorizedError extends Error {
  constructor() { super('401'); this.status = 401; }
}

// ── refresh 중복 호출 방지 플래그 ──
let isRefreshing = false;

function clearAuthAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  sessionStorage.clear();
  window.location.href = '/';
}

export async function withAutoRefresh(fn, onRefreshed) {
  try {
    return await fn();
  } catch (err) {
    // 403: 권한 없음 → refresh 시도 없이 바로 에러
    if (err.status === 403) {
      throw new Error('접근 권한이 없습니다.');
    }

    // 401: 토큰 없음 또는 만료 → refresh 시도
    if (err instanceof UnauthorizedError || err.status === 401) {
      // 이미 refresh 중이면 무한루프 방지를 위해 바로 로그아웃
      if (isRefreshing) {
        clearAuthAndRedirect();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }

      isRefreshing = true;
      try {
        const data = await refreshToken();
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.role) localStorage.setItem('role', data.role);
          onRefreshed?.();
        }
        isRefreshing = false;
        return await fn();
      } catch {
        // refresh 자체가 실패하면 재시도 없이 바로 로그아웃
        isRefreshing = false;
        clearAuthAndRedirect();
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }

    throw err;
  }
}