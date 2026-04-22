"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Percent, Info } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
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
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { COMMISSION_RULES, VENUES } from "@/lib/mock-data";
import type { CommissionRule } from "@/lib/types";

const schema = z
  .object({
    scope: z.enum(["platform_default", "venue_override", "coach_override"]),
    venueId: z.string().optional(),
    coachId: z.string().optional(),
    courtPlatformRate: z.number().min(0).max(100),
    courtVenueRate: z.number().min(0).max(100),
    lessonPlatformRate: z.number().min(0).max(100),
    lessonVenueRate: z.number().min(0).max(100),
    validFrom: z.string().min(1, "開始日を指定"),
    validTo: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((d) => d.courtPlatformRate + d.courtVenueRate <= 100, {
    message: "コート側：プラットフォーム + 企業 は 100% 以下",
    path: ["courtPlatformRate"],
  })
  .refine((d) => d.lessonPlatformRate + d.lessonVenueRate <= 100, {
    message: "レッスン側：プラットフォーム + 企業 は 100% 以下（残りがコーチ取り分）",
    path: ["lessonPlatformRate"],
  })
  .refine(
    (d) => d.scope === "platform_default" || !!d.venueId || !!d.coachId,
    { message: "override 設定は企業 or コーチを指定", path: ["venueId"] }
  );

type FormData = z.infer<typeof schema>;

export default function CommissionPage() {
  const { items, add, update, remove, hydrated } = useMockCrud<CommissionRule>(
    MOCK_KEYS.commission,
    COMMISSION_RULES
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CommissionRule | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      scope: "venue_override",
      venueId: "",
      coachId: "",
      courtPlatformRate: 15,
      courtVenueRate: 85,
      lessonPlatformRate: 20,
      lessonVenueRate: 10,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: "",
      note: "",
    },
  });

  const defaultRule = items.find((r) => r.scope === "platform_default");
  const overrides = items.filter((r) => r.scope !== "platform_default");

  const openNew = () => {
    setEditing(null);
    form.reset({
      scope: "venue_override",
      venueId: "",
      coachId: "",
      courtPlatformRate: defaultRule?.courtPlatformRate ?? 15,
      courtVenueRate: defaultRule?.courtVenueRate ?? 85,
      lessonPlatformRate: defaultRule?.lessonPlatformRate ?? 20,
      lessonVenueRate: defaultRule?.lessonVenueRate ?? 10,
      validFrom: new Date().toISOString().slice(0, 10),
      validTo: "",
      note: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (r: CommissionRule) => {
    setEditing(r);
    form.reset({
      scope: r.scope,
      venueId: r.venueId ?? "",
      coachId: r.coachId ?? "",
      courtPlatformRate: r.courtPlatformRate,
      courtVenueRate: r.courtVenueRate,
      lessonPlatformRate: r.lessonPlatformRate,
      lessonVenueRate: r.lessonVenueRate,
      validFrom: r.validFrom,
      validTo: r.validTo ?? "",
      note: r.note ?? "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, {
        ...data,
        venueId: data.venueId || undefined,
        coachId: data.coachId || undefined,
        validTo: data.validTo || undefined,
        note: data.note || undefined,
      });
      toast.success("設定を更新しました");
    } else {
      add({
        id: `cm-${Date.now()}`,
        ...data,
        venueId: data.venueId || undefined,
        coachId: data.coachId || undefined,
        validTo: data.validTo || undefined,
        note: data.note || undefined,
      });
      toast.success("新しい手数料設定を追加しました");
    }
    setDialogOpen(false);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="手数料設定"
      description="プラットフォーム・企業・Stripe の手数料配分を管理します。レッスン収益の残余分がコーチの取り分になります。"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "手数料設定" }]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          Override 追加
        </Button>
      }
    >
      <div className="mb-5 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-sm flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div>
          <div className="font-medium mb-1">手数料の計算ロジック</div>
          <div className="text-muted-foreground leading-relaxed">
            コート予約：利用者支払額 → コート費 (企業) + プラットフォーム手数料。
            コーチレッスン：(支払額 - コート費) の中から プラットフォーム + 企業 + Stripe を控除し、残りをコーチへ自動送金。
            企業 / コーチ単位で override が可能です。
          </div>
        </div>
      </div>

      {/* デフォルト設定 */}
      {defaultRule && (
        <Section
          title="デフォルト手数料"
          description="override が設定されていない企業・コーチに適用されます"
        >
          <div className="grid grid-cols-2 gap-0 border-t">
            <div className="p-5 border-r">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                コート予約（Gross 基準）
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">プラットフォーム</span>
                  <span className="font-semibold">
                    {defaultRule.courtPlatformRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">企業</span>
                  <span className="font-semibold">
                    {defaultRule.courtVenueRate}%
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                レッスン収益分配
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">プラットフォーム</span>
                  <span className="font-semibold">
                    {defaultRule.lessonPlatformRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">企業</span>
                  <span className="font-semibold">
                    {defaultRule.lessonVenueRate}%
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm">コーチ（残余）</span>
                  <span className="font-bold text-success">
                    {100 - defaultRule.lessonPlatformRate - defaultRule.lessonVenueRate}
                    %
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  ＊ Stripe 3.6% + ¥40 は別途控除
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              適用開始：{defaultRule.validFrom}
              {defaultRule.note && ` · ${defaultRule.note}`}
            </div>
            <Button variant="ghost" size="sm" onClick={() => openEdit(defaultRule)}>
              編集
            </Button>
          </div>
        </Section>
      )}

      {/* Override 一覧 */}
      <Section
        title="個別 Override 設定"
        description={`${overrides.length} 件の特別ルール`}
        className="mt-5"
      >
        {overrides.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Override 設定はまだありません
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>種別</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>コート (P/V)</TableHead>
                <TableHead>レッスン (P/V/C)</TableHead>
                <TableHead>適用期間</TableHead>
                <TableHead>備考</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overrides.map((r) => {
                const venue = r.venueId ? VENUES.find((v) => v.id === r.venueId) : undefined;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Badge
                        variant={r.scope === "venue_override" ? "default" : "secondary"}
                      >
                        {r.scope === "venue_override" ? "企業" : "コーチ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {venue?.name ?? r.coachId ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.courtPlatformRate}% / {r.courtVenueRate}%
                    </TableCell>
                    <TableCell className="text-sm">
                      {r.lessonPlatformRate}% / {r.lessonVenueRate}% /{" "}
                      <span className="text-success font-medium">
                        {100 - r.lessonPlatformRate - r.lessonVenueRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {r.validFrom}
                      {r.validTo && ` ~ ${r.validTo}`}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-xs">
                      {r.note ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(r)}
                        >
                          編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm(`この override を削除しますか？`)) {
                              remove(r.id);
                              toast.success("削除しました");
                            }
                          }}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Section>

      {/* 新規/編集 dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "手数料設定を編集" : "手数料設定を追加"}
            </DialogTitle>
            <DialogDescription>
              対象範囲と各ステークホルダーの配分を指定してください
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>適用範囲</Label>
              <Select
                value={form.watch("scope")}
                onValueChange={(v) =>
                  form.setValue(
                    "scope",
                    v as "platform_default" | "venue_override" | "coach_override"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform_default">
                    プラットフォーム全体（デフォルト）
                  </SelectItem>
                  <SelectItem value="venue_override">企業 override</SelectItem>
                  <SelectItem value="coach_override">コーチ override</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.watch("scope") === "venue_override" && (
              <div className="grid gap-1.5">
                <Label required>対象企業</Label>
                <Select
                  value={form.watch("venueId")}
                  onValueChange={(v) => form.setValue("venueId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="企業を選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {VENUES.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-md p-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  コート予約
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label>プラットフォーム (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register("courtPlatformRate", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>企業 (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register("courtVenueRate", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  コーチレッスン
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-1.5">
                    <Label>プラットフォーム (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register("lessonPlatformRate", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>企業 (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...form.register("lessonVenueRate", {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-success font-medium">
                  コーチ取り分 ={" "}
                  {100 -
                    (form.watch("lessonPlatformRate") || 0) -
                    (form.watch("lessonVenueRate") || 0)}
                  %
                </div>
              </div>
            </div>
            {(form.formState.errors.courtPlatformRate ||
              form.formState.errors.lessonPlatformRate) && (
              <p className="text-xs text-destructive">
                {form.formState.errors.courtPlatformRate?.message ||
                  form.formState.errors.lessonPlatformRate?.message}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>適用開始日</Label>
                <Input type="date" {...form.register("validFrom")} />
              </div>
              <div className="grid gap-1.5">
                <Label>適用終了日（空白で無期限）</Label>
                <Input type="date" {...form.register("validTo")} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>備考</Label>
              <Textarea
                rows={2}
                {...form.register("note")}
                placeholder="例：優先取引先割引、キャンペーン期間限定、等"
              />
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
                {editing ? "変更を保存" : "追加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
