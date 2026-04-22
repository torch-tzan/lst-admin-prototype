import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { CheckCircle } from "lucide-react";

const ForgotPasswordComplete = () => {
  const navigate = useNavigate();

  return (
    <InnerPageLayout
      title="パスワード再設定"
      ctaLabel="ログイン画面へ"
      onCtaClick={() => navigate("/login")}
      hideBack
    >
      <div className="flex flex-col items-center justify-center gap-4 pt-16">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold text-foreground">パスワードを再設定しました</h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          新しいパスワードでログインしてください。
        </p>
      </div>
    </InnerPageLayout>
  );
};

export default ForgotPasswordComplete;
