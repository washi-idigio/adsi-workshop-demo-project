import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoDetailDialog } from "./MemoDetailDialog";

describe("MemoDetailDialog", () => {
  afterEach(() => {
    cleanup();
  });

  it("メモの全文が表示される", () => {
    const longMemo = "これは長いメモです。全文がダイアログに表示されることを確認するテストです。";

    render(
      <MemoDetailDialog
        open={true}
        memo={longMemo}
        type="clockIn"
        isOwner={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText(longMemo)).toBeInTheDocument();
  });

  it("本人の場合は編集ボタンが表示される", () => {
    render(
      <MemoDetailDialog
        open={true}
        memo="電車遅延"
        type="clockIn"
        isOwner={true}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /編集/ })).toBeInTheDocument();
  });

  it("本人の場合は削除ボタンが表示される", () => {
    render(
      <MemoDetailDialog
        open={true}
        memo="電車遅延"
        type="clockIn"
        isOwner={true}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /削除/ })).toBeInTheDocument();
  });

  it("他人の場合は編集・削除ボタンが表示されない", () => {
    render(
      <MemoDetailDialog
        open={true}
        memo="電車遅延"
        type="clockIn"
        isOwner={false}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: /編集/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /削除/ })).not.toBeInTheDocument();
  });

  it("編集ボタンを押すとonEditが呼ばれる", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <MemoDetailDialog
        open={true}
        memo="電車遅延"
        type="clockIn"
        isOwner={true}
        onClose={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /編集/ }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("削除ボタンを押すとonDeleteが呼ばれる", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <MemoDetailDialog
        open={true}
        memo="電車遅延"
        type="clockIn"
        isOwner={true}
        onClose={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: /削除/ }));
    expect(onDelete).toHaveBeenCalled();
  });
});
