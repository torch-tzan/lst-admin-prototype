import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { Separator } from "@/components/ui/separator";
import AvatarUpload from "@/components/profile/AvatarUpload";
import EmailChangeDialog from "@/components/profile/EmailChangeDialog";
import { useUserProfile, SPECIALTY_OPTIONS, CERTIFICATION_OPTIONS } from "@/lib/userProfileStore";
import { toast } from "sonner";
import { X, Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const TagSelector = ({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);

  const toggle = (item: string) => {
    onChange(
      selected.includes(item)
        ? selected.filter((s) => s !== item)
        : [...selected, item]
    );
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {selected.map((s) => (
          <span
            key={s}
            className="text-xs font-medium pl-3 pr-1.5 py-1.5 rounded-full border border-accent text-accent flex items-center gap-1"
          >
            {s}
            <button
              type="button"
              onClick={() => onChange(selected.filter((v) => v !== s))}
              className="w-4 h-4 rounded-full hover:bg-accent/10 flex items-center justify-center"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-medium px-3 py-1.5 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          追加
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[340px] rounded-[12px]">
          <DialogHeader>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-wrap gap-2 mt-2">
            {options.map((opt) => {
              const isSelected = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggle(opt)}
                  className={`text-xs font-medium px-3 py-2 rounded-full border transition-colors flex items-center gap-1 ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {opt}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-full h-11 rounded-[8px] bg-primary text-primary-foreground text-sm font-bold mt-2"
          >
            完了
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useUserProfile();
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio);
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties);
  const [certifications, setCertifications] = useState<string[]>(profile.certifications);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const initialRef = useRef(JSON.stringify({
    name: profile.name, phone: profile.phone, bio: profile.bio,
    specialties: profile.specialties, certifications: profile.certifications,
  }));
  const isDirty = useCallback(
    () => JSON.stringify({ name, phone, bio, specialties, certifications }) !== initialRef.current,
    [name, phone, bio, specialties, certifications]
  );

  const handleSave = () => {
    updateProfile({ name, phone, bio, specialties, certifications });
    toast.success("プロフィールを更新しました");
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
    <InnerPageLayout title="プロフィール編集" ctaLabel="保存する" onCtaClick={handleSave} onBack={handleBack}>
      <div className="-mt-2">
        <AvatarUpload
          avatarPreview={profile.avatar}
          onAvatarChange={(avatar) => updateProfile({ avatar })}
        />
        <Separator className="mb-5" />

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-1.5 block">名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-1.5 block">メールアドレス</label>
          <div className="flex gap-2">
            <div className="flex-1 h-12 px-4 rounded-[8px] border border-border bg-muted/30 text-sm flex items-center text-foreground">
              {profile.email}
            </div>
            <button
              onClick={() => setShowEmailChange(true)}
              className="h-12 px-4 rounded-[4px] border border-primary text-primary text-xs font-bold hover:bg-primary/5 transition-colors flex-shrink-0"
            >
              変更する
            </button>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-1.5 block">電話番号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-2 block">専門分野</label>
          <TagSelector
            title="専門分野を選択"
            options={SPECIALTY_OPTIONS}
            selected={specialties}
            onChange={setSpecialties}
          />
        </div>

        <Separator className="mb-5" />

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-1.5 block">自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="mb-5">
          <label className="text-sm font-bold text-foreground mb-2 block">資格・認定</label>
          <TagSelector
            title="資格・認定を選択"
            options={CERTIFICATION_OPTIONS}
            selected={certifications}
            onChange={setCertifications}
          />
        </div>
      </div>

      <EmailChangeDialog
        email={profile.email}
        onEmailChanged={(newEmail) => updateProfile({ email: newEmail })}
        open={showEmailChange}
        onClose={() => setShowEmailChange(false)}
      />
      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default ProfileEdit;
