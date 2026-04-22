import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import AnimatedTabs from "@/components/AnimatedTabs";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { Switch } from "@/components/ui/switch";
import {
  getCoachCourses,
  saveCoachCourses,
  deleteCoachCourse,
  getVideoReviewSettings,
  saveVideoReviewSettings,
  type CoachCourse,
  type VideoReviewSettings,
} from "@/lib/coachSettingsStore";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Monitor, MapPin, FileVideo, AlertCircle } from "lucide-react";
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

const COURSE_TABS = [
  { key: "lesson", label: "レッスン" },
  { key: "video", label: "動画レビュー" },
];

const CourseSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lesson");
  const [courses, setCourses] = useState<CoachCourse[]>(getCoachCourses);
  const [videoReview, setVideoReview] = useState<VideoReviewSettings>(getVideoReviewSettings);
  const [editingCourse, setEditingCourse] = useState<CoachCourse | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [showEditUnsavedAlert, setShowEditUnsavedAlert] = useState(false);
  const editInitialRef = useRef<string>("");

  // Track initial state for dirty check
  const initialRef = useRef({
    courses: JSON.stringify(getCoachCourses()),
    videoReview: JSON.stringify(getVideoReviewSettings()),
  });

  const isDirty = useCallback(() => {
    return (
      JSON.stringify(courses) !== initialRef.current.courses ||
      JSON.stringify(videoReview) !== initialRef.current.videoReview
    );
  }, [courses, videoReview]);

  const openNewForm = () => {
    const newCourse: CoachCourse = {
      id: "",
      name: "",
      description: "",
      hourlyRate: 5000,
      supportsInPerson: true,
      supportsOnline: false,
    };
    setEditingCourse(newCourse);
    editInitialRef.current = JSON.stringify(newCourse);
    setIsNew(true);
  };

  const openEditForm = (course: CoachCourse) => {
    const copy = { ...course };
    setEditingCourse(copy);
    editInitialRef.current = JSON.stringify(copy);
    setIsNew(false);
  };

  const isEditDirty = () => {
    return editingCourse ? JSON.stringify(editingCourse) !== editInitialRef.current : false;
  };

  const handleEditBack = () => {
    if (isEditDirty()) {
      setShowEditUnsavedAlert(true);
    } else {
      setEditingCourse(null);
    }
  };

  const handleSaveCourse = () => {
    if (!editingCourse || !editingCourse.name.trim()) {
      toast.error("コース名を入力してください");
      return;
    }
    if (!editingCourse.supportsInPerson && !editingCourse.supportsOnline) {
      toast.error("少なくとも1つの形式を選択してください");
      return;
    }

    let updated: CoachCourse[];
    if (isNew) {
      const newCourse = { ...editingCourse, id: `course-${Date.now()}` };
      updated = [...courses, newCourse];
    } else {
      updated = courses.map((c) => (c.id === editingCourse.id ? editingCourse : c));
    }

    saveCoachCourses(updated);
    setCourses(updated);
    setEditingCourse(null);
    toast.success(isNew ? "コースを追加しました" : "コースを更新しました");
  };

  const handleDelete = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
    toast.success("コースを削除しました");
  };

  const handleVideoReviewChange = (updates: Partial<VideoReviewSettings>) => {
    setVideoReview((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveVideoReview = () => {
    saveVideoReviewSettings(videoReview);
    initialRef.current = {
      ...initialRef.current,
      videoReview: JSON.stringify(videoReview),
    };
    toast.success("動画レビュー設定を保存しました");
    navigate(-1);
  };

  const isVideoDirty = () => JSON.stringify(videoReview) !== initialRef.current.videoReview;

  const handleBack = () => {
    if (activeTab === "video" && isVideoDirty()) {
      setShowUnsavedAlert(true);
    } else {
      navigate(-1);
    }
  };

  // Editing form view
  if (editingCourse) {
    return (
      <InnerPageLayout
        title={isNew ? "コース追加" : "コース編集"}
        ctaLabel="保存する"
        onCtaClick={handleSaveCourse}
        onBack={handleEditBack}
      >
        <div className="space-y-5 -mt-2">
          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">コース名</label>
            <input
              type="text"
              value={editingCourse.name}
              onChange={(e) => setEditingCourse({ ...editingCourse, name: e.target.value })}
              placeholder="例：パデル基礎レッスン"
              className="w-full h-12 px-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">コース説明</label>
            <textarea
              value={editingCourse.description}
              onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
              placeholder="コースの内容を簡単に説明..."
              rows={3}
              className="w-full px-4 py-3 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-foreground mb-1.5 block">1時間あたりの料金</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
              <input
                type="number"
                value={editingCourse.hourlyRate}
                onChange={(e) =>
                  setEditingCourse({ ...editingCourse, hourlyRate: parseInt(e.target.value) || 0 })
                }
                className="w-full h-12 pl-8 pr-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">生徒に表示される1時間あたりの金額</p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <p className="text-sm font-bold text-foreground mb-3">対応形式</p>
            <div className="space-y-3">
              <label className="flex items-center justify-between bg-card border border-border rounded-[8px] px-4 py-3.5 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">対面レッスン</span>
                </div>
                <Switch
                  checked={editingCourse.supportsInPerson}
                  onCheckedChange={(checked) =>
                    setEditingCourse({ ...editingCourse, supportsInPerson: checked })
                  }
                />
              </label>
              <label className="flex items-center justify-between bg-card border border-border rounded-[8px] px-4 py-3.5 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">オンライン</span>
                </div>
                <Switch
                  checked={editingCourse.supportsOnline}
                  onCheckedChange={(checked) =>
                    setEditingCourse({ ...editingCourse, supportsOnline: checked })
                  }
                />
              </label>
            </div>
          </div>
        </div>

        <AlertDialog open={showEditUnsavedAlert} onOpenChange={setShowEditUnsavedAlert}>
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
                onClick={() => {
                  setShowEditUnsavedAlert(false);
                  setEditingCourse(null);
                }}
                className="bg-destructive text-destructive-foreground rounded-[4px]"
              >
                保存せず戻る
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </InnerPageLayout>
    );
  }

  // Main list view with tabs
  return (
    <InnerPageLayout title="教課設定" ctaLabel={activeTab === "video" ? "保存する" : undefined} onCtaClick={activeTab === "video" ? handleSaveVideoReview : undefined} onBack={handleBack}>
      <div className="-mt-2">
        <AnimatedTabs tabs={COURSE_TABS} activeKey={activeTab} onChange={setActiveTab} className="mb-4 -mx-[20px]" />

        {activeTab === "lesson" && (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border border-border rounded-[8px] bg-card overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{course.name}</p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditForm(course)}
                        className="w-8 h-8 rounded-[4px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(course.id)}
                        className="w-8 h-8 rounded-[4px] flex items-center justify-center text-destructive/60 hover:bg-destructive/5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      {course.supportsInPerson && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-[4px] bg-primary/10 text-primary flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          対面
                        </span>
                      )}
                      {course.supportsOnline && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-[4px] bg-accent/10 text-accent flex items-center gap-1">
                          <Monitor className="w-2.5 h-2.5" />
                          オンライン
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-primary">
                      ¥{course.hourlyRate.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/時間</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={openNewForm}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-[8px] border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">コースを追加</span>
            </button>
          </div>
        )}

        {activeTab === "video" && (
          <div className="space-y-3">
            <label className="flex items-center justify-between bg-card border border-border rounded-[8px] px-4 py-3.5 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <FileVideo className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">動画レビューを受け付ける</span>
              </div>
              <Switch
                checked={videoReview.enabled}
                onCheckedChange={(checked) => handleVideoReviewChange({ enabled: checked })}
              />
            </label>

            {videoReview.enabled && (
              <>
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-[8px] p-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    動画レビューは依頼受領後、<span className="font-bold">1週間以内</span>に回答が必要です。期限を過ぎると自動的に返金されます。
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-1.5 block">1件あたりの料金</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                    <input
                      type="number"
                      value={videoReview.price}
                      onChange={(e) => handleVideoReviewChange({ price: parseInt(e.target.value) || 0 })}
                      className="w-full h-12 pl-8 pr-4 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">1回の動画レビューあたりの金額</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-foreground mb-1.5 block">サービス説明</label>
                  <textarea
                    value={videoReview.description}
                    onChange={(e) => handleVideoReviewChange({ description: e.target.value })}
                    placeholder="動画レビューの内容を説明..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-[8px] border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[8px] max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">コースを削除</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              このコースを削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[4px]">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-destructive text-destructive-foreground rounded-[4px]"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default CourseSettings;