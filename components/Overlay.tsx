"use client";

export default function Overlay({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-brand-pink-deep/40 backdrop-blur-[2px] sm:items-center sm:p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface p-6 pb-[calc(20px+env(safe-area-inset-bottom,0px))] shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-foreground-soft"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
