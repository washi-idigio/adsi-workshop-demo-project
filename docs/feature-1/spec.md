# 打刻メモ機能 — 確定仕様

> 根拠: [qa.md](./qa.md) の Q&A から確定。

## 概要

打刻（出勤・退勤）時に任意のメモ（主に遅刻・早退理由）を入力できる機能。

## 基本仕様

| 項目 | 仕様 |
|------|------|
| 入力タイミング | 出勤・退勤の両方 |
| 必須/任意 | 任意（空欄OK） |
| 最大文字数 | 200文字 |
| 主な用途 | 遅刻理由、早退理由 |

## UI / UX

### 出勤時

1. 「出勤」ボタン押下 → **ダイアログ（モーダル）** が表示される
2. ダイアログ内容:
   - プリセット候補（チップ）: 「電車遅延」「体調不良」「私用」「通院」「その他」
   - 「その他」選択時、またはチップ未選択時はテキストエリアに自由入力可能
   - 「出勤する」ボタン（メモ欄が空でも押せる → メモなし打刻）
3. 「出勤する」押下で打刻実行

### 退勤時

1. 「退勤」ボタン**通常タップ** → ダイアログなしで即打刻（メモなし）
2. 「退勤」ボタン**長押し** → ダイアログが表示される
3. ダイアログ内容:
   - プリセット候補（チップ）: 「体調不良」「私用」「通院」「家庭の事情」「その他」
   - 「その他」選択時、またはチップ未選択時はテキストエリアに自由入力可能
   - 「退勤する」ボタン（メモ欄が空でも押せる → メモなし退勤）
4. 「退勤する」押下で打刻実行

### メモの表示

- **本日の打刻記録・月次勤怠履歴・チーム勤怠一覧** すべて共通:
  - 先頭10文字を表示（メモがある場合）
  - 「詳細」ボタン押下で全文確認ダイアログが開く

## データモデル

`attendance_records` テーブルに2カラム追加:

| カラム名 | 型 | 制約 |
|---------|-----|------|
| `clock_in_memo` | VARCHAR(200) | NULL許可 |
| `clock_out_memo` | VARCHAR(200) | NULL許可 |

## API 変更

| エンドポイント | 変更内容 |
|--------------|---------|
| `POST /api/attendance/clock-in` | リクエストボディに `memo`（任意）を追加 |
| `POST /api/attendance/clock-out` | リクエストボディに `memo`（任意）を追加 |
| `PUT /api/attendance/{id}/memo` | **新規** — メモ編集（本人のみ） |
| `DELETE /api/attendance/{id}/memo/{type}` | **新規** — メモ削除（本人のみ、type=clockIn/clockOut） |
| `GET /api/attendance/today` | レスポンスに `clockInMemo`, `clockOutMemo` 追加 |
| `GET /api/attendance/history` | レスポンスに `clockInMemo`, `clockOutMemo` 追加 |
| `GET /api/attendance/team` | レスポンスに `clockInMemo`, `clockOutMemo` 追加 |
| `GET /api/attendance/all` | レスポンスに `clockInMemo`, `clockOutMemo` 追加 |

## 権限

| 操作 | 本人 | 上長 | 管理者 |
|------|:----:|:----:|:------:|
| メモ閲覧 | o | o | o |
| メモ編集 | o | x | x |
| メモ削除 | o | x | x |

- 編集・削除に期限なし（無期限）

## プリセット候補一覧

### 出勤時
- 電車遅延
- 体調不良
- 私用
- 通院
- その他（自由入力）

### 退勤時
- 体調不良
- 私用
- 通院
- 家庭の事情
- その他（自由入力）

---

## 実装対象ファイル

### Backend（`packages/backend/src/main/`）

