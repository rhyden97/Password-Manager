import { useCallback } from 'react';

export function useClipboard(showToast: (message: string, type: 'success' | 'error') => void) {
  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      if (!navigator.clipboard?.writeText) {
        showToast('Clipboard is not available in this browser', 'error');
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard`, 'success');
      } catch {
        showToast('Failed to copy to clipboard', 'error');
      }
    },
    [showToast]
  );

  return { copyToClipboard };
}
