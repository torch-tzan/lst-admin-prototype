import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  icon?: LucideIcon;
  accent?: "default" | "success" | "warning" | "destructive";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-[hsl(38_92%_30%)]",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, delta, icon: Icon, accent = "default" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold mt-1.5 tracking-tight">{value}</div>
            {delta && (
              <div
                className={cn(
                  "text-xs mt-1",
                  delta.positive ? "text-success" : "text-muted-foreground"
                )}
              >
                {delta.value}
              </div>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                accentClasses[accent]
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
