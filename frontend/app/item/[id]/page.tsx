import fs from 'fs'
import path from 'path'
import React from 'react'

import ItemProgress from '../../../components/ItemProgress'
import ItemNav from '../../../components/ItemNav'
import KeywordContent from '../../../components/KeywordContent'

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
  const dictPath = path.resolve(process.cwd(), '..', 'data', 'dictionary.txt')
  let item: ItemType | null = null
  let chapterMeta: { chapterNo?: any; chapterName?: string } | null = null
  let sectionMeta: { sectionNo?: any; sectionName?: string } | null = null
  let internalIndex: Record<string, { id: string; label: string }[]> = {}
  let dictionaryKeywords: string[] = []

  const normalizeTerm = (v: string) => (v || '').trim().toLowerCase().replace(/[^가-힣a-z0-9]/gi, '')

  const addIndex = (term: string, target: { id: string; label: string }) => {
    const key = normalizeTerm(term)
    if (!key || key.length < 2) return
    if (!internalIndex[key]) internalIndex[key] = []
    if (!internalIndex[key].some(t => t.id === target.id)) internalIndex[key].push(target)
  }

  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    const book = JSON.parse(raw)

    // 1) dictionary keyword list (one line = one keyword)
    if (fs.existsSync(dictPath)) {
      const dictRaw = fs.readFileSync(dictPath, 'utf8')
      dictionaryKeywords = dictRaw
        .split(/\r?\n/)
        .map(v => v.trim())
        .filter(v => v && !v.startsWith('#'))
    }

    // 2) fallback auto index from itemName/reference
    for (const ch of (book.chapters || [])) {
      for (const sec of (ch.sections || [])) {
        for (const it of (sec.items || [])) {
          const label = `${it.itemNo ? `${it.itemNo}. ` : ''}${it.itemName || it.id}`
          addIndex(String(it.itemName || ''), { id: String(it.id || ''), label })

          for (const r of (it.references || [])) {
            addIndex(String(r?.name || ''), { id: String(it.id || ''), label })
          }
        }
      }
    }

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
          <KeywordContent contents={item.contents} internalIndex={internalIndex} dictionaryKeywords={dictionaryKeywords} />
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
