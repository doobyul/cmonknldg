import fs from 'fs'
import path from 'path'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || ''
    const dataPath = path.resolve(process.cwd(), '..', 'data', 'books.json')
    const raw = fs.readFileSync(dataPath, 'utf8')
    const book = JSON.parse(raw)

    for (let ci = 0; ci < (book.chapters || []).length; ci++) {
      const ch = book.chapters[ci]
      for (let si = 0; si < (ch.sections || []).length; si++) {
        const sec = ch.sections[si]
        for (let ii = 0; ii < (sec.items || []).length; ii++) {
          const it = sec.items[ii]
          if (it.id === id) {
            // prev in same section
            if (ii - 1 >= 0) return new Response(JSON.stringify({ prevId: `${ci}-${si}-${ii-1}` }), { status: 200 })
            // prev section last item
            if (si - 1 >= 0) {
              const prevSec = ch.sections[si-1]
              if (prevSec.items && prevSec.items.length) return new Response(JSON.stringify({ prevId: `${ci}-${si-1}-${prevSec.items.length - 1}` }), { status: 200 })
            }
            // prev chapter last section's last item
            if (ci - 1 >= 0) {
              const prevCh = book.chapters[ci-1]
              if (prevCh.sections && prevCh.sections.length) {
                const lastSecIdx = prevCh.sections.length - 1
                const lastSec = prevCh.sections[lastSecIdx]
                if (lastSec.items && lastSec.items.length) return new Response(JSON.stringify({ prevId: `${ci-1}-${lastSecIdx}-${lastSec.items.length - 1}` }), { status: 200 })
              }
            }
            return new Response(JSON.stringify({ prevId: null }), { status: 200 })
          }
        }
      }
    }

    return new Response(JSON.stringify({ prevId: null }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ prevId: null }), { status: 500 })
  }
}
