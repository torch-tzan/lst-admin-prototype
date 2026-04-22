import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PhoneMockup from "@/components/PhoneMockup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const LINE_GREEN = "#06C755";

const Signup = () => {
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <PhoneMockup>
      <div className="flex flex-col min-h-full bg-background">
        {/* Dark header with back button */}
        <div className="bg-gray-5 py-3 px-4 pb-4">
          <button onClick={() => navigate("/welcome")} className="text-primary-foreground">
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Form area */}
        <div className="flex-1 px-[20px] pt-8 pb-8">
          <h1 className="text-xl font-bold text-center text-foreground mb-8">新規登録</h1>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-bold text-foreground mb-1.5 block">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="メールアドレス"
                className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Terms */}
            <div className="flex items-center justify-center gap-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v === true)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <label htmlFor="terms" className="text-sm text-foreground">
                <button
                  type="button"
                  onClick={() => navigate("/terms")}
                  className="text-primary font-medium underline"
                >
                  利用規約
                </button>
                に同意する
              </label>
            </div>

            {/* Next */}
            <Button
              className="w-full h-14 rounded-[8px] text-base font-bold bg-primary text-primary-foreground hover:opacity-90"
              disabled={!agreed || !email}
              onClick={() => navigate("/signup/otp", { state: { email } })}
            >
              次へ
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-sm text-muted-foreground">または</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* LINE Login */}
            <button
              onClick={() => navigate("/signup/social", { state: { provider: "line" } })}
              className="w-full h-14 rounded-[8px] text-base font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: LINE_GREEN }}
            >
              <LineIcon />
              LINEアカウントで登録
            </button>

            {/* Google Login */}
            <button
              onClick={() => navigate("/signup/social", { state: { provider: "google" } })}
              className="w-full h-14 rounded-[8px] text-base font-bold text-foreground border border-border flex items-center justify-center gap-2 bg-card hover:bg-muted/50"
            >
              <GoogleIcon />
              Googleアカウントで登録
            </button>

            {/* Link to login */}
            <p className="text-center text-sm text-muted-foreground pt-2">
              既に登録済みの方は
              <button onClick={() => navigate("/login")} className="text-primary font-medium ml-1">
                ログイン
              </button>
            </p>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};

const LineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.9 7.35 2.56 10.52l7.97-5.93z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.93C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default Signup;
