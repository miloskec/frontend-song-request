import { useEffect, useState } from 'react';
import { Card, Screen, StateBlock } from '@/components/ui';
import { acceptDjRequestToQueue, fetchDjRequestsScreenData, rejectDjRequest } from '@/services/djRequestsService';
import { useDjDashboardStore } from '@/stores';
import type { SongRequest } from '@/types/domain';

type Status = 'loading' | 'success' | 'empty' | 'error';

export function RequestsPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [actionState, setActionState] = useState<Record<string, 'idle' | 'working'>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { selectedQueueId, setSelectedQueueId } = useDjDashboardStore();

  useEffect(() => {
    let isMounted = true;
    setStatus('loading');
    setFeedback(null);

    void fetchDjRequestsScreenData()
      .then((data) => {
        if (!isMounted) {
          return;
        }

        setRequests(data.requests.data);
        if (!selectedQueueId && data.queues.data[0]) {
          setSelectedQueueId(data.queues.data[0].id);
        }

        if (data.requests.data.length === 0) {
          setStatus('empty');
          return;
        }

        setStatus('success');
      })
      .catch((error: Error) => {
        if (!isMounted) {
          return;
        }
        setFeedback({ type: 'error', message: error.message });
        setStatus('error');
      });

    return () => {
      isMounted = false;
    };
  }, [selectedQueueId, setSelectedQueueId]);

  async function handleReject(requestId: string) {
    setActionState((prev) => ({ ...prev, [requestId]: 'working' }));
    try {
      const result = await rejectDjRequest(requestId);
      setRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: result.request.status } : item)));
      setFeedback({ type: 'success', message: result.message });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to reject request.' });
    } finally {
      setActionState((prev) => ({ ...prev, [requestId]: 'idle' }));
    }
  }

  async function handleAccept(request: SongRequest) {
    if (!selectedQueueId) {
      setFeedback({ type: 'error', message: 'No active queue available for accepted requests.' });
      return;
    }

    setActionState((prev) => ({ ...prev, [request.id]: 'working' }));
    try {
      const result = await acceptDjRequestToQueue(request, selectedQueueId);
      setRequests((prev) => prev.map((item) => (item.id === request.id ? { ...item, status: result.request.status } : item)));
      setFeedback({ type: 'success', message: result.message });
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Failed to accept request.' });
    } finally {
      setActionState((prev) => ({ ...prev, [request.id]: 'idle' }));
    }
  }

  return (
    <Screen className="dj-modern" title="DJ Requests" subtitle="Review incoming guest requests and route accepted songs into the active queue.">
      {status === 'loading' ? <StateBlock kind="loading" title="Loading incoming requests..." /> : null}
      {status === 'empty' ? <StateBlock kind="empty" title="No incoming requests right now." description="New guest requests will appear here." /> : null}
      {status === 'error' ? <StateBlock kind="error" title="Unable to load requests." description={feedback?.message} /> : null}
      {feedback?.type === 'success' ? <StateBlock kind="success" title="Action completed" description={feedback.message} /> : null}
      {feedback?.type === 'error' && status !== 'error' ? <StateBlock kind="error" title="Action failed" description={feedback.message} /> : null}

      {status === 'success' ? (
        <Card heading="Request details" elevated>
          <div className="dj-scroll">
            <ul className="dj-list">
              {requests.map((request) => {
                const isBusy = actionState[request.id] === 'working';
                return (
                  <li key={request.id} className="dj-list-item">
                    <div className="dj-row">
                      <img className="media-thumb" src={`https://picsum.photos/seed/${request.song_id}/96/96`} alt="Song cover" />
                      <div className="dj-song-meta">
                        <p className="dj-song-meta__title">{request.guest_name ?? 'Anonymous'}</p>
                        <p className="dj-song-meta__sub">{request.guest_message ?? 'No message'}</p>
                        <p className="dj-song-meta__sub">Song ID: {request.song_id}</p>
                      </div>
                      <span
                        className={`ui-chip ${
                          request.status === 'approved' ? 'ui-chip--success' : request.status === 'rejected' ? 'ui-chip--danger' : 'ui-chip--warning'
                        } dj-row__right`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="dj-actions">
                      <button type="button" disabled={isBusy} onClick={() => handleAccept(request)} className="ui-btn ui-btn--primary">
                        Accept
                      </button>
                      <button type="button" disabled={isBusy} onClick={() => handleReject(request.id)} className="ui-btn ui-btn--danger">
                        Reject
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      ) : null}
    </Screen>
  );
}
