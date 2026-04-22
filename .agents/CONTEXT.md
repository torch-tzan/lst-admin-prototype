# 專案內部脈絡（Agent 用）

## 目的
LST 客戶的跨 app 管理後台 **互動 prototype**。不是真產品，是客戶對齊需求的工具。

## 關鍵限制
- 只做前端，localStorage 模擬一切
- 10 個主要頁面都需要互動到「能對需求做定稿確認」的程度
- 幣別沿用 ¥（兩顆 app 都是）
- 使用者資料沿用日文（広島 padel 場景），UI chrome 用繁中

## 資料模型關鍵關聯
- Coach.venueIds[] 是多對多 → 教練可駐多家場館
- Booking.venueId 是資料範圍的 gate
- Review.targetType + targetId 可指向 coach 或 venue
- Match 與場館綁定但不限定場地
- 權限邏輯集中在 `lib/permissions.ts` 的 `isScopedVenue()` 與 `getNavFor()`

## 設計決策
- 沒有採用 Untitled UI 原始版，改用自己組 shadcn-風格元件（Radix primitives + Tailwind），因為 Untitled UI 免費版元件不完整、免費授權下複製整套費時
- 所有表單用 RHF + Zod，統一風格
- DataTable 都是手刻，沒用 @tanstack/table（prototype 不需要 sorting/pagination）
- LST admin dashboard 與 venue admin dashboard 做成兩個元件，不強行統一

## 下一輪（v2）待辦
- 接 Supabase：Auth + schema 設計 + RLS policy
- 與兩顆 app 共用 DB schema
- RWD 手機版
- 財務報表（目前只做 KPI 卡）
- 場館內部溝通管道（目前沒做）
- 真的推播整合（FCM / APNs）
