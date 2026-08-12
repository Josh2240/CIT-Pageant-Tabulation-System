import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  const pool = await getPool()
  const [rows] = await pool.query('SELECT id, contestantId, judge, score, createdAt FROM scores ORDER BY createdAt DESC')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.contestantId || body.score === undefined) return NextResponse.json({ error: 'contestantId and score required' }, { status: 400 })
  const pool = await getPool()
  const [res] = await pool.query('INSERT INTO scores (contestantId, judge, score) VALUES (?, ?, ?)', [Number(body.contestantId), body.judge || 'unknown', Number(body.score)])
  // @ts-ignore
  const insertId = res.insertId || (res as any).insertId
  return NextResponse.json({ id: insertId, contestantId: Number(body.contestantId), judge: body.judge || 'unknown', score: Number(body.score) })
}
