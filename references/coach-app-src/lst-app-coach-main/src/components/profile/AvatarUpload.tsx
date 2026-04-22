import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface AvatarUploadProps {
  avatarPreview: string | null;
  onAvatarChange: (preview: string | null) => void;
}

const AvatarUpload = ({ avatarPreview, onAvatarChange }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  const handleSelectPhoto = () => {
    setShowPhotoSheet(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      onAvatarChange(ev.target?.result as string);
      toast.success("写真を変更しました");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setShowPhotoSheet(false);
    onAvatarChange(null);
    toast.success("写真を削除しました");
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex justify-center mb-6">
        <button onClick={() => setShowPhotoSheet(true)} className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="プロフィール写真" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </button>
      </div>

      <AlertDialog open={showPhotoSheet} onOpenChange={setShowPhotoSheet}>
        <AlertDialogContent className="rounded-[8px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">プロフィール写真</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              写真を選択してください
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSelectPhoto}
              className="w-full h-12 rounded-[4px] bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
            >
              写真を選択
            </button>
            {avatarPreview && (
              <button
                onClick={handleRemovePhoto}
                className="w-full h-12 rounded-[4px] border border-destructive text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors"
              >
                写真を削除
              </button>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px] w-full">キャンセル</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AvatarUpload;
