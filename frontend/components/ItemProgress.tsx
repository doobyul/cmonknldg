"use client"
import React, { useEffect, useState } from 'react'

export default function ItemProgress({ id }: { id: string }) {
  const [progress, setProgress] = useState<number>(0)
  const [asking, setAsking] = useState<boolean>(true)
  const [confirmNext, setConfirmNext] = useState<boolean>(false)
  const [nextId, setNextId] = useState<string | null>(null)

  useEffect(() => {
    const key = `cmon:progress:${id}`
    const raw = localStorage.getItem(key)
    if (raw) setProgress(Number(raw))

    // fetch next id from API
    fetch(`/api/next?id=${encodeURIComponent(id)}`).then(r => r.json()).then(j => {
      setNextId(j.nextId || null)
    }).catch(() => setNextId(null))
  }, [id])

  function save(v: number) {
    const key = `cmon:progress:${id}`
    localStorage.setItem(key, String(v))
    setProgress(v)
  }

  function goToNext(useSave: boolean) {
    if (useSave) save(100)
    if (nextId) {
      window.location.href = `/item/${nextId}`
    } else {
      window.location.href = '/book'
    }
  }

  const navLikeBtnStyle: React.CSSProperties = { padding: '10px 14px', fontSize: 16 }

  if (progress >= 100) {
    return (
      <div style={{ margin: '12px 0' }}>
        <div style={{ fontWeight: 700 }}>완료</div>
        <div style={{ marginTop: 8 }}>
          <button onClick={() => goToNext(false)} style={navLikeBtnStyle}>다음 항목으로 이동</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ margin: '12px 0' }}>
      {asking ? (
        <div>
          <div style={{ marginBottom: 8 }}>해당 내용을 숙지하셨나요?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { goToNext(true) }} style={{ ...navLikeBtnStyle, fontWeight: 700 }}>예</button>
            <button onClick={() => { setAsking(false); setConfirmNext(true) }} style={navLikeBtnStyle}>아니오</button>
          </div>
        </div>
      ) : null}

      {confirmNext ? (
        <div style={{ marginTop: 10 }}>
          <div style={{ marginBottom: 8 }}>다음 항목으로 넘어가시겠습니까?</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => goToNext(false)} style={{ ...navLikeBtnStyle, fontWeight: 700 }}>예</button>
            <button onClick={() => setConfirmNext(false)} style={navLikeBtnStyle}>아니오</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
