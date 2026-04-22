import { useNavigate } from "react-router-dom";
import PhoneMockup from "@/components/PhoneMockup";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const SignupComplete = () => {
  const navigate = useNavigate();

  return (
    <PhoneMockup>
      <div className="flex flex-col items-center justify-center min-h-full bg-background px-[20px]">
        <div className="flex flex-col items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
            <Check className="w-10 h-10 text-primary" strokeWidth={3} />
          </div>
          <h1 className="text-xl font-bold text-foreground">会員登録が完了しました</h1>
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            ご登録ありがとうございます。
            <br />
            サービスをご利用ください。
          </p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="w-full h-14 rounded-[8px] text-base font-bold bg-primary text-primary-foreground hover:opacity-90 mt-10"
        >
          さっそく始める
        </Button>
      </div>
    </PhoneMockup>
  );
};

export default SignupComplete;
