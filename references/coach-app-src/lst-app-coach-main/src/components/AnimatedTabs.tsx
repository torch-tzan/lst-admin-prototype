import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface Tab {
  key: string;
  label: string;
  badge?: number;
}

interface AnimatedTabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

const AnimatedTabs = ({ tabs, activeKey, onChange, className = "" }: AnimatedTabsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current.get(activeKey);
    if (el && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setUnderline({
        left: elRect.left - containerRect.left + elRect.width / 2 - 12,
        width: 24,
      });
    }
  }, [activeKey, tabs]);

  return (
    <div ref={containerRef} className={`relative flex border-b border-border ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          ref={(el) => { if (el) tabRefs.current.set(tab.key, el); }}
          onClick={() => onChange(tab.key)}
          className={`flex-1 pb-2.5 text-sm font-bold whitespace-nowrap transition-colors relative ${
            activeKey === tab.key ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full bg-destructive text-destructive-foreground leading-none">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
      <motion.span
        className="absolute bottom-0 h-[3px] rounded-full bg-primary"
        animate={{ left: underline.left, width: underline.width }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </div>
  );
};

export default AnimatedTabs;
