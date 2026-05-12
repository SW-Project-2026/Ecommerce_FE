const BASE_URL = 'http://localhost:8080' // BE 서버 주소

let timer = null // 디바운싱용 타이머

export const clickSearchButton = async (query, userId = null) => {
  if (!query.trim()) return // 공백이면 전송 안함

  if (timer) clearTimeout(timer) // 이전 타이머 취소

  timer = setTimeout(async () => { // 500ms 후 실행
    await fetch(`${BASE_URL}/snippets/search`, { // BE로 POST 요청
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // JSON 형식으로 전송
      body: JSON.stringify({
        event_name: 'search_button_click', // 이벤트 이름
        keyword: query, // 검색어
        user_id: userId, // 유저 ID (비로그인시 null)
        event_timestamp: new Date().toISOString() // 버튼 클릭 시간
      })
    })
  }, 500)
}