import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClockButtons } from "./ClockButtons";

vi.mock("./useAttendance", () => ({
  useTodayStatus: vi.fn(),
  useClockIn: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useClockOut: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
}));

vi.mock("./ClockMemoDialog", () => ({
  ClockMemoDialog: () => null,
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
        records: [
          {
            id: "1",
            workDate: "2026-07-13",
            clockIn: "09:00:00",
            clockOut: null,
            corrected: false,
          },
        ],
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
        records: [
          {
            id: "1",
            workDate: "2026-07-13",
            clockIn: "09:00:00",
            clockOut: "18:00:00",
            corrected: false,
          },
        ],
      },
      isLoading: false,
    } as ReturnType<typeof useTodayStatus>);

    render(<ClockButtons />);

    const clockInButton = screen.getByRole("button", { name: /出勤/ });
    const clockOutButton = screen.getByRole("button", { name: /退勤/ });

    expect(clockInButton).toBeDisabled();
    expect(clockOutButton).toBeDisabled();
  });

  describe("メモダイアログ連携", () => {
    it("出勤ボタン通常クリックではダイアログが表示されず即打刻される", async () => {
      const user = userEvent.setup();
      mockUseTodayStatus.mockReturnValue({
        data: { status: "NOT_CLOCKED_IN" as const, records: [] },
        isLoading: false,
      } as unknown as ReturnType<typeof useTodayStatus>);

      render(<ClockButtons />);

      await user.click(screen.getByRole("button", { name: /出勤/ }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("出勤ボタン長押しでメモダイアログが表示される", async () => {
      mockUseTodayStatus.mockReturnValue({
        data: { status: "NOT_CLOCKED_IN" as const, records: [] },
        isLoading: false,
      } as unknown as ReturnType<typeof useTodayStatus>);

      render(<ClockButtons />);

      const clockInButton = screen.getByRole("button", { name: /出勤/ });

      clockInButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 600));
      clockInButton.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("退勤ボタン通常クリックではダイアログが表示されず即打刻される", async () => {
      const user = userEvent.setup();
      mockUseTodayStatus.mockReturnValue({
        data: {
          status: "CLOCKED_IN" as const,
          records: [
            {
              id: "1",
              workDate: "2026-07-13",
              clockIn: "09:00:00",
              clockOut: null,
              corrected: false,
            },
          ],
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useTodayStatus>);

      render(<ClockButtons />);

      await user.click(screen.getByRole("button", { name: /退勤/ }));

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("退勤ボタン長押しでメモダイアログが表示される", async () => {
      mockUseTodayStatus.mockReturnValue({
        data: {
          status: "CLOCKED_IN" as const,
          records: [
            {
              id: "1",
              workDate: "2026-07-13",
              clockIn: "09:00:00",
              clockOut: null,
              corrected: false,
            },
          ],
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useTodayStatus>);

      render(<ClockButtons />);

      const clockOutButton = screen.getByRole("button", { name: /退勤/ });

      // Simulate long press (pointerdown → wait → pointerup)
      clockOutButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 600));
      clockOutButton.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
