import { refreshToken } from "../api/auth";

export async function withAutoRefresh(fn, onRefreshed) {
  try {
    return await fn();
  } catch (err) {
    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      try {
        const data = await refreshToken();
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
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