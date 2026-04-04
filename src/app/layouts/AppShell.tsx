import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, type PropsWithChildren } from 'react';
import { useAuthStore } from '@/stores';
import { env } from '@/utils/env';

const guestNavItems = [
  {
    to: env.useMockApi ? '/guest?qr=44444444-4444-4444-8444-444444444444' : '/guest',
    label: 'Guest',
    isActive: (pathname: string) => pathname.startsWith('/guest'),
  },
  {
    to: '/login',
    label: 'DJ Login',
    isActive: (pathname: string) => pathname.startsWith('/login') || pathname.startsWith('/dj'),
  },
];

const djNavItems = [
  { to: '/dj/queue', label: 'Queue' },
  { to: '/dj/requests', label: 'Requests' },
];

const djMenuItems = [
  { to: '/dj/dashboard', label: 'Dashboard' },
  { to: '/dj/settings', label: 'Settings' },
  { to: '/dj/lists', label: 'Lists' },
];

function sectionTitle(pathname: string): string {
  if (pathname.startsWith('/dj/dashboard')) {
    return 'DJ Dashboard';
  }
  if (pathname.startsWith('/dj/requests')) {
    return 'Request Management';
  }
  if (pathname.startsWith('/dj/queue')) {
    return 'Queue Control';
  }
  if (pathname.startsWith('/dj/settings')) {
    return 'Settings';
  }
  if (pathname.startsWith('/dj/lists')) {
    return 'Lists';
  }
  if (pathname.startsWith('/login')) {
    return 'DJ Login';
  }
  if (pathname.startsWith('/guest')) {
    return 'Guest Request';
  }
  return 'DJ Dashboard';
}

export function AppShell({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuthStore();
  const isDjRoute = location.pathname.startsWith('/dj');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [draftName, setDraftName] = useState(user?.name ?? '');
  const [draftEmail, setDraftEmail] = useState(user?.email ?? '');

  if (isDjRoute) {
    return (
      <div className="app-shell app-shell__dj">
        <header className="app-shell__dj-top">
          <div className="app-shell__brand">PlayMe</div>
          <button
            type="button"
            className="ui-btn ui-btn--ghost app-shell__menu-btn"
            aria-label="Open navigation"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ≡
          </button>
          <h1 className="app-shell__section-title">{sectionTitle(location.pathname)}</h1>
          <button
            type="button"
            className="app-shell__user"
            aria-label="User menu placeholder"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className="app-shell__avatar">{(user?.name ?? 'DJ').slice(0, 2).toUpperCase()}</span>
            <span className="app-shell__user-name">{user?.name ?? 'DJ Admin'}</span>
          </button>
          {profileOpen ? (
            <section className="app-shell__profile-menu" aria-label="Profile menu">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" className="ui-field" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" className="ui-field" value={draftEmail} onChange={(event) => setDraftEmail(event.target.value)} />
              <button
                type="button"
                className="ui-btn ui-btn--primary"
                onClick={() => {
                  if (!draftName.trim() || !draftEmail.trim()) {
                    return;
                  }
                  updateProfile({ name: draftName.trim(), email: draftEmail.trim() });
                  setProfileOpen(false);
                }}
              >
                Save profile
              </button>
              <button
                type="button"
                className="ui-btn ui-btn--danger"
                onClick={() => {
                  logout();
                  navigate('/login', { replace: true });
                }}
              >
                Logout
              </button>
            </section>
          ) : null}
          {menuOpen ? (
            <nav className="app-shell__dj-menu" aria-label="DJ menu">
              {djMenuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) => `app-shell__dj-menu-link${isActive ? ' active' : ''}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
        </header>
        <nav className="app-shell__dj-nav" aria-label="DJ navigation">
          {djNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `app-shell__dj-link${isActive ? ' active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="app-shell__dj-main">{children}</main>
        {env.useMockApi ? (
          <nav className="app-shell__guest-nav app-shell__dj-bottom-nav" aria-label="Mock mode shortcuts">
            {guestNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={`app-shell__guest-link${item.isActive(location.pathname) ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </div>
    );
  }

  return (
    <div className="app-shell app-shell__guest">
      <header className="app-shell__guest-top">
        <Link to="/guest" className="app-shell__brand">
          PlayMe
        </Link>
      </header>
      <main className="app-shell__guest-main">{children}</main>
      <nav className="app-shell__guest-nav" aria-label="Primary navigation">
        {guestNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={`app-shell__guest-link${item.isActive(location.pathname) ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
