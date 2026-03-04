"use client"
import React from 'react'
import Link from 'next/link'

function getProgressSummary() {
  try {
    if (typeof window === 'undefined') return { completed: 0, total: 0 }
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cmon:progress:'))
    let total = keys.length
    let completed = 0
    for (const k of keys) {
      const v = Number(localStorage.getItem(k) || 0)
      if (v >= 100) completed++
    }
    return { completed, total }
  } catch (e) {
    return { completed: 0, total: 0 }
  }
}

export default function Home() {
  // client-only values will render empty on server; keep simple
  const [summary, setSummary] = React.useState<{ completed: number; total: number }>({ completed: 0, total: 0 })
  const [lastId, setLastId] = React.useState<string | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setSummary(getProgressSummary())
    setLastId(getLast())
    setMounted(true)
  }, [])

  const getLast = () => (typeof window !== 'undefined' ? localStorage.getItem('cmon:last') : null)

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>CmonKnldg</h1>
        <p style={{ marginTop: 6, color: '#666' }}>Start learning — choose how you want to proceed.</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              const last = getLast()
              if (last) { window.location.href = `/item/${last}`; return }
              try {
                const r = await fetch('/api/first')
                const j = await r.json()
                if (j.firstId) window.location.href = `/item/${j.firstId}`
                else window.location.href = '/book'
              } catch (e) { window.location.href = '/book' }
            }}
            style={{ padding: '14px 18px', fontSize: 18, flex: '1 1 200px' }}
          >{mounted && lastId ? '이어하기' : '책 열기'}</button>

          <button
            onClick={() => { window.location.href = '/book' }}
            style={{ padding: '14px 18px', fontSize: 18, flex: '1 1 200px' }}
          >목차</button>

          <button
            onClick={() => { window.location.href = '/dashboard' }}
            style={{ padding: '14px 18px', fontSize: 18, flex: '1 1 200px' }}
          >대시보드</button>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ flex: '0 0 120px', fontWeight: 700 }}>진척</div>
          <div style={{ flex: '1 1 auto' }}>
            <div>{summary.completed} / {summary.total} completed</div>
            <div style={{ marginTop: 6, height: 8, background: '#f0f0f0', borderRadius: 4 }}>
              <div style={{ width: summary.total ? `${Math.round((summary.completed/summary.total)*100)}%` : '0%', height: '100%', background: '#4caf50', borderRadius: 4 }} />
            </div>
          </div>
        </div>

        <div style={{ padding: 12, border: '1px dashed #eee', borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>빠른 시작</h3>
          <p style={{ margin: '6px 0' }}>"예"를 눌러 항목을 완료하면 자동으로 다음 항목으로 넘어가는 연속 학습을 시작합니다.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={async () => {
              localStorage.setItem('cmon:continuous', '1')
              const last = getLast()
              if (last) { window.location.href = `/item/${last}`; return }
              try { const r = await fetch('/api/first'); const j = await r.json(); if (j.firstId) window.location.href = `/item/${j.firstId}`; else window.location.href = '/book' } catch (e) { window.location.href = '/book' }
            }} style={{ padding: '10px 14px' }}>이어서 시작</button>

            <button onClick={() => {
              localStorage.removeItem('cmon:continuous')
              const last = getLast()
              if (last) { window.location.href = '/book?focus=' + encodeURIComponent(last); return }
              window.location.href = '/book'
            }} style={{ padding: '10px 14px' }}>선택해서 시작</button>
          </div>
        </div>
      </section>
    </main>
  )
}
