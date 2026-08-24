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

  useEffect(() => {
    loadContestants()
    loadScoreboard()
  }, [])

  async function addContestant(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await fetch('/api/contestants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    setName('')
    await loadContestants()
    await loadScoreboard()
  }

  async function submitScore(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || score === '') return
    await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contestantId: Number(selected), judge, score: Number(score) })
    })
    setJudge('')
    setScore('')
    await loadScoreboard()
  }

  return (
    <div className="tabulation-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" />PCLU pageant management</p>
          <h1>Precision in every <span>score.</span></h1>
          <p className="hero-description">Manage contestants, collect judge scores, and follow the current rankings from one polished workspace.</p>
          <div className="hero-stats" aria-label="Current tabulation summary">
            <div className="hero-stat">
              <strong>{contestants.length}</strong>
              <span>Contestants</span>
            </div>
            <div className="hero-stat">
              <strong>{scoreboard.length}</strong>
              <span>On the board</span>
            </div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-rings" />
          <i className="bi bi-trophy-fill hero-trophy" />
        </div>
      </section>

      <div className="row g-4">
        <div className="col-lg-5">
          <section className="card panel-card mb-4">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <span className="panel-icon panel-icon--blue" aria-hidden="true"><i className="bi bi-people-fill" /></span>
                <div>
                  <h2 className="panel-title">Manage contestants</h2>
                  <p className="panel-description">Add each participant before scoring begins.</p>
                </div>
              </div>
            </div>
            <form onSubmit={addContestant} className="contestant-form">
              <div className="contestant-field">
                <label className="form-label" htmlFor="contestant-name">Contestant</label>
                <input id="contestant-name" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="Enter contestant name" />
              </div>
              <button className="btn btn-brand" type="submit"><i className="bi bi-plus-lg" /> Add contestant</button>
            </form>
          </section>

          <section className="card panel-card">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <span className="panel-icon panel-icon--orange" aria-hidden="true"><i className="bi bi-pencil-square" /></span>
                <div>
                  <h2 className="panel-title">Submit a score</h2>
                  <p className="panel-description">Record a judge&apos;s score accurately and instantly.</p>
                </div>
              </div>
            </div>
            <form onSubmit={submitScore} className="score-form">
              <label className="form-label" htmlFor="contestant-select">Contestant</label>
              <select id="contestant-select" className="form-select" value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">Select contestant</option>
                {contestants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="score-input-grid">
                <div>
                  <label className="form-label" htmlFor="judge-name">Judge <span>(optional)</span></label>
                  <input id="judge-name" className="form-control" value={judge} onChange={e => setJudge(e.target.value)} placeholder="Judge name" />
                </div>
                <div>
                  <label className="form-label" htmlFor="score-value">Score</label>
                  <input id="score-value" className="form-control" value={score} onChange={e => setScore(e.target.value)} type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>
              <button className="btn btn-submit" type="submit"><i className="bi bi-check2-circle" /> Submit score</button>
            </form>
          </section>
        </div>

        <div className="col-lg-7">
          <section className="card panel-card scoreboard-card">
            <div className="panel-heading scoreboard-heading">
              <div className="panel-heading-copy">
                <span className="panel-icon panel-icon--gold" aria-hidden="true"><i className="bi bi-trophy-fill" /></span>
                <div>
                  <h2 className="panel-title">Scoreboard</h2>
                  <p className="panel-description">Current totals based on submitted scores.</p>
                </div>
              </div>
              <span className="scoreboard-status"><i className="bi bi-bar-chart-fill" /> Score totals</span>
            </div>
            {scoreboard.length === 0 ? (
              <div className="scoreboard-empty">
                <span className="empty-icon" aria-hidden="true"><i className="bi bi-bar-chart-line-fill" /></span>
                <h3>The leaderboard is waiting</h3>
                <p>Add contestants and submit the first score to see rankings here.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table scoreboard-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 58 }}>Rank</th>
                      <th>Name</th>
                      <th className="text-end">Total</th>
                      <th className="text-end">Avg</th>
                      <th className="text-end">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboard.map((s, i) => (
                      <tr key={s.id} className={i < 3 ? `leader-row leader-row--${i + 1}` : undefined}>
                        <td><span className="rank-chip">{i + 1}</span></td>
                        <td><strong className="contestant-name">{s.name}</strong></td>
                        <td className="text-end"><span className="score-value">{s.total.toFixed(2)}</span></td>
                        <td className="text-end">{s.avg.toFixed(2)}</td>
                        <td className="text-end">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
