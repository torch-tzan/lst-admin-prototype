# Decision Log

## 2026-04-22 — 幣別沿用 ¥（日圓）
**Decision:** Admin 後台沿用 ¥ 符號與日文場館/教練名
**Reason:** 兩顆 C 端 app 都是日本 padel 場景（広島），Tina 確認沿用原 code
**Alternatives rejected:** NT$（不合目標市場情境）、兩者都支援（prototype 階段 overkill）

---

## 2026-04-22 — UI 不用 Untitled UI 免費版，改自組 shadcn-style
**Decision:** 用 Radix primitives + Tailwind 自組 UI kit
**Reason:** Untitled UI 免費版元件不完整，複製整套費時；兩顆來源 app 都是 shadcn 風格，一致性更好
**Alternatives rejected:** 整合 Untitled UI Pro（授權疑慮）、shadcn CLI（會多一次設定步驟）

---

## 2026-04-22 — 「定稿級」10 頁全做，不砍
**Decision:** 全部 10 頁都做到列表+至少 1 個寫入操作+表單驗證
**Reason:** Tina 明確表示客戶要能「逐頁確認到定稿程度」，不是純 demo
**Alternatives rejected:** 3+3 主線深度做、2+2 高完成度

---

## 2026-04-22 — localStorage 當假後端
**Decision:** 以 `useMockCrud` hook + localStorage 持久化，不做真 API
**Reason:** prototype 階段不需要後端；改動可跨 session 保留、方便客戶自己玩
**Alternatives rejected:** 真的起 Supabase（浪費時間）、純記憶體（客戶重整就消失）
