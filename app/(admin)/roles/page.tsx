"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Lock, Info } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { ADMIN_ROLES, ADMIN_ACCOUNTS } from "@/lib/mock-data";
import type { AdminRole, PermissionKey } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 権限カテゴリ構造（表示グルーピング用）*/
const PERMISSION_GROUPS: {
  label: string;
  permissions: { key: PermissionKey; label: string }[];
}[] = [
  {
    label: "会員・加盟店",
    permissions: [
      { key: "user.read", label: "会員閲覧" },
      { key: "user.write", label: "会員編集" },
      { key: "user.suspend", label: "会員停止" },
      { key: "user.points_adjust", label: "ポイント調整" },
      { key: "venue.read", label: "企業閲覧" },
      { key: "venue.write", label: "企業編集" },
      { key: "venue.suspend", label: "企業停止" },
    ],
  },
  {
    label: "コーチ",
    permissions: [
      { key: "coach.read", label: "コーチ閲覧" },
      { key: "coach.write", label: "コーチ編集" },
      { key: "coach.approve", label: "コーチ審査" },
      { key: "coach.suspend", label: "コーチ停止" },
    ],
  },
  {
    label: "予約・施設",
    permissions: [
      { key: "booking.read", label: "予約閲覧" },
      { key: "booking.approve_reschedule", label: "振替審査" },
      { key: "booking.refund", label: "返金処理" },
      { key: "court.read", label: "コート閲覧" },
      { key: "court.write", label: "コート編集" },
      { key: "equipment.read", label: "備品閲覧" },
      { key: "equipment.write", label: "備品編集" },
    ],
  },
  {
    label: "財務",
    permissions: [
      { key: "finance.read", label: "売上閲覧" },
      { key: "finance.export", label: "CSV エクスポート" },
      { key: "payout.retry", label: "出金エラー再送" },
      { key: "commission.write", label: "手数料設定変更" },
    ],
  },
  {
    label: "クーポン・ポイント",
    permissions: [
      { key: "coupon.read", label: "クーポン閲覧" },
      { key: "coupon.write", label: "クーポン作成・編集" },
      { key: "coupon.distribute", label: "クーポン配布" },
      { key: "points.read", label: "ポイント閲覧" },
      { key: "points.write", label: "ルール編集" },
      { key: "points.adjust", label: "手動調整" },
    ],
  },
  {
    label: "お知らせ・キャンペーン",
    permissions: [
      { key: "announcement.read", label: "お知らせ閲覧" },
      { key: "announcement.write", label: "お知らせ作成" },
      { key: "announcement.send", label: "配信実行" },
      { key: "campaign.read", label: "キャンペーン閲覧" },
      { key: "campaign.write", label: "キャンペーン編集" },
    ],
  },
  {
    label: "スタッフ・シフト",
    permissions: [
      { key: "staff.read", label: "スタッフ閲覧" },
      { key: "staff.write", label: "スタッフ編集" },
      { key: "shift.read", label: "シフト閲覧" },
      { key: "shift.write", label: "シフト編集" },
    ],
  },
  {
    label: "システム・管理",
    permissions: [
      { key: "settings.read", label: "システム設定閲覧" },
      { key: "settings.write", label: "システム設定変更" },
      { key: "account.read", label: "アカウント閲覧" },
      { key: "account.write", label: "アカウント招待・編集" },
      { key: "role.write", label: "ロール編集" },
      { key: "audit.read", label: "監査ログ閲覧" },
    ],
  },
];

