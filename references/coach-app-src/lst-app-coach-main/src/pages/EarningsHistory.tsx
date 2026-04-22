import InnerPageLayout from "@/components/InnerPageLayout";
import AnimatedTabs from "@/components/AnimatedTabs";
import { Separator } from "@/components/ui/separator";
import { ArrowDownLeft } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "@/lib/userProfileStore";

interface EarningEntry {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
}

const MOCK_EARNINGS: EarningEntry[] = [
  { id: "1", title: "実践練習", description: "高橋 健一 — サーブ改善", amount: 7500, date: "2026/04/10" },
  { id: "2", title: "オンライン指導", description: "山田 花子 — ルール解説・基本動作", amount: 3000, date: "2026/04/08" },
  { id: "3", title: "動画レビュー", description: "高橋 健一 — ボレー技術の分析", amount: 2000, date: "2026/04/05" },
  { id: "4", title: "実践練習", description: "佐々木 翔 — ゲーム戦術", amount: 7500, date: "2026/03/28" },
  { id: "5", title: "オンライン指導", description: "中村 美咲 — 基礎フォーム解説", amount: 3000, date: "2026/03/20" },
];

const TABS = [
  { key: "all", label: "全部" },
  { key: "practice", label: "実践練習" },
  { key: "online", label: "オンライン" },
  { key: "review", label: "レビュー" },
];

const EarningsHistory = () => {
  const [tab, setTab] = useState("all");
  const { profile } = useUserProfile();

  const filtered = tab === "all"
    ? MOCK_EARNINGS
    : MOCK_EARNINGS.filter((e) => {
        if (tab === "practice") return e.title === "実践練習";
        if (tab === "online") return e.title === "オンライン指導";
        return e.title === "動画レビュー";
      });

  return (
    <InnerPageLayout title="報酬管理">
      {/* Balance */}
      <div className="bg-gray-5 rounded-[8px] px-5 py-4 -mt-2 mb-4">
        <p className="text-xs text-primary-foreground/60 font-medium">累計報酬</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-3xl font-bold text-primary">¥{profile.totalEarnings.toLocaleString()}</span>
        </div>
        <p className="text-xs text-primary-foreground/60 font-medium mt-2">
          今月: ¥{profile.monthlyEarnings.toLocaleString()}
        </p>
      </div>

      {/* Tabs */}
      <div className="-mx-[20px] mb-4">
        <AnimatedTabs tabs={TABS} activeKey={tab} onChange={setTab} />
      </div>

      {/* List */}
      <div className="-mx-[20px]">
        {filtered.map((entry, i) => (
          <div key={entry.id}>
            <div className="flex items-start gap-3 px-[20px] py-3.5">
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-primary/10 text-primary">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{entry.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{entry.date}</p>
              </div>
              <p className="text-sm font-bold text-primary flex-shrink-0">+¥{entry.amount.toLocaleString()}</p>
            </div>
            {i < filtered.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </InnerPageLayout>
  );
};

export default EarningsHistory;
