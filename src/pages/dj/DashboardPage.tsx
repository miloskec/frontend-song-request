import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Screen, StateBlock } from '@/components/ui';
import { fetchDjDashboardSummary } from '@/services/djService';
import { useDjDashboardStore } from '@/stores';

interface DashboardCounts {
  playlists: number;
  requests: number;
  queues: number;
}

export function DashboardPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'empty' | 'error'>('loading');
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { activePlaylistId, selectedQueueId, setActivePlaylistId, setSelectedQueueId } = useDjDashboardStore();

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');

    void fetchDjDashboardSummary()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        const nextCounts: DashboardCounts = {
          playlists: data.playlists.data.length,
          requests: data.requests.data.length,
          queues: data.queues.data.length,
        };

        setCounts(nextCounts);

        if (data.playlists.data[0]) {
          setActivePlaylistId(data.playlists.data[0].id);
        }

        if (data.queues.data[0]) {
          setSelectedQueueId(data.queues.data[0].id);
        }

        if (nextCounts.playlists === 0 && nextCounts.requests === 0 && nextCounts.queues === 0) {
          setStatus('empty');
          return;
        }

        setStatus('success');
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }
        setErrorMessage(error.message);
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [setActivePlaylistId, setSelectedQueueId]);

  return (
    <Screen className="dj-modern" title="DJ Dashboard" subtitle="Shell view for playlist, requests, and queue operations.">
      {status === 'loading' ? <StateBlock kind="loading" title="Loading dashboard data..." /> : null}
      {status === 'error' ? <StateBlock kind="error" title="Unable to load dashboard." description={errorMessage ?? undefined} /> : null}
      {status === 'empty' ? <StateBlock kind="empty" title="No DJ data yet." description="Create your first playlist to get started." /> : null}
      {status === 'success' && counts ? (
        <>
          <section className="dj-grid dj-grid--stats" aria-label="Dashboard statistics">
            <article className="dj-stat">
              <p className="dj-stat__label">Playlists</p>
              <p className="dj-stat__value">{counts.playlists}</p>
              <p style={{ margin: 0 }}>Playlists: {counts.playlists}</p>
            </article>
            <article className="dj-stat">
              <p className="dj-stat__label">Incoming Requests</p>
              <p className="dj-stat__value">{counts.requests}</p>
              <p style={{ margin: 0 }}>Incoming requests: {counts.requests}</p>
            </article>
            <article className="dj-stat">
              <p className="dj-stat__label">Active Queues</p>
              <p className="dj-stat__value">{counts.queues}</p>
              <p style={{ margin: 0 }}>Queues: {counts.queues}</p>
            </article>
            <article className="dj-stat">
              <p className="dj-stat__label">Live Mode</p>
              <p className="dj-stat__value">ON</p>
              <p className="ui-meta" style={{ margin: 0 }}>
                Mock demo control surface
              </p>
            </article>
          </section>
          <Card heading="Selected context" elevated>
            <p style={{ margin: 0 }}>Active playlist ID: {activePlaylistId ?? 'none'}</p>
            <p style={{ margin: '0.35rem 0 0' }}>Selected queue ID: {selectedQueueId ?? 'none'}</p>
            <p style={{ margin: '0.8rem 0 0' }}>
              <Link to="/dj/requests" className="dj-link">
                Open requests inbox
              </Link>
            </p>
            <p style={{ margin: '0.55rem 0 0' }}>
              <Link to="/dj/queue" className="dj-link">
                Open active queue
              </Link>
            </p>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
