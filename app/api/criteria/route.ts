import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

interface CriteriaRow {
  id: number
  name: string
  description: string | null
  weight: number
  maxScore: number
}

export async function GET() {
  const pool = await getPool()
  const [rows] = await pool.query<CriteriaRow>('SELECT id, name, description, weight, maxScore FROM criteria ORDER BY id')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Criteria name is required' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    const weight = Number(body.weight) || 1.0
    const maxScore = Number(body.maxScore) || 10.0

    const result = await pool.run('INSERT INTO criteria (name, description, weight, maxScore) VALUES (?, ?, ?, ?)', [
      body.name.trim(),
      body.description || null,
      weight,
      maxScore
    ])

    return NextResponse.json({ id: result.insertId, name: body.name.trim(), description: body.description || null, weight, maxScore })
  } catch (err) {
    console.error('Create criteria error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const body = await req.json()
  if (!body.id || !body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'Criteria id and name are required' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    const weight = Number(body.weight) || 1.0
    const maxScore = Number(body.maxScore) || 10.0

    await pool.run('UPDATE criteria SET name = ?, description = ?, weight = ?, maxScore = ? WHERE id = ?', [
      body.name.trim(),
      body.description || null,
      weight,
      maxScore,
      Number(body.id)
    ])

    return NextResponse.json({ id: Number(body.id), name: body.name.trim(), description: body.description || null, weight, maxScore })
  } catch (err) {
    console.error('Update criteria error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const body = await req.json()
  if (!body.id) {
    return NextResponse.json({ error: 'Criteria id is required' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    await pool.run('DELETE FROM criteria WHERE id = ?', [Number(body.id)])
    return NextResponse.json({ message: 'Criteria deleted' })
  } catch (err) {
    console.error('Delete criteria error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
