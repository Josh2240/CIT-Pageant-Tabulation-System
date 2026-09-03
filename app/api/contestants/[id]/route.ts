import { NextResponse } from 'next/server'
import { getPool } from '../../../../lib/db'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (!body.name || !body.name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  try {
    const pool = await getPool()
    await pool.run('UPDATE contestants SET name = ? WHERE id = ?', [body.name.trim(), Number(id)])
    return NextResponse.json({ id: Number(id), name: body.name.trim() })
  } catch (err) {
    console.error('Update contestant error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const pool = await getPool()
    await pool.run('DELETE FROM scores WHERE contestantId = ?', [Number(id)])
    await pool.run('DELETE FROM contestants WHERE id = ?', [Number(id)])
    return NextResponse.json({ message: 'Contestant deleted' })
  } catch (err) {
    console.error('Delete contestant error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
