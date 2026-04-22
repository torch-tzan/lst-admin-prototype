"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { TEST_ACCOUNTS, useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Shield,
  RotateCcw,
  ChevronRight,
  Users,
  Wallet,
  CalendarCheck,
  Lock,
  Zap,
} from "lucide-react";
import { resetAllMockData, MOCK_KEYS } from "@/lib/use-mock-crud";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("正しいメールアドレス"),
  password: z.string().min(6, "パスワードは 6 文字以上"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"form" | "demo">("form");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onFormLogin = async (data: LoginForm) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    // メールアドレスで TEST_ACCOUNTS を検索
    const match = TEST_ACCOUNTS.find((a) => a.email === data.email);
    if (!match) {
      setLoading(false);
      toast.error("メールアドレスまたはパスワードが正しくありません");
      form.setError("email", {
        message: "アカウントが見つかりません（デモ用）",
      });
      return;
    }
    login(match);
    toast.success(`ログインしました：${match.name}`);
    router.push("/dashboard");
  };

  const onQuickLogin = (acc: typeof TEST_ACCOUNTS[number]) => {
    login(acc);
    toast.success(`ログインしました：${acc.name}`);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-slate-900">
      {/* 左：ブランド説明（深色） */}
      <div className="hidden lg:flex lg:col-span-2 flex-col justify-between p-12 text-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">L</span>
            </div>
            <div className="font-bold text-white text-lg tracking-wide">
              LST 運営管理
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            パデルプラットフォーム
            <br />
            統合運営ダッシュボード
          </h2>
          <p className="text-slate-400 leading-relaxed">
            加盟店・会員・コーチ・予約・決済・キャンペーンを一元管理。Stripe
            Connect 経由の自動出金とリアルタイム KPI を提供します。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Feature icon={Users} label="会員管理" sub="3,842 名" />
          <Feature icon={Building2} label="加盟店" sub="24 企業" />
          <Feature icon={CalendarCheck} label="今月予約" sub="1,248 件" />
          <Feature icon={Wallet} label="GMV" sub="¥12.85M" />
        </div>

        <div className="text-xs text-slate-500">
          © 2026 LST Platform · Prototype v0.2
        </div>
      </div>

      {/* 右：ログイン */}
      <div className="lg:col-span-3 bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  L
                </span>
              </div>
              <div className="font-bold tracking-wide">LST 運営管理</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">ログイン</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {mode === "form"
              ? "メールアドレスとパスワードでログイン"
              : "デモアカウントをワンクリックで選択"}
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex items-center bg-white border rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("form")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                mode === "form"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Lock className="w-3.5 h-3.5" />
              通常ログイン
            </button>
            <button
              type="button"
              onClick={() => setMode("demo")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                mode === "demo"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-3.5 h-3.5" />
              デモ（ワンクリック）
            </button>
          </div>

          {/* 通常ログインフォーム */}
          {mode === "form" && (
            <form
              onSubmit={form.handleSubmit(onFormLogin)}
              className="bg-white border rounded-lg p-6 space-y-4"
            >
              <div className="grid gap-1.5">
                <Label htmlFor="email" required>
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@lst.example"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required>
                    パスワード
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info(
                        "パスワードリセットは実装予定です（本番は Supabase Auth）"
                      );
                    }}
                  >
                    パスワードをお忘れですか？
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  className="rounded border-input"
                  defaultChecked
                />
                <Label htmlFor="remember" className="text-xs font-normal">
                  このデバイスを記憶する（30 日間）
                </Label>
              </div>

              <Button type="submit" className="w-full" loading={loading}>
                ログイン
              </Button>

              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                デモ用：admin@lst.example / 任意のパスワード（6 文字以上）
              </div>
            </form>
          )}

          {/* デモアカウント ワンクリック */}
          {mode === "demo" && (
            <div className="space-y-2.5">
              {TEST_ACCOUNTS.map((acc) => (
                <button
                  key={acc.id}
                  className="w-full text-left bg-white border rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all group"
                  onClick={() => onQuickLogin(acc)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        acc.role === "lst-admin"
                          ? "bg-primary/10 text-primary"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {acc.role === "lst-admin" ? (
                        <Shield className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm truncate">
                          {acc.name}
                        </span>
                        <Badge
                          variant={
                            acc.role === "lst-admin" ? "default" : "success"
                          }
                          className="text-[10px] h-4 px-1.5 shrink-0"
                        >
                          {acc.role === "lst-admin" ? "運営" : "企業"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {acc.email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {acc.role === "lst-admin"
                          ? "全加盟店・全会員・コーチ審査・決済・手数料設定など運営全般"
                          : `${
                              acc.venueId === "v1"
                                ? "パデルコート広島"
                                : "北広島パデルクラブ"
                            } の予約・コート・備品・スタッフ・売上管理`}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetAllMockData(Object.values(MOCK_KEYS));
                toast.success("全てのデモデータをリセットしました");
              }}
              className="text-muted-foreground"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              デモデータをリセット
            </Button>
            <div className="text-xs text-muted-foreground">
              v0.2 · localStorage mock
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-10 leading-relaxed">
            本プロトタイプは localStorage でログインとデータ永続化を模擬しています。
            <br />
            本番は Supabase Auth + Stripe Connect に接続予定。
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
}) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-lg px-4 py-3">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-white mt-0.5">{sub}</div>
    </div>
  );
}
