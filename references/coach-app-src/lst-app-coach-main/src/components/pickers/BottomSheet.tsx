import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

const BottomSheet = ({
  open,
  title,
  onClose,
  onConfirm,
  onClear,
  confirmLabel,
  confirmDisabled,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  onClear?: () => void;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  const container = document.getElementById("phone-container");
  if (!container) return null;

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/30" onClick={onClose} />
      <div className="relative bg-background rounded-t-2xl pb-8 max-h-[70%] flex flex-col">
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="flex items-center justify-between px-4 pb-3">
          {onClear ? (
            <button onClick={onClear} className="text-xs text-muted-foreground">
              クリア
            </button>
          ) : (
            <div className="w-10" />
          )}
          <p className="text-base font-bold text-foreground">{title}</p>
          <div className="w-10" />
        </div>
        <div className="flex-1 overflow-y-auto px-4">{children}</div>
        <div className="px-4 pt-3">
          <Button onClick={onConfirm} disabled={confirmDisabled} className="w-full h-12 rounded-[8px] text-base font-bold disabled:opacity-40">
            {confirmLabel || "確定"}
          </Button>
        </div>
      </div>
    </div>,
    container
  );
};

export default BottomSheet;
