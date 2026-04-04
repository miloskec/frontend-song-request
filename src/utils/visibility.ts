import type { Queue, QueueItem } from '@/types/domain';

export function projectVisibleQueueItems(queue: Queue, items: QueueItem[]): QueueItem[] {
  const ordered = [...items]
    .filter((item) => item.status !== 'removed')
    .sort((a, b) => a.position - b.position);

  switch (queue.visibility_mode) {
    case 'hidden':
      return [];
    case 'current_only':
      return ordered.filter((item) => item.status === 'now_playing').slice(0, 1);
    case 'current_and_next': {
      const currentIndex = ordered.findIndex((item) => item.status === 'now_playing');
      if (currentIndex === -1) {
        return ordered.slice(0, 2);
      }
      return ordered.slice(currentIndex, currentIndex + 2);
    }
    case 'top_n':
      {
        const currentItem = ordered.find((item) => item.status === 'now_playing') ?? null;
        const upcomingCount = Math.max(queue.visible_count ?? 0, 0);
        const upcomingItems = ordered.filter((item) => item.status !== 'now_playing').slice(0, upcomingCount);
        return currentItem ? [currentItem, ...upcomingItems] : upcomingItems;
      }
    case 'full':
    default:
      return ordered;
  }
}
