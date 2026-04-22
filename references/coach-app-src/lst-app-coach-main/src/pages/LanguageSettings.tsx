import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { Check } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文（简体）" },
];

const LanguageSettings = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState("ja");
  const [selected, setSelected] = useState("ja");
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const hasChanged = selected !== saved;

  const handleConfirm = () => {
    setSaved(selected);
    toast.success("言語を変更しました");
    navigate(-1);
  };

  const handleBack = () => {
    if (hasChanged) {
      setShowUnsavedAlert(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <InnerPageLayout title="言語切替" onBack={handleBack}>
      <div className="-mx-[20px] -mt-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setSelected(lang.code)}
            className="w-full flex items-center justify-between px-[20px] py-4 hover:bg-muted/50 transition-colors text-left"
          >
            <span className={`text-sm font-medium ${selected === lang.code ? "text-primary font-bold" : "text-foreground"}`}>
              {lang.label}
            </span>
            {selected === lang.code && <Check className="w-5 h-5 text-primary" />}
          </button>
        ))}
      </div>

      <div className="mt-8 px-0">
        <button
          onClick={handleConfirm}
          disabled={!hasChanged}
          className="w-full h-12 rounded-[4px] bg-primary text-primary-foreground text-sm font-bold disabled:opacity-40 transition-opacity"
        >
          変更を確定する
        </button>
      </div>

      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default LanguageSettings;
