const fs = require('fs')
const path = require('path')
const xlsx = require('xlsx')

const INPUT = path.resolve(process.cwd(), 'book1.xlsx')
const OUT_DIR = path.resolve(process.cwd(), 'data')
const OUT_FILE = path.join(OUT_DIR, 'books.json')

if (!fs.existsSync(INPUT)) {
  console.error('Input Excel not found:', INPUT)
  process.exit(2)
}

const wb = xlsx.readFile(INPUT, {cellDates: true})
const sheet = wb.Sheets[wb.SheetNames[0]]
const rows = xlsx.utils.sheet_to_json(sheet, {defval: ''})

function norm(k){
  return String(k).trim().replace(/\s+/g, '').toLowerCase()
}

function getVal(nrow, candidates){
  for(const c of candidates){
    if (nrow[c] !== undefined && nrow[c] !== null && String(nrow[c]).trim()!=='') return nrow[c]
  }
  return ''
}

// normalize each row keys
const nrows = rows.map(r => {
  const obj = {}
  Object.keys(r).forEach(k => { obj[norm(k)] = r[k] })
  return obj
})

const book = { title: 'Imported Book', chapters: [] }
const chapterMap = new Map()

let autoChapterId = 0
nrows.forEach((r)=>{
  const chapterNo = getVal(r, ['chapterno','chapterno','chapter','챕터번호','챕터'])
  const chapterName = getVal(r, ['chaptername','chapternm','chaptern','챕터명']) || getVal(r, ['chapternm','챕터명'])
  const sectionNo = getVal(r, ['sectionno','section','섹션번호'])
  const sectionName = getVal(r, ['sectionname','sectionnm','섹션명'])
  const itemNo = getVal(r, ['itemno','item','항목번호'])
  const itemName = getVal(r, ['itemname','itemnm','항목명'])

  // decide chapter key: prefer chapterNo, else chapterName, else auto id
  let cKey = chapterNo || chapterName
  if (!cKey) { autoChapterId++; cKey = `__c${autoChapterId}` }
  if (!chapterMap.has(cKey)) {
    chapterMap.set(cKey, { chapterNo: chapterNo || '', chapterName: chapterName || '', sections: new Map() })
  }
  const chapter = chapterMap.get(cKey)

  let sKey = sectionNo || sectionName
  if (!sKey) {
    // use incremented index per chapter
    const idx = chapter.sections.size + 1
    sKey = `__s${idx}`
  }
  if (!chapter.sections.has(sKey)) {
    chapter.sections.set(sKey, { sectionNo: sectionNo || '', sectionName: sectionName || '', items: [] })
  }
  const section = chapter.sections.get(sKey)

  // collect contents (look for keys containing itemcontent or 항목내용 or content)
  const contents = []
  Object.keys(r).forEach(k => {
    if (k.includes('itemcontent') || k.includes('항목내용') || k.includes('content') && !k.includes('ref')) {
      const v = r[k]
      if (v !== undefined && v !== null && String(v).trim() !== '') contents.push(String(v))
    }
  })

  // collect references: look for refname/refcontent or 참조명/참조내용 patterns
  const rawRefs = []
  for (let i=1;i<=10;i++){
    const nameKey = norm(`참조명${i}`)
    const contentKey = norm(`참조내용${i}`)
    const vname = r[nameKey] ?? r[norm(`refname${i}`)]
    const vcontent = r[contentKey] ?? r[norm(`refcontent${i}`)]
    if ((vname && String(vname).trim()!=='') || (vcontent && String(vcontent).trim()!=='')) {
      rawRefs.push({ name: vname||'', content: vcontent||'' })
    }
  }
  // fallback: any key that looks like ref
  Object.keys(r).forEach(k => {
    if (k.includes('ref') || k.includes('참조')){
      const v = r[k]
      if (v !== undefined && v !== null && String(v).trim()!=='') {
        rawRefs.push({ name: '', content: String(v) })
      }
    }
  })

  // dedupe references
  const references = []
  rawRefs.forEach(rr => {
    const name = String(rr.name || '').trim()
    const content = String(rr.content || '').trim()
    if (!name && !content) return

    let merged = false
    for (const ex of references) {
      if (ex.name === name && ex.content === content) { merged = true; break }

      if (name && ex.content === name) {
        ex.name = name
        if (content && content !== ex.content) ex.content = content
        merged = true
        break
      }

      if (content && ex.name === content) {
        if (!ex.content && content) ex.content = content
        if (name && !ex.name) ex.name = name
        merged = true
        break
      }

      if (ex.name === name) {
        if (!ex.content && content) ex.content = content
        merged = true
        break
      }

      if (ex.content === content) {
        if (!ex.name && name) ex.name = name
        merged = true
        break
      }
    }

    if (!merged) references.push({ name, content })
  })

  // dedupe contents
  const seenContent = new Set()
  const uniqContents = []
  contents.forEach(c => { if (!seenContent.has(c)) { seenContent.add(c); uniqContents.push(c) } })

  // skip rows that have an item number but no item name (these are likely non-content rows)
  const itemNameTrim = String(itemName || '').trim()
  if (itemNameTrim) {
    section.items.push({ itemNo: itemNo || '', itemName: itemNameTrim, contents: uniqContents, references })
  }
})

// convert maps to arrays preserving insertion order
for (const [cKey, cVal] of chapterMap.entries()){
  const sections = []
  for (const [sKey, sVal] of cVal.sections.entries()){
    sections.push({ sectionNo: sVal.sectionNo, sectionName: sVal.sectionName, items: sVal.items })
  }
  book.chapters.push({ chapterNo: cVal.chapterNo, chapterName: cVal.chapterName, sections })
}

// assign stable ids to items: chapterIndex-sectionIndex-itemIndex
book.chapters.forEach((ch, ci) => {
  ch.sections.forEach((sec, si) => {
    sec.items.forEach((it, ii) => {
      it.id = `${ci}-${si}-${ii}`
    })
  })
})

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(OUT_FILE, JSON.stringify(book, null, 2), 'utf8')
console.log('Wrote', OUT_FILE)
