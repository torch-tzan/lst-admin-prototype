import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <InnerPageLayout
      title="パスワード再設定"
      ctaLabel="認証コードを送信"
      ctaDisabled={!isValid}
      onCtaClick={() => navigate("/forgot-password/otp", { state: { email } })}
      onBack={() => navigate("/login")}
    >
      <div className="space-y-5 pt-2">
        <p className="text-sm text-muted-foreground leading-relaxed">
          登録済みのメールアドレスを入力してください。パスワード再設定用の認証コードを送信します。
        </p>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default ForgotPassword;
