"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Send, Megaphone } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnnouncementBadge } from "@/components/status-badge";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { ANNOUNCEMENTS } from "@/lib/mock-data";
import type { Announcement, AnnouncementStatus, AnnouncementTarget } from "@/lib/types";
import { relativeTime, formatDate } from "@/lib/utils";

const schema = z.object({
  title: z.string().min(4, "タイトルは 4 文字以上").max(60, "タイトルは 60 文字以内"),
  body: z.string().min(10, "本文は 10 文字以上"),
  target: z.enum(["all", "users", "coaches", "venue-admins"]),
  sendMode: z.enum(["now", "scheduled"]),
  scheduledAt: z.string().optional(),
}).refine(
  (data) => data.sendMode !== "scheduled" || !!data.scheduledAt,
  { message: "配信日時を選択してください", path: ["scheduledAt"] }
);
type FormData = z.infer<typeof schema>;

const TARGET_LABEL: Record<AnnouncementTarget, string> = {
  all: "全員",
  users: "一般利用者",
  coaches: "コーチ",
  "venue-admins": "企業管理者",
};

export default function AnnouncementsPage() {
  const { items, add, hydrated } = useMockCrud<Announcement>(
    MOCK_KEYS.announcements,
    ANNOUNCEMENTS
  );
  const [filter, setFilter] = useState<"all" | AnnouncementStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preview, setPreview] = useState<Announcement | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      target: "all",
      sendMode: "now",
      scheduledAt: "",
    },
  });

  const filtered = useMemo(() => {
    return items.filter((a) => filter === "all" || a.status === filter);
  }, [items, filter]);

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500));
    const now = new Date().toISOString();
    const newItem: Announcement = {
      id: `ann-${Date.now()}`,
      title: data.title,
      body: data.body,
      target: data.target as AnnouncementTarget,
      status: data.sendMode === "now" ? "sent" : "scheduled",
      sentAt: data.sendMode === "now" ? now : undefined,
      scheduledAt: data.sendMode === "scheduled" ? data.scheduledAt : undefined,
      author: "LST プラットフォーム管理者",
      createdAt: now,
    };
    add(newItem);
    toast.success(
      data.sendMode === "now"
        ? `お知らせを配信しました：${data.title}`
        : `お知らせを予約しました：${formatDate(data.scheduledAt!, true)}`
    );
    form.reset();
    setDialogOpen(false);
  };

  if (!hydrated) return null;

  const sendMode = form.watch("sendMode");

  return (
    <PageShell
      title="お知らせ配信"
      description="お知らせ作成・配信予約・対象を指定した配信"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "お知らせ配信" }]}
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          新規お知らせ
        </Button>
      }
    >
      <Section
        actions={
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-36 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="draft">下書き</SelectItem>
              <SelectItem value="scheduled">予約送信</SelectItem>
              <SelectItem value="sent">送信済み</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="お知らせはまだありません"
            description="最初のお知らせを作成して利用者・コーチ・企業管理者に配信しましょう"
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" /> 新規お知らせ
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>配信 KPI</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>送信 / 予約</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const readRate =
                  a.reachedCount && a.reachedCount > 0
                    ? Math.round(((a.readCount ?? 0) / a.reachedCount) * 100)
                    : 0;
                const clickRate =
                  a.readCount && a.readCount > 0
                    ? Math.round(((a.clickCount ?? 0) / a.readCount) * 100)
                    : 0;
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      <div>{a.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-md">
                        {a.body}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{TARGET_LABEL[a.target]}</Badge>
                    </TableCell>
                    <TableCell>
                      {a.status === "sent" ? (
                        <div className="text-xs space-y-0.5">
                          <div>
                            送達{" "}
                            <strong>
                              {(a.reachedCount ?? 0).toLocaleString()}
                            </strong>
                          </div>
                          <div className="text-muted-foreground">
                            既読 {readRate}% · クリック {clickRate}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AnnouncementBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {a.sentAt
                        ? relativeTime(a.sentAt)
                        : a.scheduledAt
                        ? `予定 ${formatDate(a.scheduledAt, true)}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreview(a)}
                      >
                        プレビュー
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 新規お知らせ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>新規お知らせ</DialogTitle>
            <DialogDescription>
              プッシュ通知で配信し、アプリ内のお知らせ一覧にも保存されます。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>タイトル（4-60 文字）</Label>
              <Input
                {...form.register("title")}
                placeholder="例：ゴールデンウィーク営業時間のご案内"
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label required>本文</Label>
              <Textarea
                rows={5}
                {...form.register("body")}
                placeholder="お知らせの内容..."
              />
              {form.formState.errors.body && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.body.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>配信対象</Label>
                <Select
                  value={form.watch("target")}
                  onValueChange={(v) => form.setValue("target", v as AnnouncementTarget)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全員</SelectItem>
                    <SelectItem value="users">一般利用者</SelectItem>
                    <SelectItem value="coaches">コーチ</SelectItem>
                    <SelectItem value="venue-admins">企業管理者</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label required>配信タイミング</Label>
                <Select
                  value={form.watch("sendMode")}
                  onValueChange={(v) => form.setValue("sendMode", v as "now" | "scheduled")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">即時配信</SelectItem>
                    <SelectItem value="scheduled">予約配信</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {sendMode === "scheduled" && (
              <div className="grid gap-1.5">
                <Label required>配信日時</Label>
                <Input type="datetime-local" {...form.register("scheduledAt")} />
                {form.formState.errors.scheduledAt && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.scheduledAt.message}
                  </p>
                )}
              </div>
            )}

            {/* プレビュー */}
            <div className="rounded-md border bg-muted/40 p-4">
              <div className="text-xs font-medium text-muted-foreground mb-2">
                配信プレビュー
              </div>
              <div className="text-sm font-medium">
                {form.watch("title") || "（タイトルを入力してください）"}
              </div>
              <div className="text-xs text-muted-foreground mt-1 line-clamp-3">
                {form.watch("body") || "（本文を入力してください）"}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">
                → {TARGET_LABEL[form.watch("target")]}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                <Send className="w-4 h-4" />
                {sendMode === "now" ? "即時配信" : "予約配信"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 既存お知らせのプレビュー */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent size="md">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle>{preview.title}</DialogTitle>
                <DialogDescription>
                  {TARGET_LABEL[preview.target]} ·{" "}
                  {preview.sentAt ? `送信済み · ${formatDate(preview.sentAt, true)}` : ""}
                  {preview.scheduledAt
                    ? `予約日時 · ${formatDate(preview.scheduledAt, true)}`
                    : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="text-sm leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-md p-3">
                {preview.body}
              </div>

              {preview.status === "sent" && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    配信 KPI
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-semibold">
                        {(preview.reachedCount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        送達数
                      </div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-semibold text-success">
                        {(preview.readCount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        既読数（
                        {preview.reachedCount && preview.reachedCount > 0
                          ? Math.round(
                              ((preview.readCount ?? 0) /
                                preview.reachedCount) *
                                100
                            )
                          : 0}
                        %）
                      </div>
                    </div>
                    <div className="border rounded-md p-3 text-center">
                      <div className="text-2xl font-semibold text-primary">
                        {(preview.clickCount ?? 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        クリック数（
                        {preview.readCount && preview.readCount > 0
                          ? Math.round(
                              ((preview.clickCount ?? 0) / preview.readCount) *
                                100
                            )
                          : 0}
                        %）
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreview(null)}>
                  閉じる
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
