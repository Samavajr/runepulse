import LogoMark from '@/components/LogoMark';

const RSS_URL = 'http://services.runescape.com/m=news/latest_news.rss?oldschool=true';

function extractTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!match) return '';
  return match[1];
}

function decodeCdata(value: string) {
  if (!value) return '';
  const trimmed = value.trim();
  const cdata = trimmed.match(/<!\[CDATA\[([\s\S]*?)\]\]>/i);
  return (cdata ? cdata[1] : trimmed).trim();
}

async function getNews() {
  try {
    const res = await fetch(RSS_URL, { cache: 'no-store' });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = [];
    const regex = /<item>([\s\S]*?)<\/item>/gi;
    let match = regex.exec(xml);
    while (match && items.length < 6) {
      const block = match[1];
      items.push({
        title: decodeCdata(extractTag(block, 'title')),
        link: decodeCdata(extractTag(block, 'link')),
        pubDate: decodeCdata(extractTag(block, 'pubDate'))
      });
      match = regex.exec(xml);
    }

    return items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const news = await getNews();

  return (
    <main className="container grid">
      <section className="hero hero-split">
        <div className="grid" style={{ gap: 16 }}>
          <div className="brand">
            <span className="brand-mark"><LogoMark size={28} /></span>
            <div>
              <div className="brand-title">RunePulse</div>
              <div className="brand-tag">Live XP & KC analytics</div>
            </div>
          </div>
          <p className="subtitle">
            Track XP gains with RuneLite accuracy. Search a username to see
            per-skill totals, historical charts, gear snapshots, and boss KC
            in one place.
          </p>
          <form action="/profile" method="get" className="search">
            <input
              className="input"
              name="username"
              placeholder="Enter a username"
              autoComplete="off"
            />
            <button className="button" type="submit">
              Search
            </button>
          </form>
        </div>
        <div className="hero-panel">
          <strong>Why it feels faster</strong>
          <div className="hero-badges">
            <div className="hero-badge">
              <span>Live XP capture</span>
              <span className="mono">2 min refresh</span>
            </div>
            <div className="hero-badge">
              <span>Gear snapshots</span>
              <span className="mono">RuneLite data</span>
            </div>
            <div className="hero-badge">
              <span>Boss KC tracker</span>
              <span className="mono">Hiscores + live</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Getting started</h2>
        <div className="grid grid-3">
          <div className="card">
            <div className="mono">Step 1</div>
            <strong>Pair your account</strong>
            <p className="subtitle">
              Open RuneLite, click Pair Now, and your account appears here automatically.
            </p>
          </div>
          <div className="card">
            <div className="mono">Step 2</div>
            <strong>Play normally</strong>
            <p className="subtitle">
              XP deltas, gear snapshots, and boss KC update on a 2 minute cycle.
            </p>
          </div>
          <div className="card">
            <div className="mono">Step 3</div>
            <strong>Share with friends</strong>
            <p className="subtitle">
              Search by username to compare gains and see how the grind stacks up.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>Data collected</h2>
        <div className="grid grid-3">
          <div className="card">
            <div className="mono">Tracked</div>
            <strong>In-game stats only</strong>
            <p className="subtitle">
              Skill XP changes, gear snapshots, boss KC, and your in-game username.
            </p>
          </div>
          <div className="card">
            <div className="mono">Not tracked</div>
            <strong>Login info</strong>
            <p className="subtitle">
              No email, password, or authentication data is accessible to the plugin.
            </p>
          </div>
          <div className="card">
            <div className="mono">Control</div>
            <strong>You choose</strong>
            <p className="subtitle">
              Toggle XP, gear, and boss KC tracking inside RuneLite settings.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <h2>OSRS news</h2>
        {news.length === 0 ? (
          <p className="mono">News feed unavailable right now.</p>
        ) : (
          <div className="news-grid">
            {news.map((item) => {
              const date = item.pubDate ? new Date(item.pubDate) : null;
              const label = date && !Number.isNaN(date.getTime())
                ? date.toLocaleDateString('en-US', {
                    timeZone: 'America/Chicago',
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                  })
                : 'Update';

              return (
                <a key={item.link} href={item.link} className="news-card" target="_blank" rel="noreferrer">
                  <div className="pill">{label}</div>
                  <div className="news-title">{item.title}</div>
                  <div className="news-meta">Read on oldschool.runescape.com</div>
                </a>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
