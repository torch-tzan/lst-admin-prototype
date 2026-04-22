"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Settings as SettingsIcon, Save, Shield, Globe, AlertTriangle } from "lucide-react";

import { PageShell, Section } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SYSTEM_SETTINGS } from "@/lib/mock-data";
import { MOCK_KEYS } from "@/lib/use-mock-crud";
import type { SystemSettings } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  platformName: z.string().min(2, "プラットフォーム名を入力"),
  supportEmail: z.string().email("正しいメール形式"),
  supportPhone: z.string().min(7, "電話番号"),
  termsUrl: z.string().url("URL 形式が不正").or(z.literal("")),
  privacyUrl: z.string().url("URL 形式が不正").or(z.literal("")),
  stripePublishableKey: z.string().min(10),
  defaultCurrency: z.enum(["JPY", "TWD", "USD"]),
  timezone: z.string().min(1),
  cancellationWindowHours: z.number().min(0).max(168),
  // pointsExpirationDays は固定ルール（翌年末失効）のため schema から除外
  maintenanceMode: z.boolean(),
  registrationOpen: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  // システム設定はシングルレコード
  const [settings, setSettings] = useState<SystemSettings>(() => {
    if (typeof window === "undefined") return SYSTEM_SETTINGS;
    try {
      const raw = localStorage.getItem(MOCK_KEYS.systemSettings);
      return raw ? JSON.parse(raw) : SYSTEM_SETTINGS;
    } catch {
      return SYSTEM_SETTINGS;
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      platformName: settings.platformName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      termsUrl: settings.termsUrl,
      privacyUrl: settings.privacyUrl,
      stripePublishableKey: settings.stripePublishableKey,
      defaultCurrency: settings.defaultCurrency,
      timezone: settings.timezone,
      cancellationWindowHours: settings.cancellationWindowHours,
      maintenanceMode: settings.maintenanceMode,
      registrationOpen: settings.registrationOpen,
    },
  });

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 500));
    const next: SystemSettings = {
      ...data,
      // ポイント有効期限は固定ルール（翌年末失効）で変更不可
      pointsExpirationDays: settings.pointsExpirationDays,
      updatedAt: new Date().toISOString(),
      updatedBy: "運営管理者",
    };
    setSettings(next);
    try {
      localStorage.setItem(MOCK_KEYS.systemSettings, JSON.stringify(next));
    } catch {}
    toast.success("システム設定を保存しました");
  };

  return (
    <PageShell
      title="システム設定"
      description="プラットフォーム全体の基本設定・外部サービス連携・業務ルール"
      breadcrumbs={[{ label: "システム" }, { label: "システム設定" }]}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* メンテナンスモード警告 */}
        {form.watch("maintenanceMode") && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span>
              メンテナンスモードが ON です。利用者は予約・決済ができません。
            </span>
          </div>
        )}

        <Section title="基本情報" description="プラットフォーム名・サポート窓口">
          <div className="p-5 grid gap-4">
            <div className="grid gap-1.5">
              <Label required>プラットフォーム名</Label>
              <Input {...form.register("platformName")} />
              {form.formState.errors.platformName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.platformName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label required>サポートメール</Label>
                <Input type="email" {...form.register("supportEmail")} />
                {form.formState.errors.supportEmail && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.supportEmail.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label required>サポート電話</Label>
                <Input {...form.register("supportPhone")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>利用規約 URL</Label>
                <Input {...form.register("termsUrl")} placeholder="https://..." />
              </div>
              <div className="grid gap-1.5">
                <Label>プライバシーポリシー URL</Label>
                <Input {...form.register("privacyUrl")} placeholder="https://..." />
              </div>
            </div>
          </div>
        </Section>

        <Section title="地域・通貨設定">
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label required>デフォルト通貨</Label>
              <Select
                value={form.watch("defaultCurrency")}
                onValueChange={(v) =>
                  form.setValue("defaultCurrency", v as "JPY" | "TWD" | "USD")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JPY">日本円 (¥)</SelectItem>
                  <SelectItem value="TWD">新台幣 (NT$)</SelectItem>
                  <SelectItem value="USD">米ドル ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label required>タイムゾーン</Label>
              <Select
                value={form.watch("timezone")}
                onValueChange={(v) => form.setValue("timezone", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Asia/Taipei">Asia/Taipei</SelectItem>
                  <SelectItem value="Asia/Seoul">Asia/Seoul</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Section>

        <Section title="業務ルール" description="予約キャンセル・ポイント有効期限">
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label required>キャンセル受付（時間前）</Label>
              <Input
                type="number"
                min={0}
                max={168}
                {...form.register("cancellationWindowHours", {
                  valueAsNumber: true,
                })}
              />
              <p className="text-xs text-muted-foreground">
                予約開始時刻の何時間前まで無料キャンセル可能か
              </p>
            </div>
            {/* ポイント有効期限は固定ルール（変更不可・表示のみ）*/}
            <div className="grid gap-1.5">
              <Label>ポイント有効期限</Label>
              <div className="h-9 rounded-md border border-input bg-muted/30 px-3 py-1 text-sm flex items-center">
                翌年末まで（固定ルール）
              </div>
              <p className="text-xs text-muted-foreground">
                取得時期に関わらず、翌年の 12/31 に一括失効。
                <br />
                例：2026 年内に取得したポイント → 2027/12/31 失効
              </p>
            </div>
          </div>
        </Section>

        <Section title="外部サービス連携" description="Stripe Connect 決済">
          <div className="p-5 grid gap-3">
            <div className="grid gap-1.5">
              <Label required className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Stripe 公開鍵（Publishable Key）
              </Label>
              <Input
                {...form.register("stripePublishableKey")}
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                秘密鍵は環境変数で管理。ここでは公開鍵のみ設定。
              </p>
            </div>
            <div className="p-3 bg-muted/40 rounded-md text-xs text-muted-foreground flex items-start gap-2">
              <Globe className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <div>
                Stripe Connect Express アカウントで各コーチへ自動送金。手数料設定は{" "}
                <a href="/commission" className="text-primary hover:underline">
                  手数料設定
                </a>
                {" "}を参照。
              </div>
            </div>
          </div>
        </Section>

        <Section title="プラットフォーム運用" description="メンテナンス・新規登録">
          <div className="p-5 grid gap-3">
            <div className="flex items-center justify-between border rounded-md px-4 py-3">
              <div>
                <div className="text-sm font-medium">メンテナンスモード</div>
                <div className="text-xs text-muted-foreground">
                  ON にすると全利用者のアクセスをブロックし、メンテ画面を表示
                </div>
              </div>
              <Switch
                checked={form.watch("maintenanceMode")}
                onCheckedChange={(v) => form.setValue("maintenanceMode", v)}
              />
            </div>
            <div className="flex items-center justify-between border rounded-md px-4 py-3">
              <div>
                <div className="text-sm font-medium">新規登録受付</div>
                <div className="text-xs text-muted-foreground">
                  OFF にすると一般ユーザーの新規登録を停止
                </div>
              </div>
              <Switch
                checked={form.watch("registrationOpen")}
                onCheckedChange={(v) => form.setValue("registrationOpen", v)}
              />
            </div>
          </div>
        </Section>

        <div className="flex items-center justify-between gap-3 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            最終更新：{formatDate(settings.updatedAt, true)} by{" "}
            {settings.updatedBy}
          </div>
          <Button type="submit" loading={form.formState.isSubmitting}>
            <Save className="w-4 h-4" />
            変更を保存
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
