import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

export async function GET() {
  const pool = await getPool()
  const [rows] = await pool.query('SELECT id, contestantId, judge, score, createdAt FROM scores ORDER BY createdAt DESC')
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.contestantId || body.score === undefined) {
    return NextResponse.json({ error: 'contestantId and score required' }, { status: 400 })
  }

  try {
    const pool = await getPool()

    // Insert main score
    const [res] = await pool.query('INSERT INTO scores (contestantId, judge, score) VALUES (?, ?, ?)', [
      Number(body.contestantId),
      body.judge || 'unknown',
      Number(body.score)
    ])

    const insertId = typeof res === 'object' && res !== null && 'insertId' in res ? (res as { insertId: number }).insertId : undefined

    // Insert criteria scores if provided
    if (body.criteriaScores && Array.isArray(body.criteriaScores)) {
      for (const cs of body.criteriaScores) {
        if (cs.criteriaId && cs.score !== undefined) {
          await pool.run('INSERT INTO score_details (scoreId, criteriaId, score) VALUES (?, ?, ?)', [
            Number(insertId),
            Number(cs.criteriaId),
            Number(cs.score)
          ])
        }
      }
    }

    return NextResponse.json({ id: insertId, contestantId: Number(body.contestantId), judge: body.judge || 'unknown', score: Number(body.score) })
  } catch (err) {
    console.error('Create score error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
