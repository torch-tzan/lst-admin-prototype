# 案件背景

## 客戶：LST
日本広島的 padel 課程與場館預約平台。目前已有兩顆 C 端 app 在運作（皆為 React + Vite + shadcn 原型級實作）：

- **User App**：一般用戶訂場地、預約教練、組隊打週賽
- **Coach App**：教練接課、管理排班、收款、回覆評價

兩顆 app 目前都用 localStorage 模擬後端，尚未接真後端。

## 本案定位

LST 需要一個**跨 app 的管理後台**做平台營運。本案只做「**互動 prototype**」，作為客戶對齊需求的工具，不做真後端。

交付形式：可在本機 `pnpm dev` 運行的 Next.js 應用。

## 兩種角色

- **LST 平台管理員**：整個平台的 super admin，管理場館、教練、賽事、推播
- **場館管理員**：每個場館一個，只能看自己場館的預約、設備、教練、評價

## 時程

- 明早（2026-04-23）客戶會議初版對齊
- v2：根據客戶回饋調整後，才接真 Supabase 後端

## 反推來源

- `references/user-app/` → `/Users/tinatzan/Projects/clients/2026-04-lst-userapp` (symlink)
- `references/coach-app-src/lst-app-coach-main/` → 從 `~/Downloads/lst-app-coach-main (1).zip` 解壓

兩顆 app 的 `src/lib/*.ts`（bookingStore、coachData、courtData、lessonStore 等）是主要的欄位與 flow 反推來源。
