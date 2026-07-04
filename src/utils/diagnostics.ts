import { env } from './env';

type DiagnosticLevel = 'info' | 'warn' | 'error';

interface DiagnosticEvent {
  event: string;
  flow: string;
  entityId?: string;
  expected?: string;
  actual?: string;
  status?: string;
  metadata?: Record<string, unknown>;
}

interface DiagnosticEnvelope extends DiagnosticEvent {
  level: DiagnosticLevel;
  timestamp: string;
}

export function emitDiagnostic(level: DiagnosticLevel, payload: DiagnosticEvent): void {
  if (!env.diagnosticsEnabled) {
    return;
  }

  const envelope: DiagnosticEnvelope = {
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (level === 'error') {
    console.error('[diagnostic]', envelope);
    return;
  }

  if (level === 'warn') {
    console.warn('[diagnostic]', envelope);
    return;
  }

  console.info('[diagnostic]', envelope);
}
