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
        <div className="container py-4">{children}</div>
      </body>
    </html>
  )
}
