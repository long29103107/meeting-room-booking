import { useEffect, useRef, useState } from 'react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmButton = useRef<HTMLButtonElement>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    confirmButton.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) onClose();
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      previouslyFocused?.focus();
    };
  }, [open, onClose, submitting]);

  if (!open) return null;

  async function confirm() {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="confirm-dialog-overlay"
      onMouseDown={event => { if (event.target === event.currentTarget && !submitting) onClose(); }}
    >
      <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description">
        <h2 id="confirm-dialog-title">{title}</h2>
        <p id="confirm-dialog-description">{description}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="secondary" disabled={submitting} onClick={onClose}>{cancelLabel}</button>
          <button ref={confirmButton} type="button" className="secondary danger" disabled={submitting} onClick={() => void confirm()}>
            {submitting ? 'Working…' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
