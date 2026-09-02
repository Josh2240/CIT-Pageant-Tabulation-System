import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getPool } from '../../../lib/db'

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  if (body.password.length < 4) {
    return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    const hashed = await bcrypt.hash(body.password, 10)

    try {
      const result = await pool.run(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [body.username, hashed]
      )
      return NextResponse.json({ message: 'User created', id: result.insertId, username: body.username })
    } catch (insertErr) {
      // username already exists (UNIQUE constraint)
      const msg = insertErr && typeof insertErr === 'object' && 'message' in insertErr ? (insertErr as { message: string }).message : String(insertErr)
      if (msg.includes('UNIQUE') || msg.includes('duplicate') || msg.includes('constraint')) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
      }
      throw insertErr
    }
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
