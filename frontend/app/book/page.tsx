import fs from 'fs'
import path from 'path'
import Link from 'next/link'

export default function BookPage() {
  const dataPath = path.resolve(process.cwd(), '..', 'data', 'books.json')
  let book = { title: 'No data', chapters: [] as any[] }
  try {
    const raw = fs.readFileSync(dataPath, 'utf8')
    book = JSON.parse(raw)
  } catch (e) {
    // ignore - show fallback
  }

  // only include chapters/sections that actually contain items
  const visibleChapters = (book.chapters || []).filter((ch: any) =>
    Array.isArray(ch.sections) && ch.sections.some((s: any) => Array.isArray(s.items) && s.items.length > 0)
  )

  return (
    <div>
      <h2>{book.title || 'Book Tree'}</h2>
      {visibleChapters && visibleChapters.length ? (
        <div>
          {visibleChapters.map((ch: any, ci: number) => (
            <section key={ci} style={{ marginBottom: 16 }}>
              <h3>{ch.chapterName || `Chapter ${ci + 1}`}</h3>
              <ul>
                {ch.sections?.filter((s: any) => Array.isArray(s.items) && s.items.length > 0).map((sec: any, si: number) => (
                  <li key={si}>
                    <strong>{sec.sectionName || `Section ${si + 1}`}</strong>
                    <ul>
                      {sec.items?.map((it: any, ii: number) => (
                        <li key={ii}>
                          <Link href={`/item/${it.id}`}>{`${it.itemNo || (ii + 1)}. ${it.itemName || `Item ${ii + 1}`}`}</Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p>No book data found. Run the converter to generate `data/books.json`.</p>
      )}
    </div>
  )
}
