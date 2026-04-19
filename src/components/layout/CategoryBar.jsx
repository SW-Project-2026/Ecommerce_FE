import { useState, useRef, useEffect } from 'react'

const CATEGORIES = [
  { id: 'home',    label: '홈',          left: 60,  isHome: true },
  { id: 'all',     label: '전체',        left: 106 },
  { id: 'digital', label: '가전·디지털', dbKey: '가전/디지털', left: 161 },
  { id: 'fashion', label: '패션',        left: 250 },
  { id: 'beauty',  label: '뷰티',        left: 322 },
  { id: 'food',    label: '식품',        left: 394 },
  { id: 'living',  label: '생활용품',    left: 466 },
  { id: 'sports',  label: '스포츠',      left: 556 },
]

export default function CategoryBar({ onNavigate, activeCategory }) {
  const [active, setActive] = useState(activeCategory || 'all')
  const [underline, setUnderline] = useState({ left: 60, width: 23 })
  const itemRefs = useRef({})

  useEffect(() => {
    const el = itemRefs.current[active]
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  useEffect(() => {
    const id = activeCategory || 'all'
    setActive(id)
  }, [activeCategory])

  useEffect(() => {
    const id = activeCategory || 'home'
    const el = itemRefs.current[id]
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  function handleClick(cat) {
    setActive(cat.id)
    if (!onNavigate) return
    if (cat.isHome) {
      onNavigate('home')
    } else {
      onNavigate('list', { id: cat.id, label: cat.label, dbKey: cat.dbKey })
    }
  }

  return (
    <nav className="category-bar">
      {CATEGORIES.map(cat => (
        <span
          key={cat.id}
          ref={el => { itemRefs.current[cat.id] = el }}
          className={`cat-item${active === cat.id ? ' active' : ''}`}
          style={{ left: cat.left }}
          onClick={() => handleClick(cat)}
        >
          {cat.label}
        </span>
      ))}
      <div
        className="cat-underline"
        style={{ left: underline.left, width: underline.width }}
      />
      <div className="cat-bottom" />
    </nav>
  )
}
