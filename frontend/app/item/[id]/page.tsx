"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ItemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    const key = `cmon:progress:${id}`
    const raw = localStorage.getItem(key)
    if (raw) setProgress(Number(raw))
  }, [id])

  function save(v: number) {
    const key = `cmon:progress:${id}`
    localStorage.setItem(key, String(v))
    setProgress(v)
  }

  return (
    <div>
      <h2>Item {id}</h2>
      <p>진척도: {progress}%</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => save(Math.max(0, progress - 10))}>-10%</button>
        <button onClick={() => save(Math.min(100, progress + 10))}>+10%</button>
      </div>
    </div>
  )
}
