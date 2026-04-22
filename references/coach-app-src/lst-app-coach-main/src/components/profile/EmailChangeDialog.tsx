import { useState, useEffect, useCallback, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

type EmailStep = "idle" | "confirm" | "otp";

interface EmailChangeDialogProps {
  email: string;
  onEmailChanged: (newEmail: string) => void;
  open: boolean;
  onClose: () => void;
}

const EmailChangeDialog = ({ email, onEmailChanged, open, onClose }: EmailChangeDialogProps) => {
  const [emailStep, setEmailStep] = useState<EmailStep>("idle");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const transitioning = useRef(false);

  const startResendTimer = useCallback(() => {
    setResendCountdown(60);
  }, []);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    if (open && emailStep === "idle") {
      setNewEmail(email);
      setEmailStep("confirm");
    }
  }, [open, email, emailStep]);

  const handleCancel = () => {
    if (transitioning.current) {
      transitioning.current = false;
      return;
    }
    setEmailStep("idle");
    setNewEmail("");
    setOtp("");
    setResendCountdown(0);
    onClose();
  };

  const handleSendOtp = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      toast.error("有効なメールアドレスを入力してください");
      return;
    }
    transitioning.current = true;
    setOtp("");
    setEmailStep("otp");
    startResendTimer();
    toast.info(`${newEmail} に認証コードを送信しました`);
  };

  const handleVerifyOtp = () => {
    onEmailChanged(newEmail);
    setEmailStep("idle");
    setOtp("");
    setResendCountdown(0);
    onClose();
    toast.success("メールアドレスを変更しました");
  };

  return (
    <>
      {/* Step 1: Enter new email */}
      <AlertDialog open={emailStep === "confirm"} onOpenChange={(o) => { if (!o) handleCancel(); }}>
        <AlertDialogContent className="rounded-[8px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">メールアドレス変更</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              新しいメールアドレスを入力してください。認証コードを送信します。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="email"
            placeholder="新しいメールアドレス"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px]" onClick={handleCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendOtp}
              className="bg-primary text-primary-foreground rounded-[4px]"
              disabled={!newEmail || newEmail === email}
            >
              認証コードを送信
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Step 2: Enter OTP */}
      <AlertDialog open={emailStep === "otp"} onOpenChange={(o) => { if (!o) handleCancel(); }}>
        <AlertDialogContent className="rounded-[8px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">認証コード</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed">
              <span className="font-medium text-foreground">{newEmail}</span>
              <br />
              に送信された6桁の認証コードを入力してください
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-center py-2">
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
          </div>
          <button
            type="button"
            className={`text-sm font-medium text-center ${resendCountdown > 0 ? "text-muted-foreground cursor-not-allowed" : "text-primary"}`}
            disabled={resendCountdown > 0}
            onClick={() => {
              startResendTimer();
              toast.info(`${newEmail} に認証コードを再送信しました`);
            }}
          >
            {resendCountdown > 0 ? `コードを再送信する (${resendCountdown}s)` : "コードを再送信する"}
          </button>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px]" onClick={handleCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerifyOtp}
              className="bg-primary text-primary-foreground rounded-[4px]"
              disabled={otp.length !== 6}
            >
              認証する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmailChangeDialog;
