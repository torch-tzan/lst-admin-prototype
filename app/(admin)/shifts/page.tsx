"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { PageShell, Section, EmptyState } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useMockCrud, MOCK_KEYS } from "@/lib/use-mock-crud";
import { SHIFTS, STAFF } from "@/lib/mock-data";
import type { Shift, ShiftType } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<ShiftType, string> = {
  regular: "通常",
  overtime: "残業",
  holiday: "休日出勤",
};

const TYPE_COLOR: Record<ShiftType, string> = {
  regular: "bg-primary/20 text-primary border-primary/40",
  overtime: "bg-warning/20 text-[hsl(38_92%_30%)] border-warning/40",
  holiday: "bg-destructive/20 text-destructive border-destructive/40",
};

const schema = z.object({
  staffId: z.string().min(1, "スタッフを選択"),
  date: z.string().min(1, "日付を指定"),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  type: z.enum(["regular", "overtime", "holiday"]),
  note: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function startOfWeek(d: Date) {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

export default function ShiftsPage() {
  const { user } = useAuth();
  const { items, add, remove, hydrated } = useMockCrud<Shift>(MOCK_KEYS.shifts, SHIFTS);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [initialDate, setInitialDate] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      staffId: "",
      date: "",
      startTime: "09:00",
      endTime: "18:00",
      type: "regular",
      note: "",
    },
  });

  const myStaff = useMemo(
    () => STAFF.filter((s) => s.venueId === user?.venueId && s.status === "active"),
    [user]
  );

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    items
      .filter((sh) => sh.venueId === user?.venueId)
      .forEach((sh) => {
        if (!map[sh.date]) map[sh.date] = [];
        map[sh.date].push(sh);
      });
    return map;
  }, [items, user]);

  const weekShifts = useMemo(() => {
    return weekDays.map((d) => {
      const key = d.toISOString().slice(0, 10);
      return shiftsByDay[key] ?? [];
    });
  }, [weekDays, shiftsByDay]);

  const totalShifts = weekShifts.reduce((s, day) => s + day.length, 0);
  const totalHours = weekShifts
    .flat()
    .reduce((s, sh) => {
      const [sh1, sm1] = sh.startTime.split(":").map(Number);
      const [sh2, sm2] = sh.endTime.split(":").map(Number);
      return s + (sh2 * 60 + sm2 - sh1 * 60 - sm1) / 60;
    }, 0);

  const openNew = (date?: string) => {
    setInitialDate(date ?? null);
    form.reset({
      staffId: "",
      date: date ?? new Date().toISOString().slice(0, 10),
      startTime: "09:00",
      endTime: "18:00",
      type: "regular",
      note: "",
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    await new Promise((r) => setTimeout(r, 400));
    const staff = myStaff.find((s) => s.id === data.staffId);
    if (!staff) return;
    add({
      id: `sh-${Date.now()}`,
      staffId: data.staffId,
      staffName: staff.name,
      venueId: user?.venueId ?? "",
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      note: data.note,
    });
    toast.success(`シフト追加：${staff.name} ${data.date} ${data.startTime}-${data.endTime}`);
    setDialogOpen(false);
  };

  const shiftWeekDay = (wd: number) => ["日", "月", "火", "水", "木", "金", "土"][wd];

  if (!hydrated) return null;

  return (
    <PageShell
      title="シフト管理"
      description="スタッフの週次シフト管理。セルをクリックで追加、既存シフトはクリックで削除できます。"
      breadcrumbs={[{ label: "スタッフ/勤務" }, { label: "シフト管理" }]}
      actions={
        <Button onClick={() => openNew()}>
          <Plus className="w-4 h-4" />
          シフト追加
        </Button>
      }
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() - 7);
              setWeekStart(d);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-sm font-medium px-3">
            {weekDays[0].getMonth() + 1}/{weekDays[0].getDate()} -{" "}
            {weekDays[6].getMonth() + 1}/{weekDays[6].getDate()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const d = new Date(weekStart);
              d.setDate(d.getDate() + 7);
              setWeekStart(d);
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setWeekStart(startOfWeek(new Date()))}
          >
            今週
          </Button>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>今週 {totalShifts} シフト</span>
          <span>合計 {Math.round(totalHours)} 時間</span>
        </div>
      </div>

      <Section>
        <div className="grid grid-cols-7 divide-x">
          {weekDays.map((d, i) => {
            const key = d.toISOString().slice(0, 10);
            const shifts = weekShifts[i];
            const isToday = key === new Date().toISOString().slice(0, 10);
            return (
              <div key={key} className="min-h-[240px]">
                <div
                  className={cn(
                    "px-3 py-2 text-center border-b text-xs",
                    isToday && "bg-primary/5"
                  )}
                >
                  <div className="font-medium">{shiftWeekDay(d.getDay())}</div>
                  <div
                    className={cn(
                      "mt-0.5",
                      isToday && "text-primary font-bold"
                    )}
                  >
                    {d.getMonth() + 1}/{d.getDate()}
                  </div>
                </div>
                <div className="p-2 space-y-1.5">
                  {shifts.length === 0 ? (
                    <button
                      onClick={() => openNew(key)}
                      className="w-full text-[10px] text-muted-foreground py-6 hover:bg-muted/40 rounded"
                    >
                      + 追加
                    </button>
                  ) : (
                    shifts.map((sh) => (
                      <button
                        key={sh.id}
                        onClick={() => {
                          if (
                            confirm(
                              `${sh.staffName} ${sh.startTime}-${sh.endTime} のシフトを削除？`
                            )
                          ) {
                            remove(sh.id);
                            toast.success("シフトを削除しました");
                          }
                        }}
                        className={cn(
                          "w-full text-left rounded border px-2 py-1.5 text-[10px] transition-colors hover:opacity-80",
                          TYPE_COLOR[sh.type]
                        )}
                      >
                        <div className="font-semibold">{sh.staffName}</div>
                        <div>
                          {sh.startTime} - {sh.endTime}
                        </div>
                        {sh.type !== "regular" && (
                          <div className="text-[9px] uppercase tracking-wider mt-0.5">
                            {TYPE_LABEL[sh.type]}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                  {shifts.length > 0 && (
                    <button
                      onClick={() => openNew(key)}
                      className="w-full text-[10px] text-muted-foreground py-1 hover:bg-muted/40 rounded"
                    >
                      +
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn("w-3 h-3 rounded border", TYPE_COLOR.regular)} />
          通常
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("w-3 h-3 rounded border", TYPE_COLOR.overtime)} />
          残業
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn("w-3 h-3 rounded border", TYPE_COLOR.holiday)} />
          休日出勤
        </span>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>シフト追加</DialogTitle>
            <DialogDescription>スタッフの勤務時間を登録します</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label required>スタッフ</Label>
              <Select
                value={form.watch("staffId")}
                onValueChange={(v) => form.setValue("staffId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選択..." />
                </SelectTrigger>
                <SelectContent>
                  {myStaff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.staffId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.staffId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label required>日付</Label>
                <Input type="date" {...form.register("date")} />
              </div>
              <div className="grid gap-1.5">
                <Label required>開始</Label>
                <Input type="time" {...form.register("startTime")} />
              </div>
              <div className="grid gap-1.5">
                <Label required>終了</Label>
                <Input type="time" {...form.register("endTime")} />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label required>種別</Label>
              <Select
                value={form.watch("type")}
                onValueChange={(v) => form.setValue("type", v as ShiftType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">通常</SelectItem>
                  <SelectItem value="overtime">残業</SelectItem>
                  <SelectItem value="holiday">休日出勤</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>備考</Label>
              <Textarea rows={2} {...form.register("note")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" loading={form.formState.isSubmitting}>
                追加
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
