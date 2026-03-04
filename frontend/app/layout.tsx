import './globals.css'
import React from 'react'

export const metadata = {
  title: 'CmonKnldg',
  description: 'Study management webapp'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <main style={{ padding: 24 }}>{children}</main>
      </body>
    </html>
  )
}
