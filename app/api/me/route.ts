import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: number
  username: string
  role: string
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false })
    }

    try {
      const decoded = jwt.decode(token) as JwtPayload | null
      if (!decoded || !decoded.userId || !decoded.username) {
        return NextResponse.json({ authenticated: false })
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: decoded.userId,
          username: decoded.username,
          role: decoded.role || 'judge'
        }
      })
    } catch {
      return NextResponse.json({ authenticated: false })
    }
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}