export default function RolesPage() {
  const { items, hydrated } = useMockCrud<AdminRole>(
    MOCK_KEYS.adminRoles,
    ADMIN_ROLES
  );
  const [scope, setScope] = useState<"lst" | "venue">("lst");

  const accountCountByRole = useMemo(() => {
    const map: Record<string, number> = {};
    ADMIN_ACCOUNTS.forEach((a) => {
      map[a.roleKey] = (map[a.roleKey] ?? 0) + 1;
    });
    return map;
  }, []);

  const scopedRoles = items.filter((r) => r.scope === scope);

  if (!hydrated) return null;

  return (
    <PageShell
      title="権限・ロール"
      description="管理者ロールの権限構成を定義。各ロールに割り当てられる権限の一覧を表示します。"
      breadcrumbs={[{ label: "システム" }, { label: "権限・ロール" }]}
    >
      <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground leading-relaxed">
          プロトタイプでは <strong>7 つの標準ロール</strong>{" "}
          を提供しています（LST 側 4・企業側 3）。本番版では「カスタムロール作成」「権限の細かい ON/OFF 調整」も対応予定です。
          標準ロールは<strong>削除不可</strong>、権限変更はロール単位のプリセットから選択可能。
        </div>
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as "lst" | "venue")}>
        <TabsList>
          <TabsTrigger value="lst">
            LST 運営側 <Badge variant="muted" className="ml-2">{items.filter((r) => r.scope === "lst").length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="venue">
            企業側 <Badge variant="muted" className="ml-2">{items.filter((r) => r.scope === "venue").length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={scope}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scopedRoles.map((role) => {
              const permSet = new Set(role.permissions);
              const usedCount = accountCountByRole[role.key] ?? 0;
              return (
                <Card key={role.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-5 border-b bg-muted/30">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold">{role.label}</div>
                            <div className="text-xs text-muted-foreground">
                              <code className="font-mono">{role.key}</code>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {role.builtin && (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="w-3 h-3" />
                              標準
                            </Badge>
                          )}
                          <Badge variant="muted">{usedCount} 名</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    {/* Permissions grid */}
                    <div className="p-5">
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-3">
                        付与権限（{role.permissions.length} 項目）
                      </div>
                      <div className="space-y-3">
                        {PERMISSION_GROUPS.map((group) => {
                          const inGroup = group.permissions.filter((p) =>
                            permSet.has(p.key)
                          );
                          if (inGroup.length === 0) return null;
                          return (
                            <div key={group.label}>
                              <div className="text-[10px] font-medium text-muted-foreground mb-1">
                                {group.label}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {inGroup.map((p) => (
                                  <span
                                    key={p.key}
                                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                                  >
                                    {p.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground">
                        作成：{role.createdAt}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={role.builtin}
                        onClick={() =>
                          toast.info("カスタムロール編集は本番版で対応予定")
                        }
                      >
                        権限を調整
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* 権限マトリクス表（全ロール横断）*/}
      <Section
        title="権限マトリクス（比較表）"
        description={`${scope === "lst" ? "LST" : "企業"}側ロールの権限比較`}
        className="mt-6"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="text-left px-3 py-2 font-medium sticky left-0 bg-muted/30 z-10">
                  権限
                </th>
                {scopedRoles.map((r) => (
                  <th key={r.id} className="px-3 py-2 font-medium text-center">
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_GROUPS.flatMap((g) =>
                g.permissions.map((p) => ({ group: g.label, ...p }))
              ).map((p, idx, arr) => {
                const showGroupHeader =
                  idx === 0 || arr[idx - 1].group !== p.group;
                return (
                  <>
                    {showGroupHeader && (
                      <tr key={`h-${p.key}`} className="bg-muted/10">
                        <td
                          colSpan={scopedRoles.length + 1}
                          className="px-3 py-1.5 font-medium text-[10px] uppercase tracking-wider text-muted-foreground"
                        >
                          {p.group}
                        </td>
                      </tr>
                    )}
                    <tr key={p.key} className="border-b last:border-b-0">
                      <td className="px-3 py-1.5 sticky left-0 bg-white">
                        {p.label}
                      </td>
                      {scopedRoles.map((r) => (
                        <td key={r.id} className="px-3 py-1.5 text-center">
                          <span
                            className={cn(
                              "inline-block w-4 h-4 rounded-full",
                              r.permissions.includes(p.key)
                                ? "bg-success"
                                : "bg-muted"
                            )}
                          />
                        </td>
                      ))}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </PageShell>
  );
}
