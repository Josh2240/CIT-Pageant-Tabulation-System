import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

interface Contestant {
  id: number
  name: string
}

interface Score {
  score: number
}

interface ScoreboardRow {
  id: number
  name: string
  total: number
  avg: number
  count: number
}

export async function GET() {
  const pool = await getPool()
  const [contestants] = await pool.query<Contestant>('SELECT id, name FROM contestants')
  const totals: ScoreboardRow[] = []
  for (const c of contestants) {
    const [scs] = await pool.query<Score>('SELECT score FROM scores WHERE contestantId = ?', [c.id])
    const total = scs.reduce((acc, s) => acc + s.score, 0)
    const count = scs.length
    const avg = count ? total / count : 0
    totals.push({ id: c.id, name: c.name, total, avg, count })
  }
  totals.sort((a, b) => b.total - a.total)
  return NextResponse.json(totals)
}
