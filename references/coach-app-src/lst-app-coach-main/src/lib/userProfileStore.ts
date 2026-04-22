import { useSyncExternalStore, useCallback } from "react";

interface CoachProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  level: string;
  rating: number;
  reviewCount: number;
  bio: string;
  specialties: string[];
  certifications: string[];
  totalEarnings: number;
  monthlyEarnings: number;
  bankAccount?: {
    bankName: string;
    branchName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
  };
}

// Preset options
export const SPECIALTY_OPTIONS = [
  "フォアハンド", "バックハンド", "サーブ", "ボレー",
  "ゲーム戦術", "フットワーク", "メンタル強化", "初心者指導",
  "競技向け", "戦術分析", "フィジカル", "ダブルス戦術",
];

export const CERTIFICATION_OPTIONS = [
  "JPA公認S級", "JPA公認A級", "JPA公認B級",
  "元日本代表", "スポーツ心理学修了", "NSCA-CPT",
  "日本体育協会公認コーチ", "救急法認定", "栄養学修了",
  "FIP公認コーチ", "スペインパデル連盟認定",
];

let profile: CoachProfile = {
  name: "田中 太郎",
  email: "tanaka.coach@example.com",
  phone: "090-1234-5678",
  avatar: null,
  level: "S級",
  rating: 4.9,
  reviewCount: 48,
  bio: "パデル歴10年。初心者から上級者まで幅広く指導しています。",
  specialties: ["フォアハンド", "サーブ", "ゲーム戦術", "初心者指導"],
  certifications: ["JPA公認S級", "元日本代表"],
  totalEarnings: 385000,
  monthlyEarnings: 62000,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return profile;
}

export function useUserProfile() {
  const data = useSyncExternalStore(subscribe, getSnapshot);

  const update = useCallback((partial: Partial<CoachProfile>) => {
    profile = { ...profile, ...partial };
    emitChange();
  }, []);

  return { profile: data, updateProfile: update };
}
