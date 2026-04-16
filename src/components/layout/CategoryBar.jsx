import { useState, useRef, useEffect } from 'react'

const CATEGORIES = [
  { id: 'all',      label: '전체',       left: 60 },
  { id: 'digital',  label: '가전·디지털', left: 115 },
  { id: 'fashion',  label: '패션',       left: 204 },
  { id: 'beauty',   label: '뷰티',       left: 276 },
  { id: 'food',     label: '식품',       left: 348 },
  { id: 'living',   label: '생활용품',    left: 420 },
  { id: 'sports',   label: '스포츠',     left: 492 },
]

export default function CategoryBar() {
  const [active, setActive] = useState('all')
  const [underline, setUnderline] = useState({ left: 60, width: 23 })
  const itemRefs = useRef({})

  useEffect(() => {
    const el = itemRefs.current[active]
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth })
  }, [active])

  useEffect(() => {
    const el = itemRefs.current['all']
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth })
  }, [])

  return (
    <nav className="category-bar">
      {CATEGORIES.map(cat => (
        <span
          key={cat.id}
          ref={el => { itemRefs.current[cat.id] = el }}
          className={`cat-item${active === cat.id ? ' active' : ''}`}
          style={{ left: cat.left }}
          onClick={() => setActive(cat.id)}
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
