import { useState } from 'react';
import { Card, Screen, StateBlock } from '@/components/ui';

export function SettingsPage() {
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  function handleGenerateQrCode() {
    const nextQr = globalThis.crypto?.randomUUID?.() ?? `44444444-4444-4444-8444-${String(Date.now()).slice(-12)}`;
    setGeneratedQr(nextQr);
    setCopyFeedback(null);
  }

  async function handleCopyQrCode() {
    if (!generatedQr) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedQr);
      setCopyFeedback({ type: 'success', message: 'QR UUID copied to clipboard.' });
    } catch {
      setCopyFeedback({ type: 'error', message: 'Clipboard copy failed.' });
    }
  }

  return (
    <Screen className="dj-modern" title="Settings" subtitle="DJ settings shell for future preferences and account controls.">
      <Card heading="General settings" elevated>
        <div className="dj-form">
          <button type="button" className="ui-btn ui-btn--primary" onClick={handleGenerateQrCode}>
            Generate QR Code
          </button>
          {generatedQr ? (
            <div className="dj-form">
              <StateBlock kind="success" title="QR code generated (mock)" description={`QR UUID: ${generatedQr}`} />
              <button type="button" className="ui-btn ui-btn--ghost" onClick={handleCopyQrCode}>
                Copy
              </button>
              {copyFeedback?.type === 'success' ? <StateBlock kind="success" title="Copied" description={copyFeedback.message} /> : null}
              {copyFeedback?.type === 'error' ? <StateBlock kind="error" title="Copy failed" description={copyFeedback.message} /> : null}
            </div>
          ) : (
            <StateBlock
              kind="empty"
              title="Settings UI is scaffolded."
              description="Generate QR Code is available as a frontend shell action for now."
            />
          )}
        </div>
      </Card>
    </Screen>
  );
}
