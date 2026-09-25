import { useEffect } from 'react';
import { Button } from '@maju/ui';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-maju-text">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-maju-muted">{message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button autoFocus variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={confirmVariant === 'danger' ? 'danger' : confirmVariant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
