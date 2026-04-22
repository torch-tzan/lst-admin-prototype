"use client";

import { cn } from "@/lib/utils";

interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  valueFormat?: (v: number) => string;
  barClass?: string;
}

export function BarChart({
  data,
  height = 220,
  valueFormat,
  barClass,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="w-full">
      <div
        className="flex items-end gap-1.5"
        style={{ height }}
      >
        {data.map((d, idx) => {
          const h = Math.max(2, (d.value / max) * 100);
          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end gap-1 group"
            >
              <div
                className={cn(
                  "text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity",
                  "text-foreground"
                )}
              >
                {valueFormat ? valueFormat(d.value) : d.value.toLocaleString()}
              </div>
              <div
                className={cn(
                  "w-full rounded-sm transition-colors",
                  barClass ?? "bg-primary/80 hover:bg-primary"
                )}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-1.5 mt-2">
        {data.map((d, idx) => (
          <div
            key={idx}
            className="flex-1 text-center text-[10px] text-muted-foreground"
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
