import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { toast } from "sonner";

const BankSettings = () => {
  const navigate = useNavigate();
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [accountType, setAccountType] = useState("普通");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const initialRef = useRef(JSON.stringify({ bankName: "", branchName: "", accountType: "普通", accountNumber: "", accountHolder: "" }));
  const isDirty = useCallback(
    () => JSON.stringify({ bankName, branchName, accountType, accountNumber, accountHolder }) !== initialRef.current,
    [bankName, branchName, accountType, accountNumber, accountHolder]
  );

  const handleSave = () => {
    if (!bankName || !branchName || !accountNumber || !accountHolder) {
      toast.error("全ての項目を入力してください");
      return;
    }
    toast.success("口座情報を保存しました");
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
    <InnerPageLayout title="口座設定" ctaLabel="保存する" onCtaClick={handleSave} onBack={handleBack}>
      <div className="space-y-5 -mt-2">
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">銀行名</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="例：三菱UFJ銀行"
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">支店名</label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="例：渋谷支店"
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">口座種別</label>
          <div className="flex gap-3">
            {["普通", "当座"].map((type) => (
              <button
                key={type}
                onClick={() => setAccountType(type)}
                className={`flex-1 h-12 rounded-[4px] border text-sm font-bold transition-colors ${
                  accountType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-foreground hover:bg-muted/50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">口座番号</label>
          <input
            type="text"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="1234567"
            maxLength={7}
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-bold text-foreground mb-1.5 block">口座名義（カナ）</label>
          <input
            type="text"
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="タナカ タロウ"
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default BankSettings;
