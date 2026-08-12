"use client"

import { useEffect, useState } from 'react'

type Contestant = { id: number; name: string }
type ScoreRow = { id: number; name: string; total: number; avg: number; count: number }

export default function Page() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [scoreboard, setScoreboard] = useState<ScoreRow[]>([])
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string | number>('')
  const [judge, setJudge] = useState('')
  const [score, setScore] = useState('')

  async function loadContestants() {
    const res = await fetch('/api/contestants')
    setContestants(await res.json())
  }
  async function loadScoreboard() {
    const res = await fetch('/api/scoreboard')
    setScoreboard(await res.json())
  }

  useEffect(() => { loadContestants(); loadScoreboard() }, [])

  async function addContestant(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch('/api/contestants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
    setName('')
    await loadContestants();
    await loadScoreboard();
  }

  async function submitScore(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || score === '') return
    await fetch('/api/scores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contestantId: Number(selected), judge, score: Number(score) }) })
    setJudge(''); setScore('')
    await loadScoreboard()
  }

  return (
    <div>
      <h1 className="mb-4">PCLU Tabulation</h1>
      <div className="row">
        <div className="col-md-5">
          <div className="card mb-3 p-3">
            <h5>Manage Contestants</h5>
            <form onSubmit={addContestant} className="d-flex gap-2">
              <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Contestant name" />
              <button className="btn btn-primary" type="submit">Add</button>
            </form>
          </div>

          <div className="card p-3">
            <h5>Submit Score</h5>
            <form onSubmit={submitScore} className="d-flex flex-column gap-2">
              <select className="form-select" value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">Select contestant</option>
                {contestants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="form-control" value={judge} onChange={e => setJudge(e.target.value)} placeholder="Judge name (optional)" />
              <input className="form-control" value={score} onChange={e => setScore(e.target.value)} type="number" step="0.01" placeholder="Score" />
              <button className="btn btn-success">Submit Score</button>
            </form>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card p-3">
            <h5>Scoreboard</h5>
            <div>
              {scoreboard.length === 0 && <div>No contestants yet.</div>}
              {scoreboard.map(s => (
                <div key={s.id} className="score-row">
                  <strong>{s.name}</strong>
                  <div>Total: {s.total.toFixed(2)} — avg: {s.avg.toFixed(2)} ({s.count})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
