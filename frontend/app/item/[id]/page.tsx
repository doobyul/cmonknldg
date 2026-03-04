import fs from 'fs'
import path from 'path'
import React from 'react'

import ItemProgress from '../../../components/ItemProgress'
import ItemNav from '../../../components/ItemNav'

type ItemType = {
  id?: string
  itemNo?: string | number
  itemName?: string
  contents?: string[]
  references?: { name?: string; content?: string }[]
}

export default function ItemPage({ params }: { params: { id: string } }) {
  const { id } = params
  const dataPath = path.resolve(process.cwd(), '..', 'data', 'books.json')
  let item: ItemType | null = null
  let chapterMeta: { chapterNo?: any; chapterName?: string } | null = null
  let sectionMeta: { sectionNo?: any; sectionName?: string } | null = null
  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    const book = JSON.parse(raw)
    for (let ci = 0; ci < (book.chapters || []).length; ci++) {
      const ch = book.chapters[ci]
      for (let si = 0; si < (ch.sections || []).length; si++) {
        const sec = ch.sections[si]
        for (let ii = 0; ii < (sec.items || []).length; ii++) {
          const it = sec.items[ii]
          if (it.id === id) {
            item = it
            chapterMeta = { chapterNo: ch.chapterNo, chapterName: ch.chapterName }
            sectionMeta = { sectionNo: sec.sectionNo, sectionName: sec.sectionName }
            break
          }
        }
        if (item) break
      }
      if (item) break
    }
  } catch (e) {
    // ignore
  }

  if (!item) {
    return (
      <div>
        <h2>Item {id}</h2>
        <p>항목을 찾을 수 없습니다. 변환된 `data/books.json`에 해당 id가 존재하는지 확인하세요.</p>
      </div>
    )
  }

  // dedupe references for display
  const uniqueRefs: { name?: string; content?: string }[] = []
  if (item.references && item.references.length) {
    const seen = new Set()
    for (const r of item.references) {
      const name = (r.name || '').trim()
      const content = (r.content || '').trim()
      const key = `${name}|||${content}`
      if (!seen.has(key)) { seen.add(key); uniqueRefs.push({ name, content }) }
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '16px', boxSizing: 'border-box' }}>
      <ItemNav id={id} />

      <header style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          {chapterMeta ? `${chapterMeta.chapterNo || ''}. ${chapterMeta.chapterName || ''}` : ''}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>
          {sectionMeta ? `${sectionMeta.sectionNo || ''}. ${sectionMeta.sectionName || ''}` : ''}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, marginTop: 10 }}>
          {item.itemNo ? `${item.itemNo}. ` : ''}{item.itemName || `Item ${id}`}
        </div>
      </header>

      <section style={{ marginBottom: 18 }}>
        {item.contents && item.contents.length ? (
          <div>
            {item.contents.map((c, idx) => (
              <p key={idx} style={{ margin: '8px 0', fontSize: 16, whiteSpace: 'pre-wrap' }}>{c}</p>
            ))}
          </div>
        ) : (
          <p>내용이 없습니다.</p>
        )}
      </section>

      {uniqueRefs.length > 0 ? (
        <section>
          <div>
            {uniqueRefs.map((r, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                {r.name ? (<div style={{ fontWeight: 700 }}>{r.name}</div>) : null}
                {r.content ? (<div style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{r.content}</div>) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* spacer: always leave about two lines before progress UI */}
      <div style={{ height: '2.2em' }} />

      <div style={{ marginBottom: 12 }}>
        <ItemProgress id={id} />
      </div>
    </main>
  )
}
