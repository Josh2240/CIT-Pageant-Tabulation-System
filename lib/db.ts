import mysql from 'mysql2/promise'
import path from 'path'

let pool: any = null

export async function getPool() {
  if (pool) return pool

  const mysqlHost = process.env.MYSQL_HOST
  const mysqlUser = process.env.MYSQL_USER

  // Try MySQL when environment variables are provided
  if (mysqlHost && mysqlUser) {
    try {
      const p = mysql.createPool({
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'pclu_tabulation',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      })

      // test connection
      await p.query('SELECT 1')

      // ensure tables
      await p.query(`CREATE TABLE IF NOT EXISTS contestants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )`)

      await p.query(`CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        contestantId INT,
        judge VARCHAR(255),
        score DOUBLE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contestantId) REFERENCES contestants(id)
      )`)

      pool = p
      return pool
    } catch (err: any) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as any).message : String(err)
      console.warn('MySQL connection failed, falling back to SQLite:', msg)
    }
  }

  // Fallback to SQLite
  const sqlite3 = require('sqlite3').verbose()
  const dbFile = path.join(process.cwd(), 'data.sqlite')
  const db = new sqlite3.Database(dbFile)

  function allAsync(sql: string, params: any[] = []) {
    return new Promise<any[]>((resolve, reject) => {
      db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) return reject(err)
        resolve(rows)
      })
    })
  }

  // ensure tables
  await new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS contestants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )`,
        (err: Error | null) => { if (err) reject(err) }
      )
      db.run(
        `CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contestantId INTEGER,
          judge TEXT,
          score REAL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err: Error | null) => { if (err) reject(err) }
      )
      resolve()
    })
  })

  // Adapter exposing query similar to mysql2 pool
  pool = {
    query: async (sql: string, params: any[] = []) => {
      const rows = await allAsync(sql, params)
      return [rows, null]
    }
  }

  return pool
}
