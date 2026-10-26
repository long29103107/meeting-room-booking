import { useEffect } from 'react';
import { CheckCircle2, CircleAlert, X } from 'lucide-react';
import { ToastMessage } from '../../types/domain';

export function ToastViewport({ items, onDismiss }: { items: ToastMessage[]; onDismiss: (id: number) => void }) {
  return <div className="toast-viewport" aria-live="polite" aria-relevant="additions text">
    {items.map(toast => <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />)}
  </div>;
}

function Toast({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(toast.id), 5000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast.id]);

  const Icon = toast.kind === 'error' ? CircleAlert : CheckCircle2;
  return <div className={`toast toast-${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
    <Icon className="toast-icon" size={19} aria-hidden="true" />
    <p>{toast.message}</p>
    <button type="button" className="toast-dismiss" aria-label="Dismiss notification" onClick={() => onDismiss(toast.id)}>
      <X size={17} aria-hidden="true" />
    </button>
  </div>;
}
