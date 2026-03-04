import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || ''
    // process.cwd() in Next's dev server is the `frontend` folder, so go up one level to project root
    const dataPath = path.resolve(process.cwd(), '..', 'data', 'books.json')
    const raw = fs.readFileSync(dataPath, 'utf8')
    const book = JSON.parse(raw)

    // find current indices
    for (let ci = 0; ci < (book.chapters || []).length; ci++) {
      const ch = book.chapters[ci]
      for (let si = 0; si < (ch.sections || []).length; si++) {
        const sec = ch.sections[si]
        for (let ii = 0; ii < (sec.items || []).length; ii++) {
          const it = sec.items[ii]
          if (it.id === id) {
            // try next in same section
            if (ii + 1 < sec.items.length) return new Response(JSON.stringify({ nextId: `${ci}-${si}-${ii+1}` }), { status: 200 })
            // next section
            if (si + 1 < ch.sections.length) {
              const nextSec = ch.sections[si+1]
              if (nextSec.items && nextSec.items.length) return new Response(JSON.stringify({ nextId: `${ci}-${si+1}-0` }), { status: 200 })
            }
            // next chapter
            if (ci + 1 < book.chapters.length) {
              const nextCh = book.chapters[ci+1]
              if (nextCh.sections && nextCh.sections.length) {
                const nextSec = nextCh.sections[0]
                if (nextSec.items && nextSec.items.length) return new Response(JSON.stringify({ nextId: `${ci+1}-0-0` }), { status: 200 })
              }
            }
            return new Response(JSON.stringify({ nextId: null }), { status: 200 })
          }
        }
      }
    }

    return new Response(JSON.stringify({ nextId: null }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ nextId: null }), { status: 500 })
  }
}
