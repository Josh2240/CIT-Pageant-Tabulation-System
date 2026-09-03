import { getPool } from '../lib/db'
import bcrypt from 'bcryptjs'

const JUDGE_COUNT = 7
const DEFAULT_PASSWORD = 'judge2026'
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin2026'

async function main() {
  const pool = await getPool()

  // Create judge accounts
  for (let i = 1; i <= JUDGE_COUNT; i++) {
    const username = `judge${i}`
    const password = await bcrypt.hash(DEFAULT_PASSWORD, 10)

    try {
      await pool.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, 'judge'])
      console.log(`Created judge account: ${username}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('UNIQUE') || msg.includes('duplicate') || msg.includes('constraint')) {
        console.log(`Judge account already exists: ${username}`)
      } else {
        console.error(`Error creating ${username}:`, msg)
      }
    }
  }

  // Create admin account
    const adminPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    try {
      await pool.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [ADMIN_USERNAME, adminPassword, 'admin'])
    console.log(`Created admin account: ${ADMIN_USERNAME}`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('UNIQUE') || msg.includes('duplicate') || msg.includes('constraint')) {
      console.log(`Admin account already exists: ${ADMIN_USERNAME}`)
    } else {
      console.error(`Error creating admin:`, msg)
    }
  }

  console.log('\nAccounts ready.')
  console.log(`Judges: judge1..judge${JUDGE_COUNT} (password: ${DEFAULT_PASSWORD})`)
  console.log(`Admin:  ${ADMIN_USERNAME} (password: ${ADMIN_PASSWORD})`)

  process.exit(0)
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
