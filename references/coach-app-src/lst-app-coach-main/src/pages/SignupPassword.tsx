import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordStrength } from "@/lib/passwordUtils";

const SignupPassword = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const isValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);
  const isMatch = password === confirm && confirm.length > 0;
  const canSubmit = name.trim().length > 0 && isValid && isMatch && agreed;

  return (
    <InnerPageLayout
      title="会員登録"
      ctaLabel="会員登録する"
      ctaDisabled={!canSubmit}
      onCtaClick={() => navigate("/signup/complete")}
      onBack={() => navigate(-1)}
    >
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">氏名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例）山田 太郎"
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">パスワード</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8文字以上で入力してください"
              className="w-full h-12 px-4 pr-12 rounded-[8px] border border-border bg-background text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">8文字以上の英数字を使用してください</p>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strength.score ? strength.color : "bg-muted"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                パスワード強度: <span className="font-medium text-foreground">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">パスワード確認</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="パスワードを再入力"
              className="w-full h-12 px-4 pr-12 rounded-[8px] border border-border bg-background text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirm.length > 0 && !isMatch && (
            <p className="text-xs text-destructive mt-1.5">パスワードが一致しません</p>
          )}
          {isMatch && (
            <p className="text-xs text-green-600 mt-1.5">パスワードが一致しました</p>
          )}
        </div>

        {/* Terms agreement */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="terms-agree"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <label htmlFor="terms-agree" className="text-sm text-foreground">
            <button
              type="button"
              onClick={() => navigate("/terms")}
              className="text-primary font-medium underline"
            >
              利用規約
            </button>
            に同意する
          </label>
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default SignupPassword;
