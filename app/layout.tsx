import './globals.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

export const metadata = {
  title: 'PCLU Tabulation',
  description: 'Tabulation system'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="mb-4">
          <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
              <a className="navbar-brand d-flex align-items-baseline" href="#">
                <span className="fs-5 fw-bold">PCLU Tabulation</span>
                <small className="text-muted ms-2">Pageant Scoreboard</small>
              </a>
            </div>
          </nav>
        </header>

        <main className="container">{children}</main>

        <footer className="text-center text-muted py-4">
          © {new Date().getFullYear()} PCLU Tabulation
        </footer>
      </body>
    </html>
  )
}
