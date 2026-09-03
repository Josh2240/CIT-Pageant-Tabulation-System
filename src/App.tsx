"use client"

import { useEffect, useState } from 'react'

type Contestant = { id: number; name: string }
type ScoreRow = { id: number; name: string; total: number; avg: number; count: number; criteriaScores: Record<number, number> }
type ScoreEntry = { id: number; contestantId: number; judge: string; score: number; createdAt: string }
type Criteria = { id: number; name: string; description: string | null; percentage: number; maxScore: number }

export default function App() {
  const [contestants, setContestants] = useState<Contestant[]>([])
  const [scoreboard, setScoreboard] = useState<ScoreRow[]>([])
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string | number>('')
  const [judge, setJudge] = useState('')
  const [score, setScore] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [criteriaName, setCriteriaName] = useState('')
  const [criteriaDesc, setCriteriaDesc] = useState('')
  const [criteriaPercentage, setCriteriaPercentage] = useState('0')
  const [criteriaMax, setCriteriaMax] = useState('10')
  const [editingCriteriaId, setEditingCriteriaId] = useState<number | null>(null)
  const [criteriaScores, setCriteriaScores] = useState<Record<number, string>>({})

  async function loadContestants() {
    try {
      const res = await fetch('/api/contestants')
      if (!res.ok) throw new Error('Failed to load contestants')
      setContestants(await res.json())
    } catch (err) {
      console.error('Error loading contestants:', err)
    }
  }

  async function loadScoreboard() {
    try {
      const res = await fetch('/api/scoreboard')
      if (!res.ok) throw new Error('Failed to load scoreboard')
      setScoreboard(await res.json())
    } catch (err) {
      console.error('Error loading scoreboard:', err)
    }
  }

  async function loadScores() {
    try {
      const res = await fetch('/api/scores')
      if (!res.ok) throw new Error('Failed to load scores')
      setScores(await res.json())
    } catch (err) {
      console.error('Error loading scores:', err)
    }
  }

  async function loadCriteria() {
    try {
      const res = await fetch('/api/criteria')
      if (!res.ok) throw new Error('Failed to load criteria')
      setCriteria(await res.json())
    } catch (err) {
      console.error('Error loading criteria:', err)
    }
  }

  useEffect(() => {
    loadContestants()
    loadScoreboard()
    loadScores()
    loadCriteria()
  }, [])

  async function addContestant(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const res = await fetch('/api/contestants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error('Failed to add contestant')
      setName('')
      await loadContestants()
      await loadScoreboard()
    } catch (err) {
      console.error('Error adding contestant:', err)
    }
  }

  async function updateContestant(id: number) {
    if (!editName.trim()) return
    try {
      const res = await fetch(`/api/contestants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })
      if (!res.ok) throw new Error('Failed to update contestant')
      setEditingId(null)
      await loadContestants()
      await loadScoreboard()
    } catch (err) {
      console.error('Error updating contestant:', err)
    }
  }

  async function deleteContestant(id: number) {
    if (!confirm('Delete this contestant and all their scores?')) return
    try {
      const res = await fetch(`/api/contestants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete contestant')
      await loadContestants()
      await loadScoreboard()
      await loadScores()
    } catch (err) {
      console.error('Error deleting contestant:', err)
    }
  }

  async function deleteScore(id: number) {
    if (!confirm('Delete this score?')) return
    try {
      const res = await fetch(`/api/scores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete score')
      await loadScoreboard()
      await loadScores()
    } catch (err) {
      console.error('Error deleting score:', err)
    }
  }

  async function submitScore(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || score === '') return
    const numericScore = Number(score)
    if (Number.isNaN(numericScore)) return

    const criteriaScoreList = criteria.map(c => ({
      criteriaId: c.id,
      score: Number(criteriaScores[c.id]) || 0
    }))

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contestantId: Number(selected),
          judge,
          score: numericScore,
          criteriaScores: criteriaScoreList
        })
      })
      if (!res.ok) throw new Error('Failed to submit score')
      setJudge('')
      setScore('')
      setCriteriaScores({})
      await loadScoreboard()
      await loadScores()
    } catch (err) {
      console.error('Error submitting score:', err)
    }
  }

  async function saveCriteria(e: React.FormEvent) {
    e.preventDefault()
    if (!criteriaName.trim()) return
    try {
      const res = await fetch('/api/criteria', {
        method: editingCriteriaId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCriteriaId,
          name: criteriaName,
          description: criteriaDesc,
          percentage: Number(criteriaPercentage),
          maxScore: Number(criteriaMax)
        })
      })
      if (!res.ok) throw new Error('Failed to save criteria')
      setCriteriaName('')
      setCriteriaDesc('')
      setCriteriaPercentage('0')
      setCriteriaMax('10')
      setEditingCriteriaId(null)
      await loadCriteria()
    } catch (err) {
      console.error('Error saving criteria:', err)
    }
  }

  async function deleteCriteria(id: number) {
    if (!confirm('Delete this criterion?')) return
    try {
      const res = await fetch('/api/criteria', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!res.ok) throw new Error('Failed to delete criteria')
      await loadCriteria()
    } catch (err) {
      console.error('Error deleting criteria:', err)
    }
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

          <section className="card panel-card mb-4">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <span className="panel-icon panel-icon--purple" aria-hidden="true"><i className="bi bi-sliders" /></span>
                <div>
                  <h2 className="panel-title">Judging Criteria</h2>
                  <p className="panel-description">Define categories and percentages for scoring.</p>
                </div>
              </div>
            </div>

            <form onSubmit={saveCriteria} className="criteria-form">
              <div className="row g-2 mb-3">
                <div className="col-12">
                  <label className="form-label">Criterion</label>
                  <input className="form-control form-control-sm" value={criteriaName} onChange={e => setCriteriaName(e.target.value)} placeholder="e.g. Creativity" required />
                </div>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label">Percentage (%)</label>
                  <input className="form-control form-control-sm" type="number" step="1" min="0" max="100" value={criteriaPercentage} onChange={e => setCriteriaPercentage(e.target.value)} placeholder="e.g. 20" />
                </div>
                <div className="col-6">
                  <label className="form-label">Max Score</label>
                  <input className="form-control form-control-sm" type="number" value={criteriaMax} onChange={e => setCriteriaMax(e.target.value)} placeholder="10" />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-brand" type="submit">
                  <i className="bi bi-plus-lg" /> {editingCriteriaId ? 'Update' : 'Add'} Criterion
                </button>
                {editingCriteriaId && (
                  <button type="button" className="btn btn-sm btn-secondary" onClick={() => { setEditingCriteriaId(null); setCriteriaName(''); setCriteriaDesc(''); setCriteriaPercentage('0'); setCriteriaMax('10') }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            {criteria.length > 0 && (
              <div className="table-responsive mt-3">
                <table className="table criteria-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Criterion</th>
                      <th style={{ width: 120 }}>Percentage</th>
                      <th style={{ width: 100 }}>Max Score</th>
                      <th style={{ width: 90 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {criteria.map((c, idx) => (
                      <tr key={c.id}>
                        <td className="text-center"><span className="criteria-index">{idx + 1}</span></td>
                        <td>
                          <strong>{c.name}</strong>
                          {c.description && <div className="text-muted small">{c.description}</div>}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: 8 }}>
                              <div className="progress-bar" role="progressbar" style={{ width: `${Math.min(c.percentage, 100)}%` }} aria-valuenow={c.percentage} aria-valuemin={0} aria-valuemax={100} />
                            </div>
                            <span className="badge bg-primary rounded-pill">{c.percentage}%</span>
                          </div>
                        </td>
                        <td className="text-center">{c.maxScore}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingCriteriaId(c.id); setCriteriaName(c.name); setCriteriaDesc(c.description || ''); setCriteriaPercentage(String(c.percentage)); setCriteriaMax(String(c.maxScore)) }}>
                              <i className="bi bi-pencil" />
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCriteria(c.id)}>
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-active">
                      <td colSpan={2} className="fw-bold">Total</td>
                      <td className="fw-bold text-center">{criteria.reduce((sum, c) => sum + c.percentage, 0)}%</td>
                      <td className="fw-bold text-center">{criteria.reduce((sum, c) => sum + c.maxScore, 0)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
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
                  <label className="form-label" htmlFor="score-value">Total Score</label>
                  <input id="score-value" className="form-control" value={score} onChange={e => setScore(e.target.value)} type="number" step="0.01" placeholder="0.00" />
                </div>
              </div>

              {criteria.length > 0 && (
                <div className="criteria-scores mt-3">
                  <label className="form-label fw-bold">Criteria Scores</label>
                  {criteria.map(c => (
                    <div key={c.id} className="row g-2 mb-2 align-items-center">
                      <div className="col-6">
                        <label className="form-label mb-0 small">{c.name} {c.description && <span className="text-muted">({c.description})</span>}</label>
                      </div>
                      <div className="col-4">
                        <input
                          className="form-control form-control-sm"
                          type="number"
                          step="0.01"
                          min="0"
                          max={c.maxScore}
                          value={criteriaScores[c.id] || ''}
                          onChange={e => setCriteriaScores(prev => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder={`0 / ${c.maxScore}`}
                        />
                      </div>
                      <div className="col-2 text-end text-muted small">
                        {c.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                      {criteria.map(c => (
                        <th key={c.id} className="text-end" title={c.description || c.name}>{c.name} ({c.percentage}%)</th>
                      ))}
                      <th className="text-end">Total</th>
                      <th className="text-end">Avg</th>
                      <th className="text-end">Count</th>
                      <th style={{ width: 110 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreboard.map((s, i) => (
                      <tr key={s.id} className={i < 3 ? `leader-row leader-row--${i + 1}` : undefined}>
                        <td><span className="rank-chip">{i + 1}</span></td>
                        <td>
                          {editingId === s.id ? (
                            <div className="d-flex gap-2">
                              <input
                                className="form-control form-control-sm"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                autoFocus
                              />
                              <button className="btn btn-sm btn-success" onClick={() => updateContestant(s.id)}>
                                <i className="bi bi-check" />
                              </button>
                              <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>
                                <i className="bi bi-x" />
                              </button>
                            </div>
                          ) : (
                            <div className="d-flex align-items-center gap-2">
                              <strong className="contestant-name">{s.name}</strong>
                              <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditingId(s.id); setEditName(s.name) }} aria-label="Edit name">
                                <i className="bi bi-pencil" />
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteContestant(s.id)} aria-label="Delete contestant">
                                <i className="bi bi-trash" />
                              </button>
                            </div>
                          )}
                        </td>
                        {criteria.map(c => (
                          <td key={c.id} className="text-end">
                            {s.criteriaScores[c.id] ? (s.criteriaScores[c.id] as number).toFixed(2) : '-'}
                          </td>
                        ))}
                        <td className="text-end"><span className="score-value">{s.total.toFixed(2)}</span></td>
                        <td className="text-end">{s.avg.toFixed(2)}</td>
                        <td className="text-end">{s.count}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteScore(s.id)} aria-label="Delete all scores">
                            <i className="bi bi-trash" /> Scores
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card panel-card mt-4">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <span className="panel-icon panel-icon--orange" aria-hidden="true"><i className="bi bi-list-ul" /></span>
                <div>
                  <h2 className="panel-title">All Scores</h2>
                  <p className="panel-description">Individual score entries. Delete mistakes here.</p>
                </div>
              </div>
            </div>
            {scores.length === 0 ? (
              <p className="text-muted mb-0">No scores submitted yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Contestant</th>
                      <th>Judge</th>
                      <th className="text-end">Score</th>
                      <th className="text-end">Date</th>
                      <th style={{ width: 80 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map(sc => {
                      const contestant = contestants.find(c => c.id === sc.contestantId)
                      return (
                        <tr key={sc.id}>
                          <td>{contestant?.name ?? `#${sc.contestantId}`}</td>
                          <td>{sc.judge}</td>
                          <td className="text-end">{sc.score.toFixed(2)}</td>
                          <td className="text-end">{new Date(sc.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteScore(sc.id)} aria-label="Delete score">
                              <i className="bi bi-trash" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
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
