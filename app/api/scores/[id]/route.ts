import { NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const pool = await getPool()
    await pool.run('DELETE FROM scores WHERE id = ?', [Number(id)])
    return NextResponse.json({ message: 'Score deleted' })
  } catch (err) {
    console.error('Delete score error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
