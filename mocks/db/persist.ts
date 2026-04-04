function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function loadPersistedDb<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return cloneData(fallback);
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return cloneData(fallback);
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return cloneData(fallback);
  }
}

export function savePersistedDb<T>(key: string, value: T): void {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
}
