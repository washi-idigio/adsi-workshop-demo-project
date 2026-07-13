import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClockButtons } from "./ClockButtons";

vi.mock("./useAttendance", () => ({
  useTodayStatus: vi.fn(),
  useClockIn: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useClockOut: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

import { useTodayStatus } from "./useAttendance";
const mockUseTodayStatus = vi.mocked(useTodayStatus);

describe("ClockButtons", () => {
  afterEach(() => {
    cleanup();
  });

  it("未出勤時: 出勤ボタンが有効、退勤ボタンが無効", () => {
    mockUseTodayStatus.mockReturnValue({
      data: { status: "NOT_CLOCKED_IN", records: [] },
      isLoading: false,
    } as ReturnType<typeof useTodayStatus>);

    render(<ClockButtons />);

    const clockInButton = screen.getByRole("button", { name: /出勤/ });
    const clockOutButton = screen.getByRole("button", { name: /退勤/ });

    expect(clockInButton).not.toBeDisabled();
    expect(clockOutButton).toBeDisabled();
  });

  it("勤務中(CLOCKED_IN): 出勤ボタンが無効、退勤ボタンが有効", () => {
    mockUseTodayStatus.mockReturnValue({
      data: {
        status: "CLOCKED_IN",
        records: [{ id: "1", workDate: "2026-07-13", clockIn: "09:00:00", clockOut: null, corrected: false }],
      },
      isLoading: false,
    } as ReturnType<typeof useTodayStatus>);

    render(<ClockButtons />);

    const clockInButton = screen.getByRole("button", { name: /出勤/ });
    const clockOutButton = screen.getByRole("button", { name: /退勤/ });

    expect(clockInButton).toBeDisabled();
    expect(clockOutButton).not.toBeDisabled();
  });

  it("退勤済み(CLOCKED_OUT): 出勤・退勤ボタンともに無効", () => {
    mockUseTodayStatus.mockReturnValue({
      data: {
        status: "CLOCKED_OUT",
        records: [{ id: "1", workDate: "2026-07-13", clockIn: "09:00:00", clockOut: "18:00:00", corrected: false }],
      },
      isLoading: false,
    } as ReturnType<typeof useTodayStatus>);

    render(<ClockButtons />);

    const clockInButton = screen.getByRole("button", { name: /出勤/ });
    const clockOutButton = screen.getByRole("button", { name: /退勤/ });

    expect(clockInButton).toBeDisabled();
    expect(clockOutButton).toBeDisabled();
  });
});
