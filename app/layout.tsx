import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Image from 'next/image'
import pcluLogo from '../Assets/pclu-college-logo.jpg'
import './globals.css'

export const metadata = {
  title: 'PCLU Tabulation System',
  description: 'PCLU pageant tabulation and scoreboard'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
              <div className="nav-status d-none d-md-flex" aria-label="System status">
                <span className="status-dot" aria-hidden="true" />
                Ready for scoring
              </div>
            </div>
          </nav>
        </header>

        <main className="container app-content">{children}</main>

        <footer className="site-footer">
          <span>© {new Date().getFullYear()} Polytechnic College of La Union</span>
          <span className="footer-divider" aria-hidden="true">•</span>
          <span>Tabulation System</span>
        </footer>
      </body>
    </html>
  )
}
