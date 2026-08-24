import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  const pool = await getPool()
  const [rows] = await pool.query('SELECT id, name FROM contestants ORDER BY id')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const pool = await getPool()
  const [res] = await pool.query('INSERT INTO contestants (name) VALUES (?)', [body.name])
  const insertId = typeof res === 'object' && res !== null && 'insertId' in res ? (res as { insertId: number }).insertId : undefined
  return NextResponse.json({ id: insertId, name: body.name })
}
