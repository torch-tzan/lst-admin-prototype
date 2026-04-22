import InnerPageLayout from "@/components/InnerPageLayout";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface NotificationData {
  id: string;
  title: string;
  date: string;
  body: string;
}

const MOCK_DETAILS: Record<string, NotificationData> = {
  "1": {
    id: "1",
    title: "春の新規登録キャンペーン！",
    date: "2026/04/14",
    body: "いつもPADEL BASEをご利用いただきありがとうございます。\n\nただいま春の新規登録キャンペーンを実施中です！\n\n■ キャンペーン期間\n2026年4月1日〜4月30日\n\n■ 特典内容\n期間中に新規会員登録をされた方に、もれなく500ポイントをプレゼントいたします。\n\n■ 条件\n・期間中に新規会員登録を完了すること\n・ポイントは登録完了後、自動的に付与されます\n\nこの機会にぜひご登録ください！",
  },
  "2": {
    id: "2",
    title: "ポイント付与のお知らせ",
    date: "2026/04/12",
    body: "予約利用によるポイントが付与されました。\n\n■ 付与ポイント: +3pt\n■ 対象予約: パデルコート広島 コートA\n■ 利用日: 2026/04/10\n\n現在の保有ポイント: 1,250pt\n\nポイントは次回の予約時にご利用いただけます。",
  },
  "3": {
    id: "3",
    title: "システムメンテナンスのお知らせ",
    date: "2026/04/10",
    body: "いつもPADEL BASEをご利用いただきありがとうございます。\n\n下記日程にてシステムメンテナンスを実施いたします。\n\n■ メンテナンス日時\n2026年4月20日（月）2:00〜5:00\n\n■ 影響範囲\nメンテナンス中は全サービスをご利用いただけません。\n\nご不便をおかけしますが、ご理解のほどよろしくお願いいたします。",
  },
  "4": {
    id: "4",
    title: "友達紹介で500ptプレゼント",
    date: "2026/04/05",
    body: "お友達をPADEL BASEに招待すると、招待した方・された方の両方に500ポイントをプレゼント！\n\n■ 参加方法\nマイページの「友達を招待」から招待リンクを共有してください。\n\n■ 条件\n・招待されたお友達が会員登録を完了すること\n・ポイントは登録完了後に自動付与されます\n\nぜひお友達と一緒にパデルを楽しみましょう！",
  },
  "5": {
    id: "5",
    title: "利用規約改定のお知らせ",
    date: "2026/04/01",
    body: "いつもPADEL BASEをご利用いただきありがとうございます。\n\n2026年5月1日より、利用規約の一部を改定いたします。\n\n■ 主な変更点\n・第5条（予約キャンセルポリシー）の変更\n・第8条（ポイント有効期限）の追加\n\n改定後の利用規約は、アプリ内「利用規約」ページよりご確認いただけます。\n\n引き続きPADEL BASEをよろしくお願いいたします。",
  },
};

const NotificationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const notification = MOCK_DETAILS[id || ""];

  if (!notification) {
    return (
      <InnerPageLayout title="お知らせ">
        <div className="flex items-center justify-center pt-20">
          <p className="text-sm text-muted-foreground">お知らせが見つかりません</p>
        </div>
      </InnerPageLayout>
    );
  }

  return (
    <InnerPageLayout title="お知らせ">
      <div className="-mt-2">
        <span className="text-xs text-muted-foreground">{notification.date}</span>
        <h2 className="text-lg font-bold text-foreground leading-snug mt-1">{notification.title}</h2>
        <Separator className="my-4" />
        <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {notification.body}
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default NotificationDetail;
