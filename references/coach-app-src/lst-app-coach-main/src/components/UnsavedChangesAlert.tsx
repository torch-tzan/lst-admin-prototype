import { useNavigate } from "react-router-dom";
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

interface UnsavedChangesAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UnsavedChangesAlert = ({ open, onOpenChange }: UnsavedChangesAlertProps) => {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[8px] max-w-[320px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base">変更が保存されていません</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            保存せずに戻ると、変更内容が失われます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-[4px]">編集に戻る</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => navigate(-1)}
            className="bg-destructive text-destructive-foreground rounded-[4px]"
          >
            保存せず戻る
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesAlert;
