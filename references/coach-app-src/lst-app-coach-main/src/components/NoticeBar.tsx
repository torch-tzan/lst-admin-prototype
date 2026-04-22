import { AlertTriangle } from "lucide-react";

const NoticeBar = () => {
  return (
    <div className="mx-[20px] bg-card rounded-[8px] px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-notice flex-shrink-0" />
        <p className="text-sm font-bold text-card-foreground">メンテナンスのお知らせ</p>
      </div>
      <p className="text-xs text-muted-foreground truncate">3/20 10:00〜12:00 システムメンテナンスのため一部機能が停止します</p>
    </div>
  );
};

export default NoticeBar;
