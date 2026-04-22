"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, ShieldCheck, Lock, Info, Copy, Trash2 } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { ADMIN_ROLES, ADMIN_ACCOUNTS } from "@/lib/mock-data";
import type {
  AdminRole,
  ModuleKey,
  CrudAction,
  SpecialAction,
} from "@/lib/types";
import {
  MODULE_LABELS,
  CRUD_LABELS,
  SPECIAL_ACTION_LABELS,
  SCOPE_MODULES,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CRUD_COLUMNS: CrudAction[] = ["read", "create", "update", "delete"];

type FormData = {
  label: string;
  description: string;
  scope: "lst" | "venue";
  modulePerms: Partial<Record<ModuleKey, CrudAction[]>>;
  specialPerms: SpecialAction[];
};

const schema = z.object({
  label: z.string().min(2, "ロール名は 2 文字以上"),
  description: z.string().min(10, "説明は 10 文字以上"),
  scope: z.enum(["lst", "venue"]),
  modulePerms: z.record(z.string(), z.array(z.enum(["read", "create", "update", "delete"]))),
  specialPerms: z.array(z.string()),
});

export default function RolesPage() {
  const { items, add, update, remove, hydrated } = useMockCrud<AdminRole>(
    MOCK_KEYS.adminRoles,
    ADMIN_ROLES
  );
  const [scope, setScope] = useState<"lst" | "venue">("lst");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminRole | null>(null);

  const accountCountByRole = useMemo(() => {
    const map: Record<string, number> = {};
    ADMIN_ACCOUNTS.forEach((a) => {
      map[a.roleKey] = (map[a.roleKey] ?? 0) + 1;
    });
    return map;
  }, []);

  const scopedRoles = items.filter((r) => r.scope === scope);

  const form = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      label: "",
      description: "",
      scope: "lst",
      modulePerms: {},
      specialPerms: [],
    },
  });

  const formScope = form.watch("scope");
  const formModulePerms = form.watch("modulePerms");
  const formSpecialPerms = form.watch("specialPerms");
  const availableModules = SCOPE_MODULES[formScope];

  const openNew = () => {
    setEditing(null);
    form.reset({
      label: "",
      description: "",
      scope,
      modulePerms: {},
      specialPerms: [],
    });
    setDialogOpen(true);
  };

  const openEdit = (r: AdminRole) => {
    setEditing(r);
    form.reset({
      label: r.label,
      description: r.description,
      scope: r.scope,
      modulePerms: r.modulePerms ?? {},
      specialPerms: r.specialPerms ?? [],
    });
    setDialogOpen(true);
  };

  const openDuplicate = (r: AdminRole) => {
    setEditing(null);
    form.reset({
      label: `${r.label}（コピー）`,
      description: r.description,
      scope: r.scope,
      modulePerms: { ...(r.modulePerms ?? {}) },
      specialPerms: [...(r.specialPerms ?? [])],
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    if (editing) {
      update(editing.id, {
        label: data.label,
        description: data.description,
        modulePerms: data.modulePerms,
        specialPerms: data.specialPerms,
      });
      toast.success(`ロールを更新：${data.label}`);
    } else {
      add({
        id: `role-${Date.now()}`,
        key: `custom-${Date.now()}`,
        label: data.label,
        description: data.description,
        scope: data.scope,
        builtin: false,
        modulePerms: data.modulePerms,
        specialPerms: data.specialPerms,
        createdAt: new Date().toISOString(),
      });
      toast.success(`ロールを作成：${data.label}`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (r: AdminRole) => {
    const count = accountCountByRole[r.key] ?? 0;
    if (count > 0) {
      toast.error(
        `このロールは ${count} 名のアカウントに割当中のため削除できません`
      );
      return;
    }
    if (confirm(`「${r.label}」を削除しますか？この操作は取り消せません。`)) {
      remove(r.id);
      toast.success(`削除しました：${r.label}`);
    }
  };

  // Matrix toggle helpers
  const toggleModuleCrud = (mod: ModuleKey, action: CrudAction) => {
    const cur = formModulePerms[mod] ?? [];
    const next = cur.includes(action)
      ? cur.filter((a) => a !== action)
      : [...cur, action];
    form.setValue("modulePerms", { ...formModulePerms, [mod]: next });
  };

  const toggleModuleAll = (mod: ModuleKey) => {
    const cur = formModulePerms[mod] ?? [];
    const all = cur.length === CRUD_COLUMNS.length;
    form.setValue("modulePerms", {
      ...formModulePerms,
      [mod]: all ? [] : [...CRUD_COLUMNS],
    });
  };

  const toggleCrudColumn = (action: CrudAction) => {
    const allHave = availableModules.every((m) =>
      (formModulePerms[m] ?? []).includes(action)
    );
    const next = { ...formModulePerms };
    availableModules.forEach((m) => {
      const cur = next[m] ?? [];
      next[m] = allHave
        ? cur.filter((a) => a !== action)
        : Array.from(new Set([...cur, action]));
    });
    form.setValue("modulePerms", next);
  };

  const toggleSpecial = (s: SpecialAction) => {
    const cur = formSpecialPerms;
    form.setValue(
      "specialPerms",
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]
    );
  };

  // Group special actions by module for display
  const specialsByModule = useMemo(() => {
    const map: Partial<Record<ModuleKey, SpecialAction[]>> = {};
    (Object.entries(SPECIAL_ACTION_LABELS) as [SpecialAction, { module: ModuleKey }][]).forEach(
      ([key, meta]) => {
        if (!map[meta.module]) map[meta.module] = [];
        map[meta.module]!.push(key);
      }
    );
    return map;
  }, []);

  if (!hydrated) return null;

  return (
    <PageShell
      title="権限・ロール"
      description="カスタムロールの作成と、モジュール × CRUD マトリクスによる権限調整。"
      breadcrumbs={[{ label: "システム" }, { label: "権限・ロール" }]}
      actions={
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          新規ロール作成
        </Button>
      }
    >
      <div className="mb-4 rounded-md border border-primary/30 bg-primary/5 px-4 py-3 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-muted-foreground leading-relaxed">
          標準ロール 7 種（削除不可、複製は可能）と、カスタムロール（無制限作成可）を管理できます。
          各モジュールに対する <strong>CRUD 権限</strong>（閲覧／作成／編集／削除）と、
          <strong>機微操作</strong>（コーチ審査・返金・配布実行など）を細かく設定できます。
        </div>
      </div>

      <Tabs value={scope} onValueChange={(v) => setScope(v as "lst" | "venue")}>
        <TabsList>
          <TabsTrigger value="lst">
            LST 運営側{" "}
            <Badge variant="muted" className="ml-2">
              {items.filter((r) => r.scope === "lst").length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="venue">
            企業側{" "}
            <Badge variant="muted" className="ml-2">
              {items.filter((r) => r.scope === "venue").length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={scope}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {scopedRoles.map((role) => {
              // 旧形式の localStorage cache 対策（念のため fallback）
              const modulePerms = role.modulePerms ?? {};
              const specialPerms = role.specialPerms ?? [];
              const moduleCount = Object.values(modulePerms).filter(
                (v) => v && v.length > 0
              ).length;
              const totalCruds = Object.values(modulePerms).reduce(
                (s, v) => s + (v?.length ?? 0),
                0
              );
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
                          {role.builtin ? (
                            <Badge variant="secondary" className="gap-1">
                              <Lock className="w-3 h-3" />
                              標準
                            </Badge>
                          ) : (
                            <Badge variant="default">カスタム</Badge>
                          )}
                          <Badge variant="muted">{usedCount} 名</Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="p-5">
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-muted/40 rounded-md p-2 text-center">
                          <div className="text-lg font-semibold">
                            {moduleCount}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            利用モジュール
                          </div>
                        </div>
                        <div className="bg-muted/40 rounded-md p-2 text-center">
                          <div className="text-lg font-semibold">{totalCruds}</div>
                          <div className="text-[10px] text-muted-foreground">
                            CRUD 権限
                          </div>
                        </div>
                        <div className="bg-muted/40 rounded-md p-2 text-center">
                          <div className="text-lg font-semibold">
                            {specialPerms.length}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            機微操作
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {Object.entries(modulePerms)
                          .filter(([, v]) => v && v.length > 0)
                          .map(([mod, actions]) => (
                            <div key={mod} className="flex items-center gap-2">
                              <div className="text-xs w-24 shrink-0 text-muted-foreground">
                                {MODULE_LABELS[mod as ModuleKey]}
                              </div>
                              <div className="flex gap-1">
                                {(actions ?? []).map((a) => (
                                  <span
                                    key={a}
                                    className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded"
                                  >
                                    {CRUD_LABELS[a]}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground">
                        作成：{role.createdAt.slice(0, 10)}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDuplicate(role)}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          複製
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(role)}
                        >
                          {role.builtin ? "詳細" : "編集"}
                        </Button>
                        {!role.builtin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleDelete(role)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* 新規/編集 dialog with matrix editor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? `ロール編集：${editing.label}` : "新規ロール作成"}
            </DialogTitle>
            <DialogDescription>
              モジュール × CRUD マトリクスと機微操作を設定します。
              {editing?.builtin &&
                " 標準ロールは閲覧のみ可能（編集は複製後）。"}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 max-h-[70vh] overflow-y-auto pr-1"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>ロール名</Label>
                <Input
                  {...form.register("label")}
                  placeholder="例：財務閲覧専用"
                  disabled={editing?.builtin}
                />
                {form.formState.errors.label && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.label.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>適用範囲</Label>
                <Select
                  value={formScope}
                  onValueChange={(v) => form.setValue("scope", v as "lst" | "venue")}
                  disabled={!!editing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lst">LST 運営側</SelectItem>
                    <SelectItem value="venue">企業側</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label required>説明</Label>
              <Textarea
                rows={2}
                {...form.register("description")}
                placeholder="このロールの目的・権限の要約"
                disabled={editing?.builtin}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {/* CRUD Matrix */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">モジュール × CRUD マトリクス</Label>
                <div className="text-xs text-muted-foreground">
                  セルをクリックで ON/OFF · 行／列ヘッダで一括切替
                </div>
              </div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/40 border-b">
                      <th className="text-left px-3 py-2 font-medium w-48">
                        モジュール
                      </th>
                      {CRUD_COLUMNS.map((c) => (
                        <th
                          key={c}
                          className="px-3 py-2 font-medium text-center"
                        >
                          <button
                            type="button"
                            onClick={() => toggleCrudColumn(c)}
                            className="hover:text-primary cursor-pointer"
                            disabled={editing?.builtin}
                          >
                            {CRUD_LABELS[c]}
                          </button>
                        </th>
                      ))}
                      <th className="px-3 py-2 font-medium text-center w-16">
                        一括
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {availableModules.map((mod) => {
                      const cur = formModulePerms[mod] ?? [];
                      const allSelected = cur.length === CRUD_COLUMNS.length;
                      return (
                        <tr key={mod} className="hover:bg-muted/20">
                          <td className="px-3 py-1.5 font-medium">
                            {MODULE_LABELS[mod]}
                          </td>
                          {CRUD_COLUMNS.map((action) => {
                            const checked = cur.includes(action);
                            return (
                              <td
                                key={action}
                                className="px-3 py-1.5 text-center"
                              >
                                <button
                                  type="button"
                                  disabled={editing?.builtin}
                                  onClick={() => toggleModuleCrud(mod, action)}
                                  className={cn(
                                    "w-6 h-6 rounded border-2 transition-colors",
                                    checked
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-input hover:border-primary/60",
                                    editing?.builtin && "cursor-not-allowed opacity-60"
                                  )}
                                  aria-label={`${MODULE_LABELS[mod]} ${CRUD_LABELS[action]}`}
                                >
                                  {checked && (
                                    <svg
                                      className="w-full h-full p-0.5"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      />
                                    </svg>
                                  )}
                                </button>
                              </td>
                            );
                          })}
                          <td className="px-3 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => toggleModuleAll(mod)}
                              disabled={editing?.builtin}
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded border transition-colors",
                                allSelected
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-input hover:border-primary/60"
                              )}
                            >
                              {allSelected ? "全解除" : "全選択"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Special actions */}
            <div>
              <Label className="text-sm mb-2 block">
                機微操作（CRUD とは別の特殊権限）
              </Label>
              <div className="border rounded-md p-3 space-y-3 bg-muted/20">
                {Object.entries(specialsByModule).map(([mod, specials]) => {
                  if (!availableModules.includes(mod as ModuleKey)) return null;
                  return (
                    <div key={mod}>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                        {MODULE_LABELS[mod as ModuleKey]}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {specials!.map((s) => {
                          const checked = formSpecialPerms.includes(s);
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSpecial(s)}
                              disabled={editing?.builtin}
                              className={cn(
                                "text-xs px-2 py-1 rounded border transition-colors",
                                checked
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-input hover:border-primary/60",
                                editing?.builtin && "cursor-not-allowed opacity-60"
                              )}
                            >
                              {SPECIAL_ACTION_LABELS[s].label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {editing?.builtin ? "閉じる" : "キャンセル"}
              </Button>
              {!editing?.builtin && (
                <Button type="submit" loading={form.formState.isSubmitting}>
                  {editing ? "変更を保存" : "ロール作成"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
