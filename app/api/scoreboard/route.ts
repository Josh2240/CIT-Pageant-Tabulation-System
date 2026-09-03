import { NextResponse } from 'next/server'
import { getPool } from '../../../lib/db'

interface Contestant {
  id: number
  name: string
}

interface Criteria {
  id: number
  name: string
  percentage: number
  maxScore: number
}

interface ScoreDetail {
  scoreId: number
  criteriaId: number
  score: number
}

interface ScoreboardRow {
  id: number
  name: string
  total: number
  avg: number
  count: number
  criteriaScores: Record<number, number>
}

export async function GET() {
  const pool = await getPool()

  const [contestants] = await pool.query<Contestant>('SELECT id, name FROM contestants')
  const [criteria] = await pool.query<Criteria>('SELECT id, name, percentage, maxScore FROM criteria ORDER BY id')
  const [scoreDetails] = await pool.query<ScoreDetail>('SELECT scoreId, criteriaId, score FROM score_details')

  // Group score details by scoreId
  const detailsByScore = new Map<number, ScoreDetail[]>()
  for (const sd of scoreDetails) {
    if (!detailsByScore.has(sd.scoreId)) {
      detailsByScore.set(sd.scoreId, [])
    }
    detailsByScore.get(sd.scoreId)!.push(sd)
  }

  // Group scores by contestant
  const scoresByContestant = new Map<number, { totalWeighted: number; totalRaw: number; count: number; criteriaScores: Record<number, number> }>()
  for (const c of contestants) {
    const [scores] = await pool.query<{ id: number; score: number }>('SELECT id, score FROM scores WHERE contestantId = ?', [c.id])
    let totalWeighted = 0
    let totalRaw = 0
    const criteriaScores: Record<number, number> = {}

    for (const s of scores) {
      const details = detailsByScore.get(s.id) || []
      let scoreSum = 0

      for (const d of details) {
        const crit = criteria.find(cr => cr.id === d.criteriaId)
        if (crit) {
          // Calculate percentage-based contribution: (raw_score / maxScore) * percentage
          const contribution = (d.score / crit.maxScore) * crit.percentage
          scoreSum += contribution
          criteriaScores[crit.id] = (criteriaScores[crit.id] || 0) + d.score
        }
      }

      totalWeighted += scoreSum
      totalRaw += s.score
    }

    scoresByContestant.set(c.id, {
      totalWeighted,
      totalRaw,
      count: scores.length,
      criteriaScores
    })
  }

  const totals: ScoreboardRow[] = contestants.map(c => {
    const data = scoresByContestant.get(c.id) || { totalWeighted: 0, totalRaw: 0, count: 0, criteriaScores: {} }
    return {
      id: c.id,
      name: c.name,
      total: data.totalWeighted,
      avg: data.count ? data.totalWeighted / data.count : 0,
      count: data.count,
      criteriaScores: data.criteriaScores
    }
  })

  totals.sort((a, b) => b.total - a.total)
  return NextResponse.json(totals)
}
