"use client";

import type { ReactNode } from "react";

interface DialogShellProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function DialogShell({ title, onClose, children }: DialogShellProps) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-lg overflow-hidden">
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
