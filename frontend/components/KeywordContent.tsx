"use client"

import React from 'react'

type InternalTarget = {
  id: string
  label: string
}

type Props = {
  contents: string[]
  internalIndex: Record<string, InternalTarget[]>
  dictionaryKeywords?: string[]
}

function normalizeTerm(v: string) {
  return (v || '').trim().toLowerCase().replace(/[^가-힣a-z0-9]/gi, '')
}

const PARTICLES = ['으로', '에서', '에게', '부터', '까지', '처럼', '보다', '은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '만', '로', '나', '랑']
const PARTICLES_SORTED = [...PARTICLES].sort((a, b) => b.length - a.length)

const GRAMMATICAL_SUFFIXES = ['으로서', '으로써', '으로', '에서', '에게', '부터', '까지', '처럼', '하는', '하다', '했다', '한다', '하며', '하여', '했던', '된', '되는', '된다', '한', '함', '됨', '이다', '인', '은', '는', '이', '가', '을', '를', '의', '에', '와', '과', '도', '만', '로', '나', '랑'].sort((a, b) => b.length - a.length)
const DERIVATIONAL_SUFFIXES = ['스럽다', '스럽게', '스러운', '적이다', '적인', '적', '화하다', '화된', '화', '성', '론', '법'].sort((a, b) => b.length - a.length)

const STOPWORDS = new Set(['그리고', '그러나', '또한', '이것', '저것', '그것', '해당', '관련', '내용', '경우', '방법', '부분', '문제', '정도', '대한', '위한', '에서', '으로', '이다', '있다', '없다', '한다', '하였다', '합니다', '수', '등'])

function isKeywordToken(token: string) {
  const norm = normalizeTerm(token)
  if (!norm) return false
  if (norm.length < 3) return false
  if (STOPWORDS.has(norm)) return false
  if (/^(하다|했다|한다|되는|된다|있다|없다|이다)$/i.test(norm)) return false
  if (/^\d+$/.test(norm)) return false
  return /[가-힣a-z0-9]/i.test(norm)
}

function splitParticle(token: string) {
  const t = (token || '').trim()
  for (const p of PARTICLES_SORTED) {
    if (t.endsWith(p) && t.length - p.length >= 2) return { base: t.slice(0, -p.length), suffix: p }
  }
  return { base: t, suffix: '' }
}

function splitByAffix(token: string) {
  let current = (token || '').trim()
  let collected = ''

  for (let i = 0; i < 2; i++) {
    let changed = false
    for (const s of GRAMMATICAL_SUFFIXES) {
      if (current.endsWith(s) && current.length - s.length >= 2) {
        current = current.slice(0, -s.length)
        collected = `${s}${collected}`
        changed = true
        break
      }
    }
    if (!changed) break
  }

  for (let i = 0; i < 2; i++) {
    let changed = false
    for (const s of DERIVATIONAL_SUFFIXES) {
      if (current.endsWith(s) && current.length - s.length >= 2) {
        current = current.slice(0, -s.length)
        collected = `${s}${collected}`
        changed = true
        break
      }
    }
    if (!changed) break
  }

  return { base: current, suffix: collected }
}

function searchLinks(term: string) {
  const q = encodeURIComponent(term)
  return {
    google: `https://www.google.com/search?q=${q}`,
    wikipedia: `https://ko.wikipedia.org/wiki/Special:Search?search=${q}`,
    namu: `https://namu.wiki/w/${q}`,
    naver: `https://search.naver.com/search.naver?query=${q}`
  }
}

export default function KeywordContent({ contents, internalIndex, dictionaryKeywords = [] }: Props) {
  const [selected, setSelected] = React.useState('')
  const normalizedSelected = normalizeTerm(selected)
  const matches = normalizedSelected ? (internalIndex[normalizedSelected] || []) : []

  const dictionaryTerms = React.useMemo(() => {
    const map = new Map<string, string>()
    for (const raw of dictionaryKeywords) {
      const term = String(raw || '').trim()
      const norm = normalizeTerm(term)
      if (!term || norm.length < 2) continue
      if (!internalIndex[norm] || internalIndex[norm].length === 0) continue
      if (!map.has(norm) || (map.get(norm) || '').length < term.length) map.set(norm, term)
    }
    return Array.from(map.values()).sort((a, b) => b.length - a.length)
  }, [dictionaryKeywords, internalIndex])

  const renderFallbackToken = (part: string, key: string) => {
    const looksLikeWord = /[가-힣A-Za-z0-9]/.test(part)
    const p = splitParticle(part)
    const e = splitByAffix(p.base)
    const candidate = e.base
    const suffix = `${e.suffix}${p.suffix}`

    const candidateNorm = normalizeTerm(candidate)
    const hasInternal = !!(candidateNorm && internalIndex[candidateNorm] && internalIndex[candidateNorm].length)
    const canExternal = isKeywordToken(candidate)

    if (looksLikeWord && candidate && (hasInternal || canExternal)) {
      return (
        <React.Fragment key={key}>
          <button onClick={() => setSelected(candidate)} style={{ border: 'none', background: selected === candidate ? 'rgba(255, 236, 179, 0.9)' : 'rgba(255, 249, 196, 0.65)', textDecoration: 'underline', cursor: 'pointer', padding: '0 2px', margin: 0, font: 'inherit' }} title="키워드 옵션 보기">
            {candidate}
          </button>
          {suffix}
        </React.Fragment>
      )
    }
    return <React.Fragment key={key}>{part}</React.Fragment>
  }

  const splitByDictionary = (text: string) => {
    type Seg = { text: string; dictTerm?: string }
    let segs: Seg[] = [{ text }]
    for (const term of dictionaryTerms) {
      const next: Seg[] = []
      for (const seg of segs) {
        if (seg.dictTerm) {
          next.push(seg)
          continue
        }
        const source = seg.text
        let from = 0
        let idx = source.indexOf(term, from)
        if (idx < 0) {
          next.push(seg)
          continue
        }
        while (idx >= 0) {
          if (idx > from) next.push({ text: source.slice(from, idx) })
          next.push({ text: term, dictTerm: term })
          from = idx + term.length
          idx = source.indexOf(term, from)
        }
        if (from < source.length) next.push({ text: source.slice(from) })
      }
      segs = next
    }
    return segs
  }

  return (
    <div>
      {contents.map((text, idx) => {
        const dictSegs = splitByDictionary(text)
        return (
          <p key={idx} style={{ margin: '8px 0', fontSize: 16, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
            {dictSegs.flatMap((seg, si) => {
              if (seg.dictTerm) {
                const term = seg.dictTerm
                return (
                  <button key={`d-${idx}-${si}`} onClick={() => setSelected(term)} style={{ border: 'none', background: selected === term ? 'rgba(255, 236, 179, 0.9)' : 'rgba(255, 249, 196, 0.65)', textDecoration: 'underline', cursor: 'pointer', padding: '0 2px', margin: 0, font: 'inherit' }} title="사전 키워드 옵션 보기">
                    {term}
                  </button>
                )
              }

              const parts = seg.text.split(/([가-힣A-Za-z0-9·-]{2,})/g)
              return parts.map((part, pi) => renderFallbackToken(part, `f-${idx}-${si}-${pi}`))
            })}
          </p>
        )
      })}

      {selected ? (
        <div style={{ marginTop: 14, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>선택 키워드: "{selected}"</div>

          {matches.length > 0 ? (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>'{selected}'로 이동</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {matches.slice(0, 5).map((m, i) => (
                  <button key={`${m.id}-${i}`} onClick={() => { window.location.href = `/item/${m.id}` }} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer' }}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>외부에서 검색</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={searchLinks(selected).google} target="_blank" rel="noreferrer noopener">구글</a>
              <a href={searchLinks(selected).wikipedia} target="_blank" rel="noreferrer noopener">위키피디아</a>
              <a href={searchLinks(selected).namu} target="_blank" rel="noreferrer noopener">나무위키</a>
              <a href={searchLinks(selected).naver} target="_blank" rel="noreferrer noopener">네이버</a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
