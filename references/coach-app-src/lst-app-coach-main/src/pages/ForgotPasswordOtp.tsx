import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const ForgotPasswordOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string })?.email ?? "";
  const [otp, setOtp] = useState("");

  const isComplete = otp.length === 6;

  return (
    <InnerPageLayout
      title="認証コード"
      ctaLabel="認証する"
      ctaDisabled={!isComplete}
      onCtaClick={() => navigate("/forgot-password/reset", { state: { email } })}
      onBack={() => navigate("/forgot-password")}
    >
      <div className="flex flex-col items-center gap-6 pt-4">
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          <span className="font-medium text-foreground">{email || "your@email.com"}</span>
          <br />
          に送信された6桁の認証コードを入力してください
        </p>

        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <button
          type="button"
          className="text-sm text-primary font-medium"
          onClick={() => {}}
        >
          コードを再送信する
        </button>
      </div>
    </InnerPageLayout>
  );
};

export default ForgotPasswordOtp;
