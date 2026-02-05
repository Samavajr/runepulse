import './globals.css';
import LogoMark from '@/components/LogoMark';

export const metadata = {
  title: 'RunePulse',
  description: 'RuneLite-powered XP analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="page">
          <nav className="nav">
            <div className="nav-inner container">
              <a className="brand" href="/">
                <span className="brand-mark"><LogoMark size={22} /></span>
                <div>
                  <div className="brand-title">RunePulse</div>
                  <div className="brand-tag">Live XP & KC analytics</div>
                </div>
              </a>
              <form action="/profile" method="get" className="nav-search">
                <input
                  className="input"
                  name="username"
                  placeholder="Search username"
                  autoComplete="off"
                />
                <button className="button" type="submit">
                  Search
                </button>
              </form>
              <a className="button" href="/compare">Compare</a>
            </div>
          </nav>
          {children}
        </div>
      </body>
    </html>
  )
}
