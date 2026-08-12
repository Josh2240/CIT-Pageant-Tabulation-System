const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

// Initialize SQLite DB
const dbFile = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS contestants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS scores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contestantId INTEGER,
      judge TEXT,
      score REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(contestantId) REFERENCES contestants(id)
    )`
  );
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

app.get('/api/contestants', async (req, res) => {
  try {
    const rows = await allAsync('SELECT id, name FROM contestants ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contestants', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const result = await runAsync('INSERT INTO contestants (name) VALUES (?)', [name]);
    res.json({ id: result.lastID, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scores', async (req, res) => {
  try {
    const rows = await allAsync('SELECT id, contestantId, judge, score, createdAt FROM scores ORDER BY createdAt DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/scores', async (req, res) => {
  try {
    const { contestantId, judge, score } = req.body;
    if (!contestantId || score === undefined) return res.status(400).json({ error: 'contestantId and score required' });
    const result = await runAsync('INSERT INTO scores (contestantId, judge, score) VALUES (?, ?, ?)', [Number(contestantId), judge || 'unknown', Number(score)]);
    res.json({ id: result.lastID, contestantId: Number(contestantId), judge: judge || 'unknown', score: Number(score) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/scoreboard', async (req, res) => {
  try {
    const contestants = await allAsync('SELECT id, name FROM contestants');
    const totals = await Promise.all(contestants.map(async c => {
      const scs = await allAsync('SELECT score FROM scores WHERE contestantId = ?', [c.id]);
      const total = scs.reduce((acc, s) => acc + s.score, 0);
      const count = scs.length;
      const avg = count ? total / count : 0;
      return { id: c.id, name: c.name, total, avg, count };
    }));
    totals.sort((a, b) => b.total - a.total);
    res.json(totals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`PCLU Tabulation backend running on port ${port}`);
});
