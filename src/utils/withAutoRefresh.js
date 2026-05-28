import { refreshToken } from "../api/auth";

export class UnauthorizedError extends Error {
  constructor() { super('401'); this.status = 401; }
}

export async function withAutoRefresh(fn, onRefreshed) {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UnauthorizedError || err.status === 401) {
      try {
        const data = await refreshToken();
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
          if (data.role) localStorage.setItem('role', data.role);
          onRefreshed?.();
        }
        return await fn();
      } catch {
        throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
      }
    }
    throw err;
  }
}