"use client"
import { useEffect } from 'react'

export default function BookFocus() {
  useEffect(() => {
    try {
      // mark completed items in TOC using strike-through
      const keys = Object.keys(localStorage).filter(k => k.startsWith('cmon:progress:'))
      for (const k of keys) {
        const id = k.replace('cmon:progress:', '')
        const v = Number(localStorage.getItem(k) || 0)
        if (v < 100) continue
        const li = document.getElementById(`item-${id}`)
        if (!li) continue
        const a = li.querySelector('a') as HTMLAnchorElement | null
        if (!a) continue
        a.style.textDecoration = 'line-through'
        a.style.opacity = '0.75'
      }

      const params = new URLSearchParams(window.location.search)
      const focus = params.get('focus')
      if (!focus) return
      const el = document.getElementById(`item-${focus}`)
      if (!el) return
      // scroll so the element is near center
      const rect = el.getBoundingClientRect()
      const offset = rect.top + window.scrollY - (window.innerHeight / 2) + (rect.height / 2)
      window.scrollTo({ top: offset, behavior: 'smooth' })
      // optionally highlight briefly
      el.style.transition = 'background-color 0.6s'
      const orig = el.style.backgroundColor
      el.style.backgroundColor = 'rgba(255,245,200,0.9)'
      setTimeout(() => { el.style.backgroundColor = orig }, 1200)
    } catch (e) {
      // ignore
    }
  }, [])

  return null
}
