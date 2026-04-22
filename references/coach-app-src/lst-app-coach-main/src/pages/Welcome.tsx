import { useNavigate } from "react-router-dom";
import appLogo from "@/assets/app-logo.png";
import PhoneMockup from "@/components/PhoneMockup";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <PhoneMockup>
      <div className="flex flex-col items-center justify-center min-h-full px-[20px] bg-background relative">
        {/* Decorative padel racket shapes */}
        <div className="absolute top-12 right-[-30px] w-[120px] h-[120px] rounded-full border-[3px] border-muted opacity-40 rotate-[-20deg]" />
        <div className="absolute bottom-24 left-[-40px] w-[140px] h-[140px] rounded-full border-[3px] border-muted opacity-30 rotate-[15deg]" />

        {/* Logo */}
        <div className="flex-1 flex items-center justify-center">
          <img src={appLogo} alt="PADEL BASE" style={{ width: 220 }} />
        </div>

        {/* Buttons */}
        <div className="w-full pb-16 space-y-5">
          <Button
            onClick={() => navigate("/signup")}
            className="w-full h-14 rounded-[8px] text-base font-bold bg-primary text-primary-foreground hover:opacity-90"
          >
            新規会員登録
          </Button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">既にアカウントをお持ちの方</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full h-14 rounded-[8px] text-base font-bold border-primary text-primary hover:bg-primary/5"
          >
            ログイン
          </Button>
        </div>
      </div>
    </PhoneMockup>
  );
};

export default Welcome;
