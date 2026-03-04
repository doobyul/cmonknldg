"use client"

import React from 'react'

function countProgressKeys() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('cmon:progress:'))
    return keys.length
  } catch (e) {
    return 0
  }
}

export default function DashboardPage() {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    setCount(countProgressKeys())
  }, [])

  const resetProgress = () => {
    const ok = window.confirm('학습 진척 데이터를 모두 초기화할까요? 이 작업은 되돌릴 수 없습니다.')
    if (!ok) return

    try {
      const keys = Object.keys(localStorage)
      for (const k of keys) {
        if (k.startsWith('cmon:progress:')) localStorage.removeItem(k)
      }
      localStorage.removeItem('cmon:last')
      localStorage.removeItem('cmon:lastAt')
      localStorage.removeItem('cmon:continuous')
      setCount(0)
      window.alert('진척 데이터가 초기화되었습니다.')
    } catch (e) {
      window.alert('초기화 중 오류가 발생했습니다.')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => { window.location.href = '/' }} style={{ padding: '10px 14px', fontSize: 16 }}>
          뒤로(홈)
        </button>
      </div>
      <h2>Dashboard</h2>
      <p>저장된 진척 항목 수: <strong>{count}</strong></p>

      <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>데이터 관리</h3>
        <p style={{ marginTop: 6, color: '#666' }}>
          로컬에 저장된 학습 진척/마지막 위치 정보를 초기화합니다.
        </p>
        <button
          onClick={resetProgress}
          style={{
            marginTop: 8,
            padding: '10px 14px',
            background: '#d32f2f',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          진척 초기화
        </button>
      </div>
    </div>
  )
}
