"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * 以 localStorage 持久化資源狀態的假 CRUD hook。
 * 初始資料 = seed；之後的變更都存 localStorage，重整不會掉。
 * 支援「重置」以恢復 seed。
 */
export function useMockCrud<T extends { id: string }>(
  storageKey: string,
  seed: T[]
) {
  const [items, setItems] = useState<T[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        setItems(JSON.parse(raw));
      } else {
        localStorage.setItem(storageKey, JSON.stringify(seed));
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const persist = useCallback(
    (next: T[]) => {
      setItems(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
    },
    [storageKey]
  );

  const add = useCallback(
    (item: T) => {
      persist([item, ...items]);
    },
    [items, persist]
  );

  const update = useCallback(
    (id: string, patch: Partial<T>) => {
      persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    },
    [items, persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(items.filter((i) => i.id !== id));
    },
    [items, persist]
  );

  const reset = useCallback(() => {
    persist(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, seed]);

  return { items, add, update, remove, reset, hydrated, setAll: persist };
}

/**
 * 一次重置所有 mock 資料（登入頁或 dev 工具用）
 */
export function resetAllMockData(keys: string[]) {
  keys.forEach((k) => localStorage.removeItem(k));
}

export const MOCK_KEYS = {
  venues: "lst-mock-venues-v1",
  courts: "lst-mock-courts-v1",
  equipment: "lst-mock-equipment-v1",
  coaches: "lst-mock-coaches-v1",
  bookings: "lst-mock-bookings-v1",
  reviews: "lst-mock-reviews-v1",
  matches: "lst-mock-matches-v1",
  announcements: "lst-mock-announcements-v1",
  members: "lst-mock-members-v1",
  pointsLogs: "lst-mock-points-logs-v1",
  pointsRules: "lst-mock-points-rules-v1",
  coupons: "lst-mock-coupons-v1",
  commission: "lst-mock-commission-v1",
  earnings: "lst-mock-earnings-v1",
  messageThreads: "lst-mock-msg-threads-v1",
  videoReviews: "lst-mock-video-reviews-v1",
  staff: "lst-mock-staff-v1",
  shifts: "lst-mock-shifts-v1",
  invites: "lst-mock-invites-v1",
  campaigns: "lst-mock-campaigns-v1",
  systemSettings: "lst-mock-settings-v1",
  adminAccounts: "lst-mock-admin-accounts-v1",
  adminRoles: "lst-mock-admin-roles-v1",
  auditLog: "lst-mock-audit-log-v1",
};
