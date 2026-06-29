interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, description, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-lg">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && <p className="mt-2 text-sm text-slate-600">{description}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            Cancelar
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
