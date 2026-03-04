import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const dataPath = path.resolve(process.cwd(), '..', 'data', 'books.json')
    const raw = fs.readFileSync(dataPath, 'utf8')
    const book = JSON.parse(raw)
    for (let ci = 0; ci < (book.chapters || []).length; ci++) {
      const ch = book.chapters[ci]
      for (let si = 0; si < (ch.sections || []).length; si++) {
        const sec = ch.sections[si]
        if (sec.items && sec.items.length) {
          return new Response(JSON.stringify({ firstId: sec.items[0].id }), { status: 200 })
        }
      }
    }
    return new Response(JSON.stringify({ firstId: null }), { status: 200 })
  } catch (e) {
    return new Response(JSON.stringify({ firstId: null }), { status: 500 })
  }
}
