"use client"
import React, { useEffect, useState } from 'react'

export default function ItemNav({ id }: { id: string }) {
  const [prevId, setPrevId] = useState<string | null>(null)
  const [nextId, setNextId] = useState<string | null>(null)

  useEffect(() => {
    // fetch prev/next ids
    fetch(`/api/prev?id=${encodeURIComponent(id)}`).then(r => r.json()).then(j => setPrevId(j.prevId || null)).catch(() => setPrevId(null))
    fetch(`/api/next?id=${encodeURIComponent(id)}`).then(r => r.json()).then(j => setNextId(j.nextId || null)).catch(() => setNextId(null))

    // intercept browser back button to always go to /book (parent list)
    const onPop = (e: PopStateEvent) => {
      // navigate to book tree
      window.location.href = '/book'
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [id])

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
      <div>
        <button onClick={() => (window.location.href = '/book')} style={{ padding: '10px 14px', fontSize: 16 }}>뒤로(목록)</button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { if (prevId) window.location.href = `/item/${prevId}` }}
          disabled={!prevId}
          style={{ padding: '10px 14px', fontSize: 16 }}
        >이전</button>

        <button
          onClick={() => { if (nextId) window.location.href = `/item/${nextId}` }}
          disabled={!nextId}
          style={{ padding: '10px 14px', fontSize: 16 }}
        >다음</button>
      </div>
    </nav>
  )
}
