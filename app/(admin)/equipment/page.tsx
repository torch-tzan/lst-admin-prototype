"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Package, AlertTriangle } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { EQUIPMENT } from "@/lib/mock-data";
import type { Equipment, EquipmentPriceType } from "@/lib/types";
import { formatYen } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "備品名を入力してください"),
  priceType: z.enum(["hourly", "perUse"]),
  price: z.number().min(0, "価格は 0 以上"),
  maxQty: z.number().min(1, "1 予約あたり最低 1 点"),
  stock: z.number().min(0, "在庫は 0 以上"),
  active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

export default function EquipmentPage() {
  const { user } = useAuth();
  const { items, add, update, remove, hydrated } = useMockCrud<Equipment>(
    MOCK_KEYS.equipment,
    EQUIPMENT
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);

  const myEquipment = useMemo(
    () => items.filter((e) => e.venueId === user?.venueId),
    [items, user]
  );

  const lowStock = myEquipment.filter((e) => e.active && e.stock < 5);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      priceType: "perUse",
      price: 300,
      maxQty: 4,
      stock: 10,
      active: true,
    },
  });

  const openNew = () => {
    setEditing(null);
    form.reset({
      name: "",
      priceType: "perUse",
      price: 300,
      maxQty: 4,
      stock: 10,
      active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (e: Equipment) => {
    setEditing(e);
    form.reset({
      name: e.name,
      priceType: e.priceType,
      price: e.price,
      maxQty: e.maxQty,
      stock: e.stock,
      active: e.active,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, data);
      toast.success(`備品を更新しました：${data.name}`);
    } else {
      const item: Equipment = {
        id: `eq-${Date.now()}`,
        venueId: user?.venueId ?? "v1",
        ...data,
      };
      add(item);
      toast.success(`備品を追加しました：${data.name}`);
    }
    setDialogOpen(false);
  };

  const toggleActive = (e: Equipment) => {
    update(e.id, { active: !e.active });
    toast.success(`${e.name} を${!e.active ? "掲載" : "掲載停止"}しました`);
  };

  const confirmRemove = (e: Equipment) => {
    if (confirm(`備品「${e.name}」を削除しますか？この操作は取り消せません。`)) {
      remove(e.id);
      toast.success(`削除しました：${e.name}`);
    }
  };

  if (!hydrated) return null;

  return (
    <PageShell
      title="備品レンタル"
      description={`当企業のレンタル可能な備品カタログ。${
        lowStock.length > 0 ? `現在 ${lowStock.length} 点が在庫 5 未満です。` : ""
      }`}
      breadcrumbs={[{ label: "施設/予約" }, { label: "備品レンタル" }]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規備品
        </Button>
      }
    >
      {lowStock.length > 0 && (
        <div className="mb-4 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[hsl(38_92%_30%)]" />
          <span>在庫不足の警告：</span>
          {lowStock.map((e) => (
            <Badge key={e.id} variant="warning">
              {e.name}（残り {e.stock} 点）
            </Badge>
          ))}
        </div>
      )}

      <Section>
        {myEquipment.length === 0 ? (
          <EmptyState
            icon={Package}
            title="備品が未登録です"
            description="最初のレンタル備品（ラケット、ボール、シューズなど）を追加しましょう"
            action={
              <Button onClick={openNew}>
                <Plus className="w-4 h-4" /> 新規備品
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>備品</TableHead>
                <TableHead>料金体系</TableHead>
                <TableHead>単価</TableHead>
                <TableHead>予約上限</TableHead>
                <TableHead>在庫</TableHead>
                <TableHead>状態</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myEquipment.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {e.priceType === "hourly" ? "時間課金" : "回数課金"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatYen(e.price)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {e.priceType === "hourly" ? "/時間" : "/回"}
                    </span>
                  </TableCell>
                  <TableCell>{e.maxQty} 点</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={
                          e.stock < 5 && e.active ? "text-destructive font-medium" : ""
                        }
                      >
                        {e.stock}
                      </span>
                      {e.stock < 5 && e.active && (
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.active ? "success" : "muted"}>
                      {e.active ? "掲載中" : "非掲載"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(e)}>
                        編集
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(e)}>
                        {e.active ? "非掲載" : "掲載"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => confirmRemove(e)}
                      >
                        削除
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
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>{editing ? "備品を編集" : "新規備品"}</DialogTitle>
            <DialogDescription>
              予約時のオプションとして表示されます。料金体系により金額計算ロジックが決まります。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>備品名</Label>
              <Input {...form.register("name")} placeholder="例：パデルラケット" />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>料金体系</Label>
                <Select
                  value={form.watch("priceType")}
                  onValueChange={(v) =>
                    form.setValue("priceType", v as EquipmentPriceType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">時間課金（¥/時間）</SelectItem>
                    <SelectItem value="perUse">回数課金（¥/回）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label required>単価（¥）</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>予約上限（点）</Label>
                <Input
                  type="number"
                  min={1}
                  {...form.register("maxQty", { valueAsNumber: true })}
                />
                {form.formState.errors.maxQty && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.maxQty.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>在庫（点）</Label>
                <Input
                  type="number"
                  min={0}
                  {...form.register("stock", { valueAsNumber: true })}
                />
                {form.formState.errors.stock && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={form.watch("active")}
                onCheckedChange={(v) => form.setValue("active", v)}
              />
              <Label>掲載中（利用者が追加購入可能）</Label>
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
                {editing ? "変更を保存" : "備品を追加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
