"use client";

import { DialogShell } from "./DialogShell";

interface MemoDetailDialogProps {
  open: boolean;
  memo: string;
  type: "clockIn" | "clockOut";
  isOwner: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemoDetailDialog({ open, memo, type, isOwner, onClose, onEdit, onDelete }: MemoDetailDialogProps) {
  if (!open) return null;

  return (
    <DialogShell title={type === "clockIn" ? "出勤メモ" : "退勤メモ"} onClose={onClose}>
      <p className="text-sm whitespace-pre-wrap break-all mb-4">{memo}</p>

      <div className="flex justify-end gap-2">
        {isOwner && (
          <>
            <button type="button" onClick={onDelete} className="px-4 py-2 text-sm rounded border text-red-600">
              削除
            </button>
            <button type="button" onClick={onEdit} className="px-4 py-2 text-sm rounded bg-blue-500 text-white">
              編集
            </button>
          </>
        )}
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded border">
          閉じる
        </button>
      </div>
    </DialogShell>
  );
}
