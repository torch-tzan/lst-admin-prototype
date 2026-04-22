"use client";

import { useMemo, useState } from "react";
import { Search, History, Download, Shield } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { AUDIT_LOGS, ADMIN_ROLES } from "@/lib/mock-data";
import type { AuditLogEntry, AuditActionCategory } from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/utils";

const CATEGORY_LABEL: Record<AuditActionCategory, string> = {
  auth: "認証",
  user: "会員",
  venue: "企業",
  coach: "コーチ",
  booking: "予約",
  finance: "財務",
  settings: "システム",
  announce: "お知らせ",
  coupon: "クーポン",
  staff: "スタッフ",
  account: "アカウント",
};

const CATEGORY_COLOR: Record<
  AuditActionCategory,
  "default" | "success" | "warning" | "destructive" | "secondary" | "muted"
> = {
  auth: "secondary",
  user: "default",
  venue: "default",
  coach: "success",
  booking: "default",
  finance: "warning",
  settings: "destructive",
  announce: "default",
  coupon: "success",
  staff: "secondary",
  account: "destructive",
};

export default function AuditLogPage() {
  const { user } = useAuth();
  const { items, hydrated } = useMockCrud<AuditLogEntry>(
    MOCK_KEYS.auditLog,
    AUDIT_LOGS
  );
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | AuditActionCategory
  >("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">(
    "week"
  );

  const isLst = user?.role === "lst-admin";

  const scopedLogs = useMemo(() => {
    if (isLst) return items;
    return items.filter((l) => l.scopeVenueId === user?.venueId);
  }, [items, user, isLst]);

  const actors = useMemo(
    () => Array.from(new Set(scopedLogs.map((l) => l.actorName))),
    [scopedLogs]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return scopedLogs
      .filter((l) => {
        if (categoryFilter !== "all" && l.category !== categoryFilter) return false;
        if (actorFilter !== "all" && l.actorName !== actorFilter) return false;

        const age = now - new Date(l.createdAt).getTime();
        if (dateFilter === "today" && age > 86400000) return false;
        if (dateFilter === "week" && age > 7 * 86400000) return false;
        if (dateFilter === "month" && age > 30 * 86400000) return false;

        if (
          q &&
          !`${l.actorName}${l.summary}${l.targetLabel}${l.action}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [scopedLogs, q, categoryFilter, actorFilter, dateFilter]);

  const stats = useMemo(() => {
    const now = Date.now();
    const todayCount = scopedLogs.filter(
      (l) => now - new Date(l.createdAt).getTime() <= 86400000
    ).length;
    const weekCount = scopedLogs.filter(
      (l) => now - new Date(l.createdAt).getTime() <= 7 * 86400000
    ).length;
    const sensitiveCount = scopedLogs.filter(
      (l) => l.category === "settings" || l.category === "finance" || l.category === "account"
    ).length;
    return { todayCount, weekCount, sensitiveCount, total: scopedLogs.length };
  }, [scopedLogs]);

  const roleMap = useMemo(
    () => Object.fromEntries(ADMIN_ROLES.map((r) => [r.key, r])),
    []
  );

  if (!hydrated) return null;

  return (
    <PageShell
      title="監査ログ"
      description={
        isLst
          ? "全管理者の操作履歴を記録。財務・システム設定・アカウント変更などの機微な操作を重点追跡します。"
          : "当企業に関わる操作の履歴。コンプライアンス監査や不正追跡のためのログです。"
      }
      breadcrumbs={[
        { label: isLst ? "システム" : "会員/アカウント" },
        { label: "監査ログ" },
      ]}
      actions={
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4" />
          CSV エクスポート
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">本日の操作</div>
          <div className="text-2xl font-bold mt-1">{stats.todayCount}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">今週の操作</div>
          <div className="text-2xl font-bold mt-1">{stats.weekCount}</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">機微操作</div>
          <div className="text-2xl font-bold text-destructive mt-1">
            {stats.sensitiveCount}
          </div>
          <div className="text-[10px] text-muted-foreground">財務 / 設定 / アカウント</div>
        </div>
        <div className="bg-card border rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground">総記録数</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground">保持期間：1 年</div>
        </div>
      </div>

      <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-xs flex items-start gap-2">
        <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground leading-relaxed">
          すべての管理者操作はタイムスタンプ・IP・User Agent 付きで記録されます。
          ログは<strong>改ざん不可</strong>・<strong>1 年間保持</strong>。補助申請・監査対応に利用可能です。
        </div>
      </div>

      <Section
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="操作者 / 対象 / アクションで検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-60 h-8 text-xs"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) =>
                setCategoryFilter(v as typeof categoryFilter)
              }
            >
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全カテゴリ</SelectItem>
                {(Object.entries(CATEGORY_LABEL) as [
                  AuditActionCategory,
                  string
                ][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actorFilter} onValueChange={setActorFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全操作者</SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={dateFilter}
              onValueChange={(v) => setDateFilter(v as typeof dateFilter)}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">本日</SelectItem>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="month">今月</SelectItem>
                <SelectItem value="all">全期間</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon={History} title="該当する操作履歴はありません" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日時</TableHead>
                <TableHead>操作者</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>内容</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs">
                    <div>{formatDate(l.createdAt, true)}</div>
                    <div className="text-muted-foreground">
                      {relativeTime(l.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm">{l.actorName}</div>
                    <div className="text-xs text-muted-foreground">
                      {roleMap[l.actorRoleKey]?.label ?? l.actorRoleKey}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={CATEGORY_COLOR[l.category]}>
                      {CATEGORY_LABEL[l.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{l.summary}</div>
                    <code className="text-[10px] text-muted-foreground font-mono">
                      {l.action}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">{l.targetLabel}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {l.targetType}:{l.targetId}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {l.ipAddress}
                    <div className="text-[10px] truncate max-w-[120px]">
                      {l.userAgent}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>
    </PageShell>
  );
}
