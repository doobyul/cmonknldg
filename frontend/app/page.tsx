import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1>CmonKnldg</h1>
      <p>Welcome — minimal frontend skeleton.</p>
      <ul>
        <li><Link href="/book">Book Tree</Link></li>
        <li><Link href="/dashboard">Dashboard (placeholder)</Link></li>
      </ul>
    </div>
  )
}
