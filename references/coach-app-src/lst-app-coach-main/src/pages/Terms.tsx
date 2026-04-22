import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";

const termsData = [
  {
    title: "第1条（適用）",
    content:
      "本規約は、PADELico BASE（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意の上、当サービスを利用するものとします。",
  },
  {
    title: "第2条（会員登録）",
    content:
      "会員登録を希望する方は、当サービスの定める方法により登録を申請し、承認を受けるものとします。登録にあたり、正確かつ最新の情報を提供してください。",
  },
  {
    title: "第3条（予約・キャンセル）",
    content:
      "予約の変更・キャンセルは、利用開始時刻の15分前まで可能です。期限を過ぎたキャンセルについてはキャンセル料が発生する場合があります。",
  },
  {
    title: "第4条（禁止事項）",
    content:
      "ユーザーは以下の行為を行ってはなりません。\n・法令または公序良俗に違反する行為\n・不正アクセスまたはそれに類する行為\n・他のユーザーへの迷惑行為\n・当サービスの運営を妨害する行為",
  },
  {
    title: "第5条（個人情報の取扱い）",
    content:
      "当サービスにおける個人情報の取扱いについては、別途定めるプライバシーポリシーに従うものとします。",
  },
];

const Terms = () => {
  const navigate = useNavigate();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || hasScrolledToBottom) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 20) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  return (
    <InnerPageLayout
      title="利用規約"
      ctaLabel="確認"
      ctaDisabled={!hasScrolledToBottom}
      onCtaClick={() => navigate(-1)}
      scrollRef={scrollRef}
      onScroll={handleScroll}
    >
      <div className="space-y-8">
        {termsData.map((section) => (
          <div key={section.title}>
            <h2 className="text-base font-bold text-foreground mb-3">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </InnerPageLayout>
  );
};

export default Terms;
