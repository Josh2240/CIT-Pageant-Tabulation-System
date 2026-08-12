import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  const pool = await getPool()
  const [contestants] = await pool.query('SELECT id, name FROM contestants')
  const totals = [] as any[]
  for (const c of (contestants as any[])) {
    const [scs] = await pool.query('SELECT score FROM scores WHERE contestantId = ?', [c.id])
    const total = (scs as any[]).reduce((acc, s) => acc + s.score, 0)
    const count = (scs as any[]).length
    const avg = count ? total / count : 0
    totals.push({ id: c.id, name: c.name, total, avg, count })
  }
  totals.sort((a, b) => b.total - a.total)
  return NextResponse.json(totals)
}
