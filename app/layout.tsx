import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Image from 'next/image'
import pcluLogo from '../Assets/pclu-college-logo.jpg'
import './globals.css'
import LogoutButton from './components/LogoutButton'

export const metadata = {
  title: 'PCLU Tabulation System',
  description: 'PCLU pageant tabulation and scoreboard'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  console.log('[PCLU Tabulation] RootLayout rendered at:', new Date().toISOString())
  return (
    <html lang="en">
      <body className="app-shell">
        <header className="site-header">
          <nav className="navbar navbar-expand-lg site-navbar">
            <div className="container">
              <a className="navbar-brand brand-lockup" href="#" aria-label="PCLU Tabulation home">
                <span className="brand-seal">
                  <Image
                    src={pcluLogo}
                    alt="Polytechnic College of La Union seal"
                    className="brand-logo"
                    width={52}
                    height={52}
                    priority
                  />
                </span>
                <span className="brand-copy">
                  <span className="brand-title">PCLU Tabulation</span>
                  <span className="brand-subtitle">Pageant Scoreboard</span>
                </span>
              </a>
              <div className="d-none d-md-flex align-items-center gap-3">
                <div className="nav-status" aria-label="System status">
                  <span className="status-dot" aria-hidden="true" />
                  Ready for scoring
                </div>
                <LogoutButton />
              </div>
            </div>
          </nav>
        </header>

        <main className="container app-content">{children}</main>

        <footer className="site-footer">
          <div className="footer-brand">CIT-Pageant-Tabulation-System</div>
          <div className="footer-meta">
            <span>© {new Date().getFullYear()} Polytechnic College of La Union</span>
            <span className="footer-divider" aria-hidden="true">•</span>
            <span>Tabulation System</span>
          </div>
          <div className="footer-updates">UPDATES: changing from MySQL to PostgreSQL</div>
        </footer>
      </body>
    </html>
  )
}
