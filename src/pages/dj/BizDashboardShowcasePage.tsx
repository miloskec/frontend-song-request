import '@/styles/biz-dashboard-showcase.css';

const requests = [
  { id: 'r1', guest: 'Tenley Gorman', song: 'Drunk in Love (feat. Jay-Z)', artist: 'Beyoncé, JAY-Z' },
  { id: 'r2', guest: 'Tenley Gorman', song: "Jessie's Girl", artist: 'Rick Springfield' },
  { id: 'r3', guest: 'Tenley Gorman', song: 'Fight for LSU', artist: 'LSU Tiger Marching Band' },
];

const queue = [
  { id: 'q1', song: 'Brown Eyed Girl', artist: 'Van Morrison', duration: '3:03' },
  { id: 'q2', song: 'Waking Up In Vegas', artist: 'Katy Perry', duration: '3:19' },
  { id: 'q3', song: 'California - Demo', artist: 'Phantom Planet', duration: '3:14' },
];

const picks = [
  { id: 's1', song: 'Everyday People', artist: 'Pork & Fitch', status: 'Queue' },
  { id: 's2', song: 'Outta My Mind', artist: 'Møthiv', status: 'Queue' },
  { id: 's3', song: 'There But For The Grace', artist: 'Fire Island', status: 'Queue' },
];

export function BizDashboardShowcasePage() {
  return (
    <section className="biz-shell">
      <header className="biz-top">
        <div>
          <span className="biz-logo">PlayMe</span>
          <span className="biz-meta"> Biz Dashboard</span>
        </div>
        <button type="button" className="biz-pill">
          DJ Mode
        </button>
      </header>

      <div className="biz-frame">
        <aside className="biz-col">
          <h2>Current playlist</h2>
          <div className="biz-mini">
            <strong>Thursday Night Happy Hour</strong>
            <span className="biz-meta">(Click to change)</span>
          </div>

          <h2>Now playing</h2>
          <ul className="biz-list">
            <li className="biz-item">
              <div>
                <strong>Shake It</strong>
                <span>Metro Station · 2:59</span>
              </div>
            </li>
          </ul>

          <h2 style={{ marginTop: '0.75rem' }}>Next up</h2>
          <ul className="biz-queue">
            {queue.map((item) => (
              <li key={item.id} className="biz-item">
                <div>
                  <strong>{item.song}</strong>
                  <span>
                    {item.artist} · {item.duration}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <main className="biz-col">
          <h2>Requests</h2>
          <ul className="biz-requests">
            {requests.map((request) => (
              <li key={request.id} className="biz-request">
                <div className="biz-request-header">
                  <div>
                    <strong>{request.song}</strong>
                    <small>
                      {request.artist} · by {request.guest}
                    </small>
                  </div>
                  <div className="biz-request-actions">
                    <button type="button" className="biz-icon-btn reject" aria-label="Reject request">
                      ✕
                    </button>
                    <button type="button" className="biz-icon-btn accept" aria-label="Accept request">
                      ✓
                    </button>
                  </div>
                </div>
                <small>✨ Vibe check: Tap to see why</small>
              </li>
            ))}
          </ul>

          <footer className="biz-footer" style={{ marginTop: '0.7rem' }}>
            <button type="button">Explicit</button>
            <button type="button">Manually accept</button>
            <button type="button">Take requests</button>
          </footer>
        </main>

        <aside className="biz-col">
          <h2>By You ✨</h2>
          <div className="biz-compose">
            <input type="text" value="80's nostalgia pool" readOnly />
            <button type="button" className="biz-generate">
              Generate
            </button>
          </div>

          <ul className="biz-list">
            {picks.map((pick) => (
              <li key={pick.id} className="biz-item">
                <div>
                  <strong>{pick.song}</strong>
                  <span>{pick.artist}</span>
                </div>
                <span className="biz-queue-badge">{pick.status}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
