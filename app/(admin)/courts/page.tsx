"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Zap, Image as ImageIcon, Star } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { COURTS } from "@/lib/mock-data";
import type { Court, CourtType } from "@/lib/types";
import { COURT_AMENITY_OPTIONS } from "@/lib/types";
import { formatYen, cn } from "@/lib/utils";

// 時段定義（9:00-21:00）
const HOURS = Array.from({ length: 12 }, (_, i) => i + 9);
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const courtSchema = z.object({
  name: z.string().min(1, "コート名を入力してください"),
  type: z.enum(["屋外ハード", "室内", "室内ハード", "クレー"]),
  hourlyPrice: z.number().min(500, "時間単価は ¥500 以上"),
  active: z.boolean(),
  image: z.string().url("URL 形式が不正").or(z.literal("")).optional(),
  description: z.string().max(500, "500 文字以内").optional(),
  capacity: z.number().min(2).max(8).optional(),
  amenities: z.array(z.string()),
});
type CourtForm = z.infer<typeof courtSchema>;

type SlotKey = `${string}-${number}-${number}`; // courtId-weekday-hour

export default function CourtsPage() {
  const { user } = useAuth();
  const { items, add, update, hydrated } = useMockCrud<Court>(MOCK_KEYS.courts, COURTS);

  // 時段開關以 localStorage 自管
  const slotKey = `lst-mock-slots-v1`;
  const [slotMap, setSlotMap] = useState<Record<SlotKey, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(slotKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const persistSlots = (next: Record<SlotKey, boolean>) => {
    setSlotMap(next);
    try {
      localStorage.setItem(slotKey, JSON.stringify(next));
    } catch {}
  };

  const [courtDialog, setCourtDialog] = useState(false);
  const [editing, setEditing] = useState<Court | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const myCourts = useMemo(() => {
    return items.filter((c) => c.venueId === user?.venueId);
  }, [items, user]);

  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const activeCourtId = selectedCourt ?? myCourts[0]?.id ?? null;
  const activeCourt = myCourts.find((c) => c.id === activeCourtId) ?? null;

  const defaultForm: CourtForm = {
    name: "",
    type: "屋外ハード",
    hourlyPrice: 2000,
    active: true,
    image: "",
    description: "",
    capacity: 4,
    amenities: [],
  };

  const form = useForm<CourtForm>({
    resolver: zodResolver(courtSchema),
    defaultValues: defaultForm,
  });

  const openNew = () => {
    setEditing(null);
    form.reset(defaultForm);
    setCourtDialog(true);
  };

  const openEdit = (c: Court) => {
    setEditing(c);
    form.reset({
      name: c.name,
      type: c.type,
      hourlyPrice: c.hourlyPrice,
      active: c.active,
      image: c.image ?? "",
      description: c.description ?? "",
      capacity: c.capacity ?? 4,
      amenities: c.amenities ?? [],
    });
    setCourtDialog(true);
  };

  const onSubmit = async (data: CourtForm) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, {
        ...data,
        image: data.image || undefined,
        description: data.description || undefined,
      });
      toast.success(`コートを更新しました：${data.name}`);
    } else {
      const newCourt: Court = {
        id: `c-${Date.now()}`,
        venueId: user?.venueId ?? "v1",
        ...data,
        image: data.image || undefined,
        description: data.description || undefined,
      };
      add(newCourt);
      toast.success(`コートを追加しました：${data.name}`);
    }
    setCourtDialog(false);
  };

  const toggleAmenity = (a: string) => {
    const cur = form.watch("amenities") ?? [];
    form.setValue(
      "amenities",
      cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]
    );
  };

  const isOpen = (courtId: string, weekday: number, hour: number) => {
    const k = `${courtId}-${weekday}-${hour}` as SlotKey;
    if (k in slotMap) return slotMap[k];
    // 預設 08:00-21:00 全開
    return true;
  };

  const toggleSlot = (courtId: string, weekday: number, hour: number) => {
    const k = `${courtId}-${weekday}-${hour}` as SlotKey;
    const current = isOpen(courtId, weekday, hour);
    persistSlots({ ...slotMap, [k]: !current });
  };

  // 批次設定：指定 court、星期範圍、時段範圍、開關
  const [bulkForm, setBulkForm] = useState({
    courtId: "",
    weekdays: [1, 2, 3, 4, 5], // 平日
    startHour: 9,
    endHour: 17,
    open: true,
  });

  const applyBulk = () => {
    const courtId = bulkForm.courtId || activeCourtId;
    if (!courtId) {
      toast.error("先にコートを選択してください");
      return;
    }
    const next = { ...slotMap };
    let changed = 0;
    bulkForm.weekdays.forEach((wd) => {
      for (let h = bulkForm.startHour; h < bulkForm.endHour; h++) {
        const k = `${courtId}-${wd}-${h}` as SlotKey;
        next[k] = bulkForm.open;
        changed++;
      }
    });
    persistSlots(next);
    toast.success(`${changed} 枠を${bulkForm.open ? "開放" : "閉鎖"}に一括設定しました`);
    setBulkOpen(false);
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="コート・時間帯"
      description="当企業のコートリストと予約可能時間帯の管理。セルをクリックで開放/閉鎖を切替。"
      breadcrumbs={[{ label: "施設/予約" }, { label: "コート管理" }]}
      actions={
        <>
          <Button variant="outline" onClick={() => setBulkOpen(true)} disabled={!activeCourtId}>
            <Zap className="w-4 h-4" />
            一括設定
          </Button>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4" />
            新規コート
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        {/* コートサイドリスト */}
        <Section title="コート">
          <div className="divide-y max-h-[680px] overflow-y-auto">
            {myCourts.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourt(c.id)}
                className={cn(
                  "w-full text-left p-3 hover:bg-muted/40 transition-colors",
                  activeCourtId === c.id && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className="flex gap-2.5">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-sm truncate">{c.name}</div>
                      {!c.active && <Badge variant="muted">停止中</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {c.type} · {formatYen(c.hourlyPrice)}/h
                    </div>
                    {c.rating != null && c.rating > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Star className="w-3 h-3 fill-[hsl(38_92%_50%)] text-[hsl(38_92%_50%)]" />
                        {c.rating.toFixed(1)} ({c.reviewCount})
                      </div>
                    )}
                    {c.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-0.5 mt-1">
                        {c.amenities.slice(0, 3).map((a) => (
                          <span
                            key={a}
                            className="text-[9px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded"
                          >
                            {a}
                          </span>
                        ))}
                        {c.amenities.length > 3 && (
                          <span className="text-[9px] text-muted-foreground px-1 py-0.5">
                            +{c.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
            {myCourts.length === 0 && (
              <div className="text-sm text-muted-foreground px-4 py-6 text-center">
                コートが未登録です
              </div>
            )}
          </div>
        </Section>

        {/* 時間帯グリッド */}
        <Section
          title={activeCourt ? `${activeCourt.name}` : "コートを選択してください"}
          description={activeCourt ? "コート詳細・時間帯管理" : "行：曜日　列：時刻　青=予約可能"}
          actions={
            activeCourt ? (
              <Button variant="outline" size="sm" onClick={() => openEdit(activeCourt)}>
                コートを編集
              </Button>
            ) : null
          }
        >
          {activeCourt && (
            <>
              {/* コート詳細ヘッダー */}
              <div className="flex gap-4 p-5 border-b">
                <div className="w-40 h-28 rounded-md overflow-hidden bg-muted shrink-0">
                  {activeCourt.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeCourt.image}
                      alt={activeCourt.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{activeCourt.name}</span>
                    <Badge variant="secondary">{activeCourt.type}</Badge>
                    {!activeCourt.active && <Badge variant="muted">停止中</Badge>}
                    <span className="ml-auto text-sm font-semibold">
                      {formatYen(activeCourt.hourlyPrice)}
                      <span className="text-xs text-muted-foreground ml-1">/h</span>
                    </span>
                  </div>
                  {activeCourt.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      {activeCourt.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    {activeCourt.capacity && (
                      <span>定員 {activeCourt.capacity} 名</span>
                    )}
                    {activeCourt.rating != null && activeCourt.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[hsl(38_92%_50%)] text-[hsl(38_92%_50%)]" />
                        {activeCourt.rating.toFixed(1)} ({activeCourt.reviewCount})
                      </span>
                    )}
                  </div>
                  {activeCourt.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeCourt.amenities.map((a) => (
                        <Badge key={a} variant="secondary">
                          {a}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-4 pt-2 pb-1 text-xs text-muted-foreground font-medium">
                時間帯スケジュール
              </div>
            <div className="p-4 overflow-x-auto">
              <div className="min-w-[780px]">
                <div
                  className="grid gap-0.5"
                  style={{ gridTemplateColumns: `60px repeat(${HOURS.length}, minmax(48px, 1fr))` }}
                >
                  <div />
                  {HOURS.map((h) => (
                    <div key={h} className="text-[10px] text-center text-muted-foreground py-1">
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                  {WEEKDAYS.map((wd, widx) => (
                    <>
                      <div
                        key={`wd-${widx}`}
                        className="text-xs font-medium py-1 pr-2 text-right self-center"
                      >
                        {wd}
                      </div>
                      {HOURS.map((h) => {
                        const open = isOpen(activeCourt.id, widx, h);
                        return (
                          <button
                            key={`${widx}-${h}`}
                            onClick={() => toggleSlot(activeCourt.id, widx, h)}
                            className={cn(
                              "h-8 rounded border transition-colors text-[10px]",
                              open
                                ? "bg-primary/15 border-primary/40 hover:bg-primary/25"
                                : "bg-muted border-transparent hover:bg-muted-foreground/10 text-muted-foreground"
                            )}
                            title={`${wd} ${String(h).padStart(2, "0")}:00 - ${open ? "開放" : "閉鎖"}`}
                          />
                        );
                      })}
                    </>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  ＊ プロトタイプのため既存予約との競合チェックは未実装です。
                </div>
              </div>
            </div>
            </>
          )}
          {!activeCourt && (
            <div className="text-sm text-muted-foreground p-10 text-center">
              左側からコートを選択してください
            </div>
          )}
        </Section>
      </div>

      {/* 新規/編集コート */}
      <Dialog open={courtDialog} onOpenChange={setCourtDialog}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? "コートを編集" : "新規コート"}</DialogTitle>
            <DialogDescription>
              コートの基本情報・写真・設備タグ・紹介文。ユーザー app のコート詳細画面に表示されます。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* 写真 */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                コート写真
              </Label>
              <div className="flex gap-3">
                <div className="w-32 h-20 rounded-md border bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                  {form.watch("image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.watch("image")}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 grid gap-1.5">
                  <Input
                    {...form.register("image")}
                    placeholder="https://... (画像 URL)"
                  />
                  <p className="text-xs text-muted-foreground">
                    本番はファイルアップロード対応。プロトタイプは URL 指定のみ。
                  </p>
                </div>
              </div>
              {form.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>コート名</Label>
                <Input {...form.register("name")} placeholder="例：コートA" />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>コート種別</Label>
                <Select
                  value={form.watch("type")}
                  onValueChange={(v) => form.setValue("type", v as CourtType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="屋外ハード">屋外ハード</SelectItem>
                    <SelectItem value="室内">室内</SelectItem>
                    <SelectItem value="室内ハード">室内ハード</SelectItem>
                    <SelectItem value="クレー">クレー</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>時間単価（¥/時間）</Label>
                <Input
                  type="number"
                  min={500}
                  {...form.register("hourlyPrice", { valueAsNumber: true })}
                />
                {form.formState.errors.hourlyPrice && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.hourlyPrice.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>収容人数</Label>
                <Input
                  type="number"
                  min={2}
                  max={8}
                  {...form.register("capacity", { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* 紹介文 */}
            <div className="grid gap-1.5">
              <Label>コート紹介文</Label>
              <Textarea
                rows={3}
                {...form.register("description")}
                placeholder="例：屋外ハードコート。夜間も照明完備で利用可能。初心者から中級者におすすめ。"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* 設備タグ */}
            <div className="grid gap-2">
              <Label>設備・アメニティ（複数選択可）</Label>
              <div className="flex flex-wrap gap-1.5">
                {COURT_AMENITY_OPTIONS.map((a) => {
                  const selected = (form.watch("amenities") ?? []).includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={cn(
                        "px-2.5 py-1 rounded-md border text-xs transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      )}
                    >
                      {a}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                選択中：{(form.watch("amenities") ?? []).length} 項目
              </p>
            </div>

            {editing?.rating != null && editing.rating > 0 && (
              <div className="flex items-center gap-4 bg-muted/40 rounded-md px-4 py-2 text-xs">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[hsl(38_92%_50%)] text-[hsl(38_92%_50%)]" />
                  <span className="font-semibold">{editing.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    （{editing.reviewCount ?? 0} 件のレビュー）
                  </span>
                </div>
                <span className="text-muted-foreground">
                  ＊ 評価は利用者レビューから自動算出されます
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t">
              <Switch
                checked={form.watch("active")}
                onCheckedChange={(v) => form.setValue("active", v)}
              />
              <Label>コートを有効化（無効にすると予約不可）</Label>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCourtDialog(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                {editing ? "保存" : "作成"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 批次設定 */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>時間帯を一括設定</DialogTitle>
            <DialogDescription>
              曜日 × 時間帯の開閉状態を一括で更新。営業日ルールの設定に便利。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label>適用する曜日</Label>
              <div className="flex gap-2 flex-wrap">
                {WEEKDAYS.map((wd, idx) => {
                  const selected = bulkForm.weekdays.includes(idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setBulkForm((prev) => ({
                          ...prev,
                          weekdays: selected
                            ? prev.weekdays.filter((w) => w !== idx)
                            : [...prev.weekdays, idx].sort(),
                        }))
                      }
                      className={cn(
                        "h-8 w-10 rounded border text-sm transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-input hover:bg-accent"
                      )}
                    >
                      {wd}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>開始時刻</Label>
                <Select
                  value={String(bulkForm.startHour)}
                  onValueChange={(v) =>
                    setBulkForm((prev) => ({ ...prev, startHour: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HOURS.map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>終了時刻</Label>
                <Select
                  value={String(bulkForm.endHour)}
                  onValueChange={(v) =>
                    setBulkForm((prev) => ({ ...prev, endHour: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...HOURS, 21].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={bulkForm.open}
                onCheckedChange={(v) =>
                  setBulkForm((prev) => ({ ...prev, open: v }))
                }
              />
              <Label>開放時間帯として設定</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={applyBulk}>適用</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
