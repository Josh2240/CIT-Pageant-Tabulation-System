'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <button
      type="button"
      className="btn btn-outline-light btn-sm"
      onClick={handleLogout}
      aria-label="Logout"
    >
      <i className="bi bi-box-arrow-right" /> Sign out
    </button>
  )
}
