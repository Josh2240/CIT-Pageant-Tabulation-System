import * as mysql from 'mysql2/promise'
import * as path from 'node:path'

interface Pool {
  query: <T = any>(sql: string, params?: any[]) => Promise<[T[], null]>
  run: (sql: string, params?: any[]) => Promise<{ insertId?: number; affectedRows?: number }>
}

let pool: Pool | null = null

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return (err as { message: string }).message
  }
  return String(err)
}

export async function getPool(): Promise<Pool> {
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

      await p.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`)

      pool = p as unknown as Pool
      return pool
    } catch (err) {
      console.warn('MySQL connection failed, falling back to SQLite:', getErrorMessage(err))
    }
  }

  // Fallback to SQLite
  const sqlite3 = (await import('sqlite3')).verbose()
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

  function runAsync(sql: string, params: any[] = []) {
    return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
      db.run(sql, params, function (err: Error | null) {
        if (err) return reject(err)
        resolve({ lastID: this.lastID, changes: this.changes })
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
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err: Error | null) => { if (err) reject(err) }
      )
      resolve()
    })
  })

  // Adapter exposing query similar to mysql2 pool
  pool = {
    query: async <T = any>(sql: string, params: any[] = []): Promise<[T[], null]> => {
      const rows = await allAsync(sql, params)
      return [rows as T[], null]
    },
    run: async (sql: string, params: any[] = []): Promise<{ insertId?: number; affectedRows?: number }> => {
      const result = await runAsync(sql, params)
      return { insertId: result.lastID, affectedRows: result.changes }
    }
  }

  return pool
}
