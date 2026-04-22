# LST 運営管理ダッシュボード

LST パデルプラットフォーム統合管理システム。設計師 mockup の構造に準拠した完全版。

## 起動

```bash
pnpm install
pnpm dev
# http://localhost:3000
```

## ロール & テストアカウント

| アカウント | ロゴ | ロール | 範囲 |
|------|------|------|------|
| 運営管理者 | LST 運営管理 | `lst-admin` | 全企業 / 全会員 / 財務 / システム設定 |
| パデルコート広島 企業管理者 | ADMIN | `venue-admin` (v1) | 当企業限定 |
| 北広島パデルクラブ 企業管理者 | ADMIN | `venue-admin` (v2) | 当企業限定 |

---

## ナビ構造（設計師 mockup 準拠）

### 運営管理者（LST）
**メイン**: ダッシュボード・会員管理・企業管理・コート管理・予約管理
**売上/決済**: 売上管理・支払い履歴
**お知らせ/イベント**: お知らせ配信・キャンペーン・イベント管理
**システム**: システム設定・手数料設定
**コーチング/ゲーム**: コーチ管理・クーポン管理・ポイント管理

### 企業管理者
**会員/アカウント**: 会員管理・アカウント招待
**施設/予約**: コート管理・予約管理・備品レンタル
**売上/決済**: 売上管理・支払い履歴
**スタッフ/勤務**: スタッフ管理・シフト管理
**お知らせ/イベント**: お知らせ配信・キャンペーン・イベント管理
**コーチング/ゲーム**: コーチ管理・クーポン管理・企業コーチ

---

## 全 20 ページ

| Path | 説明 | ロール |
|------|------|--------|
| `/dashboard` | KPI + 月次推移チャート + 企業別 ranking + 活動 log | 両方 |
| `/venues` | 企業（加盟店）CRUD | LST |
| `/users` | 会員管理（ポイント調整・停止・予約履歴） | LST |
| `/coaches` | コーチ審査（承認/却下/停止） | 両方 |
| `/sales` | 売上分析（期間・企業・レッスン別） | 両方 |
| `/payments` | Stripe 取引ログ（エラー再送） | 両方 |
| `/commission` | 手数料設定（default + 企業/コーチ override） | LST |
| `/coupons` | クーポン配布（絞り込み条件 or ホワイトリスト） | 両方 |
| `/points` | 積分ルール CRUD + 履歴 + 手動調整 | LST |
| `/announcements` | お知らせ配信（送達/既読/クリック KPI） | 両方 |
| `/campaigns` | キャンペーン・イベント管理（大会/レッスン/販促/交流会） | 両方 |
| `/settings` | システム設定（Stripe/通貨/メンテナンス） | LST |
| `/bookings` | 予約管理（振替審査・返金） | 両方 |
| `/courts` | コート CRUD + 時間帯グリッド | 両方 |
| `/equipment` | 備品レンタル CRUD + 在庫警告 | 企業 |
| `/venue-coaches` | 企業所属コーチ + レビュー対応 | 企業 |
| `/staff` | スタッフ管理（役職/稼働状態） | 企業 |
| `/shifts` | シフト管理（週次カレンダー） | 企業 |
| `/invites` | アカウント招待（リンク発行/再送/取消） | 企業 |

---

## 視覚設計

設計師 mockup 準拠：

- **深色サイドバー**（slate-900、LST: "LST 運営管理" ロゴ / 企業: "ADMIN" ロゴ）
- **Top Header**（ページタイトル + 通知ベル + アバター + ログアウト）
- **大型 KPI カード**（¥12,850,000 級の数字 + 前月比）
- **月次売上 12 ヶ月 柱状チャート**
- **企業別売上ランキング**（Top 5 + 順位マーカー）
- **活動ログテーブル**（日時 / 企業 / 内容 / ステータス / 金額）
- **ポイント統計浮動カード**（左下紫色）
- **Emoji アイコン KPI**（企業側 dashboard の 🎾🧑‍💼🏆🎮）

---

## Stripe Connect ロジック

```
利用者支払額
  - コート費（企業）
  - プラットフォーム手数料（commission 設定）
  - 企業手数料（commission 設定）
  - Stripe 手数料（3.6% + ¥40）
  = コーチ取り分 → Stripe Transfer 自動送金
```

取引単位で処理。月次バッチなし。

## クーポン配布ロジック

ユーザー側での領取機能は**なし**。管理者が以下のいずれかで配布：

1. **条件絞り込み**：最終ログイン / 累計利用額 / タグ / 新規登録期間
2. **ホワイトリスト**：特定会員を選択（checkbox）

---

## 技術スタック

Next.js 14 App Router · TypeScript · Tailwind · Radix UI · React Hook Form · Zod · sonner · localStorage（mock auth + CRUD）

## ディレクトリ

```
app/
  (admin)/
    dashboard/
    venues/ users/ coaches/
    sales/ payments/
    commission/ coupons/ points/
    announcements/ campaigns/
    settings/
    bookings/ courts/ equipment/
    venue-coaches/
    staff/ shifts/ invites/
components/
  ui/              # 基礎 UI
  sidebar.tsx      # 深色サイドバー
  top-header.tsx   # Header bar
  bar-chart.tsx    # 月次チャート
  page-shell.tsx
  status-badge.tsx
lib/
  types.ts         # 全ドメイン型
  auth.tsx / permissions.ts
  mock-data/seed.ts
  use-mock-crud.ts
```
