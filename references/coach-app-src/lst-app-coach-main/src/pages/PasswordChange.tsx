import { useState, useCallback } from "react";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { Eye, EyeOff } from "lucide-react";
import { getPasswordStrength } from "@/lib/passwordUtils";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PasswordChange = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    strength.score >= 2;

  const isDirty = useCallback(
    () => currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0,
    [currentPassword, newPassword, confirmPassword]
  );

  const handleSubmit = () => {
    if (!isValid) return;
    toast.success("パスワードを変更しました");
    navigate(-1);
  };

  const handleBack = () => {
    if (isDirty()) {
      setShowUnsavedAlert(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <InnerPageLayout title="パスワード変更" ctaLabel="変更する" onCtaClick={handleSubmit} ctaDisabled={!isValid} onBack={handleBack}>
      <div className="space-y-5 -mt-2">
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">現在のパスワード</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="現在のパスワード"
              className="w-full h-12 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">新しいパスワード</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="8文字以上の英数字"
              className="w-full h-12 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"}`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{strength.label}</span>
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">新しいパスワード（確認）</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="もう一度入力してください"
              className="w-full h-12 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-destructive mt-1">パスワードが一致しません</p>
          )}
        </div>
      </div>

      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default PasswordChange;
