"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
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
import { VenueBadge } from "@/components/status-badge";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { VENUES } from "@/lib/mock-data";
import type { Venue, VenueStatus } from "@/lib/types";
import { Building2, Image as ImageIcon, Clock } from "lucide-react";

const venueSchema = z.object({
  name: z.string().min(2, "企業名は 2 文字以上"),
  area: z.string().min(1, "エリアを入力してください"),
  address: z.string().min(5, "住所は 5 文字以上"),
  contactName: z.string().min(2, "担当者名を入力してください"),
  contactEmail: z.string().email("正しいメール形式で入力してください"),
  contactPhone: z.string().min(7, "有効な電話番号を入力してください"),
  status: z.enum(["active", "suspended", "pending"]),
  image: z.string().url("URL 形式が不正").or(z.literal("")).optional(),
  description: z.string().max(600, "600 文字以内").optional(),
  weekdayOpen: z.string().optional(),
  weekdayClose: z.string().optional(),
  weekendOpen: z.string().optional(),
  weekendClose: z.string().optional(),
});
type VenueForm = z.infer<typeof venueSchema>;

export default function VenuesPage() {
  const { items, add, update, hydrated } = useMockCrud<Venue>(
    MOCK_KEYS.venues,
    VENUES
  );
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | VenueStatus>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

  const filtered = useMemo(() => {
    return items.filter((v) => {
      if (filter !== "all" && v.status !== filter) return false;
      if (q && !`${v.name}${v.area}${v.contactName}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [items, q, filter]);

  const form = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      area: "",
      address: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      status: "pending",
      image: "",
      description: "",
      weekdayOpen: "09:00",
      weekdayClose: "22:00",
      weekendOpen: "08:00",
      weekendClose: "22:00",
    },
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      name: "",
      area: "",
      address: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      status: "pending",
      image: "",
      description: "",
      weekdayOpen: "09:00",
      weekdayClose: "22:00",
      weekendOpen: "08:00",
      weekendClose: "22:00",
    });
    setDialogOpen(true);
  };

  const openEdit = (v: Venue) => {
    setEditing(v);
    form.reset({
      name: v.name,
      area: v.area,
      address: v.address,
      contactName: v.contactName,
      contactEmail: v.contactEmail,
      contactPhone: v.contactPhone,
      status: v.status,
      image: v.image ?? "",
      description: v.description ?? "",
      weekdayOpen: v.openingHours?.weekday.open ?? "09:00",
      weekdayClose: v.openingHours?.weekday.close ?? "22:00",
      weekendOpen: v.openingHours?.weekend.open ?? "08:00",
      weekendClose: v.openingHours?.weekend.close ?? "22:00",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: VenueForm) => {
    await new Promise((r) => setTimeout(r, 500));
    const venueData: Partial<Venue> = {
      name: data.name,
      area: data.area,
      address: data.address,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      status: data.status,
      image: data.image || undefined,
      description: data.description || undefined,
      openingHours: {
        weekday: {
          open: data.weekdayOpen ?? "09:00",
          close: data.weekdayClose ?? "22:00",
        },
        weekend: {
          open: data.weekendOpen ?? "08:00",
          close: data.weekendClose ?? "22:00",
        },
      },
    };
    if (editing) {
      update(editing.id, venueData);
      toast.success(`企業を更新しました：${data.name}`);
    } else {
      const newVenue: Venue = {
        id: `v-${Date.now()}`,
        ...(venueData as Omit<Venue, "id" | "courtCount" | "createdAt">),
        courtCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      add(newVenue);
      toast.success(`企業を追加しました：${data.name}`);
    }
    setDialogOpen(false);
  };

  const toggleStatus = (v: Venue) => {
    const next: VenueStatus = v.status === "active" ? "suspended" : "active";
    update(v.id, { status: next });
    toast.success(
      `企業を${next === "active" ? "運営開始" : "停止"}しました：${v.name}`
    );
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="企業管理"
      description="プラットフォーム上の全企業を追加・編集します。停止すると利用者は新規予約ができなくなります。"
      breadcrumbs={[{ label: "プラットフォーム" }, { label: "企業管理" }]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規企業
        </Button>
      }
    >
      <Section
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="企業名 / エリア / 担当者で検索"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 w-64 h-8 text-xs"
              />
            </div>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="active">運営中</SelectItem>
                <SelectItem value="pending">準備中</SelectItem>
                <SelectItem value="suspended">停止中</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="該当する企業はありません"
            description="検索条件を変更するか、新規企業を追加してください"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企業</TableHead>
                <TableHead>エリア</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>コート数</TableHead>
                <TableHead>状態</TableHead>
                <TableHead>登録日</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    <div className="flex gap-2.5 items-start">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                        {v.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={v.image}
                            alt={v.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div>{v.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.address}
                        </div>
                        {v.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {v.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{v.area}</TableCell>
                  <TableCell>
                    <div className="text-sm">{v.contactName}</div>
                    <div className="text-xs text-muted-foreground">{v.contactEmail}</div>
                  </TableCell>
                  <TableCell>{v.courtCount}</TableCell>
                  <TableCell>
                    <VenueBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {v.createdAt}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(v)}>
                        編集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(v)}
                      >
                        {v.status === "active" ? "停止" : "運営開始"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{editing ? "企業を編集" : "新規企業"}</DialogTitle>
            <DialogDescription>
              企業の基本情報・写真・営業時間・紹介文。登録後にコートと備品を追加できます。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            {/* 企業代表画像 */}
            <div className="grid gap-1.5">
              <Label className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                企業代表画像
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
                    ユーザー app の企業一覧・詳細画面に表示されます
                  </p>
                </div>
              </div>
              {form.formState.errors.image && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.image.message}
                </p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="name" required>企業名</Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="area" required>エリア</Label>
                <Input id="area" placeholder="広島 / 大阪 ..." {...form.register("area")} />
                {form.formState.errors.area && (
                  <p className="text-xs text-destructive">{form.formState.errors.area.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>状態</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(v) => form.setValue("status", v as VenueStatus)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">準備中</SelectItem>
                    <SelectItem value="active">運営中</SelectItem>
                    <SelectItem value="suspended">停止中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="address" required>住所</Label>
              <Textarea
                id="address"
                rows={2}
                {...form.register("address")}
              />
              {form.formState.errors.address && (
                <p className="text-xs text-destructive">{form.formState.errors.address.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="contactName" required>担当者</Label>
                <Input id="contactName" {...form.register("contactName")} />
                {form.formState.errors.contactName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.contactName.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="contactPhone" required>電話番号</Label>
                <Input id="contactPhone" {...form.register("contactPhone")} />
                {form.formState.errors.contactPhone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.contactPhone.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="contactEmail" required>メールアドレス</Label>
              <Input
                id="contactEmail"
                type="email"
                {...form.register("contactEmail")}
              />
              {form.formState.errors.contactEmail && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.contactEmail.message}
                </p>
              )}
            </div>

            {/* 紹介文 */}
            <div className="grid gap-1.5">
              <Label>企業紹介文</Label>
              <Textarea
                rows={3}
                {...form.register("description")}
                placeholder="例：広島市中心部にある本格的なパデル専門施設。屋外ハードコートと室内コートを完備..."
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* 営業時間 */}
            <div className="grid gap-2 border rounded-md p-3 bg-muted/20">
              <Label className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                営業時間
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">平日</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      {...form.register("weekdayOpen")}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">〜</span>
                    <Input
                      type="time"
                      {...form.register("weekdayClose")}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">週末・祝日</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      {...form.register("weekendOpen")}
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">〜</span>
                    <Input
                      type="time"
                      {...form.register("weekendClose")}
                      className="flex-1"
                    />
                  </div>
                </div>
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
                {editing ? "変更を保存" : "企業を登録"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
