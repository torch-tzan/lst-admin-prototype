import { useState } from "react";
import PhoneMockup from "@/components/PhoneMockup";
import BottomNav from "@/components/BottomNav";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/lib/userProfileStore";
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
import {
  Bell,
  ChevronRight,
  Globe,
  LogOut,
  User,
  Star,
  Calendar,
  Landmark,
  KeyRound,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  sub?: string;
  path?: string;
  badge?: string;
  destructive?: boolean;
  action?: string;
}

const menuSections: { title?: string; items: MenuItem[] }[] = [
  {
    title: "コーチングメニュー",
    items: [
      { icon: MapPin, label: "場地設定", path: "/venue-settings" },
      { icon: GraduationCap, label: "教課設定", path: "/course-settings" },
      { icon: Calendar, label: "スケジュール設定", path: "/schedule-settings" },
      { icon: Star, label: "受けた評価", path: "/reviews" },
    ],
  },
  {
    title: "設定",
    items: [
      { icon: Landmark, label: "口座設定", path: "/bank-settings" },
      { icon: KeyRound, label: "パスワード変更", path: "/password-change" },
      { icon: Globe, label: "言語切替", sub: "日本語", path: "/language" },
    ],
  },
  {
    items: [
      { icon: LogOut, label: "ログアウト", destructive: true, action: "logout" },
    ],
  },
];

const MyPage = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [showLogout, setShowLogout] = useState(false);
  const bottomNav = <BottomNav active={5} />;

  const handleMenuClick = (item: MenuItem) => {
    if (item.action === "logout") {
      setShowLogout(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    navigate("/login");
  };

  return (
    <PhoneMockup bottomNav={bottomNav}>
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-3 relative flex items-center justify-center">
            <h1 className="text-xl font-bold text-foreground">マイページ</h1>
            <button onClick={() => navigate("/notifications")} className="absolute right-[20px] w-9 h-9 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
            </button>
          </div>
          <Separator />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-6">
          {/* Profile card */}
          <button onClick={() => navigate("/profile/edit")} className="w-full text-left">
            <div className="px-[20px] pt-5 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-lg font-bold text-foreground">{profile.name}</p>
                    <span className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {profile.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-accent text-accent">
                      コーチモード
                    </span>
                    <span className="text-xs text-muted-foreground">★ {profile.rating}</span>
                  </div>
                </div>
                <div className="p-2 text-muted-foreground">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </button>

          {/* Earnings card */}
          <div className="px-[20px] mb-4">
            <div className="bg-gray-5 rounded-[8px] px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-primary-foreground/60 font-medium">今月の報酬</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-primary">¥{profile.monthlyEarnings.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/earnings")}
                className="bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-[4px] hover:opacity-90 transition-opacity"
              >
                報酬履歴
              </button>
            </div>
          </div>

          <Separator />

          {/* Menu sections */}
          {menuSections.map((section, si) => (
            <div key={si}>
              {section.title && (
                <p className="px-[20px] pt-4 pb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  {section.title}
                </p>
              )}
              {section.items.map((item, ii) => (
                <button
                  key={ii}
                  onClick={() => handleMenuClick(item)}
                  className="w-full flex items-center gap-3 px-[20px] py-3.5 hover:bg-muted/50 transition-colors text-left"
                >
                  <item.icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      item.destructive ? "text-destructive" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`flex-1 text-sm font-medium ${
                      item.destructive ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.sub && (
                    <span className="text-xs text-muted-foreground">{item.sub}</span>
                  )}
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                  {item.path && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                  )}
                </button>
              ))}
              {si < menuSections.length - 1 && <Separator />}
            </div>
          ))}

          <p className="text-center text-[10px] text-muted-foreground mt-6">PADEL BASE Coach v1.0.0</p>
        </div>
      </div>

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent className="rounded-[8px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">ログアウト</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              ログアウトしてもよろしいですか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px]">キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground rounded-[4px]">
              ログアウト
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PhoneMockup>
  );
};

export default MyPage;
