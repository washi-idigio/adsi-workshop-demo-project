import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClockMemoDialog } from "./ClockMemoDialog";

describe("ClockMemoDialog", () => {
  afterEach(() => {
    cleanup();
  });

  describe("出勤時ダイアログ", () => {
    it("出勤用プリセット候補が表示される", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText("電車遅延")).toBeInTheDocument();
      expect(screen.getByText("体調不良")).toBeInTheDocument();
      expect(screen.getByText("私用")).toBeInTheDocument();
      expect(screen.getByText("通院")).toBeInTheDocument();
      expect(screen.getByText("その他")).toBeInTheDocument();
    });

    it("プリセットを選択すると入力欄にセットされる", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByText("電車遅延"));

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("電車遅延");
    });

    it("「その他」を選択するとテキストエリアが空のまま自由入力可能", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByText("その他"));

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("");
      expect(textarea).toHaveFocus();
    });

    it("「出勤する」ボタンを押すとメモ付きでonConfirmが呼ばれる", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByText("電車遅延"));
      await user.click(screen.getByRole("button", { name: /出勤する/ }));

      expect(onConfirm).toHaveBeenCalledWith("電車遅延");
    });

    it("メモ空欄のまま「出勤する」を押すとnullでonConfirmが呼ばれる", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByRole("button", { name: /出勤する/ }));

      expect(onConfirm).toHaveBeenCalledWith(null);
    });

    it("自由入力でメモを入力して確定できる", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByText("その他"));
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "バスが遅れたため");
      await user.click(screen.getByRole("button", { name: /出勤する/ }));

      expect(onConfirm).toHaveBeenCalledWith("バスが遅れたため");
    });

    it("200文字を超える入力はできない", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockIn"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      await user.click(screen.getByText("その他"));
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("maxLength", "200");
    });
  });

  describe("退勤時ダイアログ", () => {
    it("退勤用プリセット候補が表示される", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockOut"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText("体調不良")).toBeInTheDocument();
      expect(screen.getByText("私用")).toBeInTheDocument();
      expect(screen.getByText("通院")).toBeInTheDocument();
      expect(screen.getByText("家庭の事情")).toBeInTheDocument();
      expect(screen.getByText("その他")).toBeInTheDocument();
      expect(screen.queryByText("電車遅延")).not.toBeInTheDocument();
    });

    it("「退勤する」ボタンが表示される", () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ClockMemoDialog
          open={true}
          type="clockOut"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByRole("button", { name: /退勤する/ })).toBeInTheDocument();
    });
  });
});
