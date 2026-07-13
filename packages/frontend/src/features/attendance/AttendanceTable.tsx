"use client";

import { useState } from "react";
import { type Column, DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import type { AttendanceRecordResponse, DailyAttendanceResponse } from "./attendance-api";
import { ClockMemoDialog } from "./ClockMemoDialog";
import { formatDate, formatMinutes, formatTime } from "./format";
import { MemoDetailDialog } from "./MemoDetailDialog";
import { useDeleteMemo, useUpdateMemo } from "./useAttendance";

function firstClockIn(day: DailyAttendanceResponse): string {
  const record = day.records[0];
  return record ? formatTime(record.clockIn) : "--:--";
}

function lastClockOut(day: DailyAttendanceResponse): string {
  const last = day.records[day.records.length - 1];
  return last?.clockOut ? formatTime(last.clockOut) : "--:--";
}

function hasCorrected(day: DailyAttendanceResponse): boolean {
  return day.records.some((r) => r.corrected);
}

function memoSummary(day: DailyAttendanceResponse): string | null {
  const memos: string[] = [];
  for (const r of day.records) {
    if (r.clockInMemo) memos.push(r.clockInMemo);
    if (r.clockOutMemo) memos.push(r.clockOutMemo);
  }
  if (memos.length === 0) return null;
  const joined = memos.join(" / ");
  return joined.length > 10 ? `${joined.slice(0, 10)}…` : joined;
}

interface AttendanceTableProps {
  days: DailyAttendanceResponse[];
  isOwner?: boolean;
}

export function AttendanceTable({ days, isOwner = true }: AttendanceTableProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordResponse | null>(null);
  const [selectedMemoType, setSelectedMemoType] = useState<"clockIn" | "clockOut">("clockIn");

  const updateMemoMutation = useUpdateMemo();
  const deleteMemoMutation = useDeleteMemo();

  function handleMemoClick(day: DailyAttendanceResponse) {
    const record = day.records[0];
    if (!record) return;

    if (record.clockInMemo) {
      setSelectedRecord(record);
      setSelectedMemoType("clockIn");
      setDetailOpen(true);
    } else if (record.clockOutMemo) {
      setSelectedRecord(record);
      setSelectedMemoType("clockOut");
      setDetailOpen(true);
    }
  }

  function handleEdit() {
    setDetailOpen(false);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!selectedRecord) return;
    deleteMemoMutation.mutate({ recordId: selectedRecord.id, type: selectedMemoType });
    setDetailOpen(false);
  }

  function handleEditConfirm(memo: string | null) {
    if (!selectedRecord || !memo) return;
    updateMemoMutation.mutate({ recordId: selectedRecord.id, type: selectedMemoType, memo });
    setEditOpen(false);
  }

  const columns: Column<DailyAttendanceResponse>[] = [
    { key: "date", header: "日付", render: (day) => formatDate(day.date) },
    { key: "clockIn", header: "出勤", render: (day) => firstClockIn(day) },
    { key: "clockOut", header: "退勤", render: (day) => lastClockOut(day) },
    {
      key: "workMinutes",
      header: "勤務時間",
      render: (day) => (day.workMinutes > 0 ? formatMinutes(day.workMinutes) : "-"),
    },
    {
      key: "breakMinutes",
      header: "休憩",
      render: (day) => (day.breakMinutes > 0 ? formatMinutes(day.breakMinutes) : "-"),
    },
    {
      key: "overtimeMinutes",
      header: "残業",
      render: (day) => (day.overtimeMinutes > 0 ? formatMinutes(day.overtimeMinutes) : "-"),
    },
    {
      key: "memo",
      header: "メモ",
      render: (day) => {
        const text = memoSummary(day);
        return text ? (
          <button
            type="button"
            onClick={() => handleMemoClick(day)}
            className="text-xs text-blue-600 underline hover:text-blue-800"
          >
            {text}
          </button>
        ) : null;
      },
    },
    {
      key: "corrected",
      header: "",
      render: (day) => (hasCorrected(day) ? <Badge variant="outline">修正</Badge> : null),
    },
  ];

  const selectedMemo = selectedRecord
    ? selectedMemoType === "clockIn"
      ? selectedRecord.clockInMemo
      : selectedRecord.clockOutMemo
    : null;

  return (
    <>
      <DataTable<DailyAttendanceResponse & Record<string, unknown>>
        columns={columns as Column<DailyAttendanceResponse & Record<string, unknown>>[]}
        data={days as (DailyAttendanceResponse & Record<string, unknown>)[]}
        rowKey={(item) => item.date}
        emptyMessage="勤怠データがありません"
      />
      {selectedMemo && (
        <MemoDetailDialog
          open={detailOpen}
          memo={selectedMemo}
          type={selectedMemoType}
          isOwner={isOwner}
          onClose={() => setDetailOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
      <ClockMemoDialog
        open={editOpen}
        type={selectedMemoType}
        initialMemo={selectedMemo ?? ""}
        confirmLabel="保存"
        onConfirm={handleEditConfirm}
        onCancel={() => setEditOpen(false)}
      />
    </>
  );
}
