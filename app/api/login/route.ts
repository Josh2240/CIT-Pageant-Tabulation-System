import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getPool } from '../../../lib/db'

interface UserRow {
  id: number
  username: string
  password: string
}

export async function GET() {
  return NextResponse.json({
    message: 'Login API endpoint. Use POST with { username, password } to authenticate.',
    methods: ['POST']
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    const [users] = await pool.query<UserRow>('SELECT id, username, password FROM users WHERE username = ?', [body.username])

    if (users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const user = users[0]
    const isValid = await bcrypt.compare(body.password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '8h' }
    )

    const res = NextResponse.json({ message: 'Login successful', username: user.username })
    res.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/'
    })
    return res
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
