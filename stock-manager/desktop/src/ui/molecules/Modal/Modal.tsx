import type { PropsWithChildren, ReactNode } from 'react';

type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
}>;

const Modal = ({ open, title, description, onClose, footer, children }: ModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-[#0b1224] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Modal</p>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {description && <p className="text-sm text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300 transition hover:border-white/40 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </header>
        <div className="max-h-[70vh] overflow-auto px-6 py-4 text-slate-100">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-white/5 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

