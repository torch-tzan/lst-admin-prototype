import { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { getPasswordStrength } from "@/lib/passwordUtils";
import { toast } from "sonner";

interface PasswordChangeDialogProps {
  open: boolean;
  onClose: () => void;
}

const PasswordChangeDialog = ({ open, onClose }: PasswordChangeDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword;
  const isValid =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    strength.score >= 2;

  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    onClose();
  };

  const handleSubmit = () => {
    if (!isValid) return;
    handleCancel();
    toast.success("パスワードを変更しました");
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleCancel(); }}>
      <AlertDialogContent className="rounded-[8px] max-w-[320px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">パスワード変更</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            現在のパスワードと新しいパスワードを入力してください。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3">
          {/* Current Password */}
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">現在のパスワード</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="現在のパスワード"
                className="w-full h-11 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">新しいパスワード</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8文字以上の英数字"
                className="w-full h-11 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {newPassword && (
              <div className="mt-1.5 flex items-center gap-2">
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

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">新しいパスワード（確認）</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="もう一度入力してください"
                className="w-full h-11 px-4 pr-10 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive mt-1">パスワードが一致しません</p>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-[4px]" onClick={handleCancel}>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            className="bg-primary text-primary-foreground rounded-[4px]"
            disabled={!isValid}
          >
            変更する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasswordChangeDialog;