| # | 層 | ファイルパス | 新規/変更 | 内容 |
|---|---|---|---|---|
| 1 | DB | `resources/db/migration/V5__add_memo_columns.sql` | 新規 | `clock_in_memo VARCHAR(200)`, `clock_out_memo VARCHAR(200)` カラム追加 |
| 2 | Entity | `java/.../attendance/entity/AttendanceRecord.java` | 変更 | `clockInMemo`, `clockOutMemo` フィールド追加 |
| 3 | DTO | `java/.../attendance/dto/ClockInRequest.java` | 新規 | `record ClockInRequest(@Size(max=200) String memo)` |
| 4 | DTO | `java/.../attendance/dto/ClockOutRequest.java` | 新規 | `record ClockOutRequest(@Size(max=200) String memo)` |
| 5 | DTO | `java/.../attendance/dto/MemoUpdateRequest.java` | 新規 | `record MemoUpdateRequest(String type, @Size(max=200) @NotBlank String memo)` |
| 6 | DTO | `java/.../attendance/dto/AttendanceRecordResponse.java` | 変更 | `clockInMemo`, `clockOutMemo` フィールド追加 |
| 7 | Service | `java/.../attendance/service/AttendanceService.java` | 変更 | `clockIn`/`clockOut` に memo 引数追加、`updateMemo`/`deleteMemo` メソッド追加 |
| 8 | Service | `java/.../attendance/service/AttendanceServiceImpl.java` | 変更 | 上記の実装。メモ編集・削除は本人チェックを含む |
| 9 | Controller | `java/.../attendance/controller/AttendanceController.java` | 変更 | clock-in/out に `@RequestBody` 追加、`PUT /{id}/memo`・`DELETE /{id}/memo/{type}` エンドポイント追加 |

### Backend テスト（`packages/backend/src/test/`）

| # | 層 | ファイルパス | 新規/変更 | 内容 |
|---|---|---|---|---|
| 10 | Service | `java/.../attendance/service/AttendanceServiceImplTest.java` | 変更 | メモ付き打刻・メモ編集・削除・権限チェックのテスト追加 |
| 11 | Controller | `java/.../attendance/controller/AttendanceControllerTest.java` | 変更 | 新エンドポイント + メモ付きリクエストのテスト追加 |
| 12 | Repository | `java/.../attendance/repository/AttendanceRecordRepositoryTest.java` | 変更 | メモ付きレコードの永続化テスト |

### Frontend（`packages/frontend/src/`）

| # | 層 | ファイルパス | 新規/変更 | 内容 |
|---|---|---|---|---|
| 13 | API型 | `features/attendance/attendance-api.ts` | 変更 | `clockIn`/`clockOut` に `memo` パラメータ追加、レスポンス型に `clockInMemo`/`clockOutMemo` 追加、`updateMemo`/`deleteMemo` 関数追加 |
| 14 | Hook | `features/attendance/useAttendance.ts` | 変更 | `useClockIn`/`useClockOut` が memo を受け取るよう変更、`useUpdateMemo`/`useDeleteMemo` hook 追加 |
| 15 | Component | `features/attendance/ClockMemoDialog.tsx` | 新規 | プリセットチップ + テキストエリア + 打刻確定ボタンのモーダル |
| 16 | Component | `features/attendance/MemoDetailDialog.tsx` | 新規 | メモ全文表示 + 編集・削除UI のモーダル |
| 17 | Component | `features/attendance/ClockButtons.tsx` | 変更 | 出勤 → ダイアログ表示に変更、退勤 → 長押し判定追加 |
| 18 | Component | `features/attendance/TodayRecords.tsx` | 変更 | メモ先頭10文字表示 + 詳細ボタン追加 |
| 19 | Component | `features/attendance/AttendanceTable.tsx` | 変更 | 月次履歴にメモ列追加（先頭10文字 + 詳細ボタン） |

### Frontend テスト（`packages/frontend/src/`）

| # | 層 | ファイルパス | 新規/変更 | 内容 |
|---|---|---|---|---|
| 20 | Test | `features/attendance/ClockButtons.test.tsx` | 変更 | ダイアログ表示・長押し・メモ付き打刻のテスト |
| 21 | Test | `features/attendance/ClockMemoDialog.test.tsx` | 新規 | プリセット選択・自由入力・空送信のテスト |
| 22 | Test | `features/attendance/MemoDetailDialog.test.tsx` | 新規 | 全文表示・編集・削除のテスト |

## 実装順序

```
Phase 1: DB + Entity + DTO
  #1 → #2 → #3, #4, #5, #6

Phase 2: Backend ロジック（TDD）
  #10 テスト → #7, #8 実装
  #11 テスト → #9 実装

Phase 3: Frontend API + Hooks
  #13 → #14

Phase 4: Frontend UI（TDD）
  #21 テスト → #15 実装
  #22 テスト → #16 実装
  #20 テスト → #17, #18, #19 実装
```
