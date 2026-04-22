import { useRef, useEffect, useCallback } from "react";

const ITEM_H = 40;
const VISIBLE = 5;

const WheelPicker = ({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isUserScroll = useRef(true);

  const idx = Math.max(0, items.indexOf(value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    isUserScroll.current = false;
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" });
    const timer = setTimeout(() => { isUserScroll.current = true; }, 300);
    return () => clearTimeout(timer);
  }, [idx]);

  const handleScroll = useCallback(() => {
    const el = ref.current;
    if (!el || !isUserScroll.current) return;
    const snapIdx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(snapIdx, items.length - 1));
    if (items[clamped] !== value) onChange(items[clamped]);
  }, [items, value, onChange]);

  const padCount = Math.floor(VISIBLE / 2);

  return (
    <div className="relative" style={{ height: ITEM_H * VISIBLE }}>
      <div
        className="absolute left-0 right-0 border-y border-primary/30 bg-primary/5 pointer-events-none z-10"
        style={{ top: ITEM_H * padCount, height: ITEM_H }}
      />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pt-${i}`} style={{ height: ITEM_H }} />
        ))}
        {items.map((item) => (
          <div
            key={item}
            className={`flex items-center justify-center text-sm snap-center transition-colors ${
              item === value ? "text-foreground font-bold" : "text-muted-foreground"
            }`}
            style={{ height: ITEM_H, scrollSnapAlign: "center" }}
          >
            {item}
          </div>
        ))}
        {Array.from({ length: padCount }).map((_, i) => (
          <div key={`pb-${i}`} style={{ height: ITEM_H }} />
        ))}
      </div>
    </div>
  );
};

export default WheelPicker;
