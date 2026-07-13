"use client";

import { useEffect, useRef, useState } from "react";
import { DialogShell } from "./DialogShell";

const CLOCK_IN_PRESETS = ["電車遅延", "体調不良", "私用", "通院", "その他"];
const CLOCK_OUT_PRESETS = ["体調不良", "私用", "通院", "家庭の事情", "その他"];

interface ClockMemoDialogProps {
  open: boolean;
  type: "clockIn" | "clockOut";
  initialMemo?: string;
  confirmLabel?: string;
  onConfirm: (memo: string | null) => void;
  onCancel: () => void;
}

export function ClockMemoDialog({
  open,
  type,
  initialMemo,
  confirmLabel: customLabel,
  onConfirm,
  onCancel,
}: ClockMemoDialogProps) {
  const [memo, setMemo] = useState(initialMemo ?? "");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setMemo(initialMemo ?? "");
      setSelectedPreset(null);
    }
  }, [open, initialMemo]);

  if (!open) return null;

  const presets = type === "clockIn" ? CLOCK_IN_PRESETS : CLOCK_OUT_PRESETS;
  const confirmLabel = customLabel ?? (type === "clockIn" ? "出勤する" : "退勤する");

  function handlePresetClick(preset: string) {
    setSelectedPreset(preset);
    if (preset === "その他") {
      setMemo("");
      setTimeout(() => textareaRef.current?.focus(), 0);
    } else {
      setMemo(preset);
    }
  }

  function handleConfirm() {
    onConfirm(memo.trim() || null);
  }

  return (
    <DialogShell title={type === "clockIn" ? "出勤メモ" : "退勤メモ"} onClose={onCancel}>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePresetClick(preset)}
            className={`px-3 py-1 rounded-full text-sm border ${
              selectedPreset === preset
                ? "bg-blue-100 border-blue-500"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={memo}
        onChange={(e) => setMemo(e.target.value)}
        maxLength={200}
        placeholder="メモを入力（任意）"
        className="w-full rounded border p-2 text-sm resize-none h-20"
      />

      <div className="flex justify-end gap-2 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm rounded border">
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="px-4 py-2 text-sm rounded bg-blue-500 text-white"
        >
          {confirmLabel}
        </button>
      </div>
    </DialogShell>
  );
}
