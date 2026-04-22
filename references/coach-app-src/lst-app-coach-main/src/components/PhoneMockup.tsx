import { useState, useRef, useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
const PhoneMockup = ({ children, bottomNav, hideStatusBar }: { children: React.ReactNode; bottomNav?: React.ReactNode; hideStatusBar?: boolean }) => {
  const [isDark, setIsDark] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Switch to light when scrolled past the dark header area (~120px)
    setIsDark(el.scrollTop < 80);
  }, []);

  const statusColor = isDark ? "text-primary-foreground" : "text-foreground";
  const statusBg = isDark ? "bg-gray-5" : "bg-background";

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <div id="phone-container" className="relative w-[390px] h-[844px] rounded-[50px] border-[12px] border-foreground/90 bg-background shadow-2xl overflow-hidden flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-foreground/90 rounded-b-2xl z-50" />
        {/* Status bar */}
        {!hideStatusBar && (
        <div className={`h-[50px] flex-shrink-0 flex items-center justify-between px-8 pt-1 z-40 transition-colors duration-300 ${statusBg}`}>
          <span className={`text-xs font-semibold ${statusColor}`}>9:41</span>
          <div className={`flex items-center gap-1 ${statusColor}`}>
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
              <rect x="0" y="8" width="3" height="4" rx="0.5" />
              <rect x="4.5" y="5" width="3" height="7" rx="0.5" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" opacity="0.3" />
            </svg>
            <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
              <path d="M7.5 3.5C9.2 3.5 10.7 4.2 11.8 5.3L13.2 3.9C11.7 2.4 9.7 1.5 7.5 1.5C5.3 1.5 3.3 2.4 1.8 3.9L3.2 5.3C4.3 4.2 5.8 3.5 7.5 3.5Z" />
              <path d="M7.5 6.5C8.6 6.5 9.5 6.9 10.2 7.6L11.6 6.2C10.5 5.1 9.1 4.5 7.5 4.5C5.9 4.5 4.5 5.1 3.4 6.2L4.8 7.6C5.5 6.9 6.4 6.5 7.5 6.5Z" />
              <circle cx="7.5" cy="9.5" r="1.5" />
            </svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
              <rect x="0" y="1" width="21" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" />
              <rect x="2" y="3" width="17" height="6" rx="1" />
              <rect x="22" y="4" width="2" height="4" rx="0.5" opacity="0.4" />
            </svg>
          </div>
        </div>
        )}
        {/* Toast container scoped to phone (positioned via CSS in index.css) */}
        <Toaster
          position="bottom-center"
          containerAriaLabel="notifications"
          toastOptions={{
            style: { maxWidth: '340px', width: '100%' },
          }}
        />
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" ref={scrollRef} onScroll={handleScroll}>
          {children}
        </div>
        {/* Fixed bottom nav */}
        {bottomNav && (
          <div className="flex-shrink-0 bg-gray-5 border-t border-border">
            {bottomNav}
            <div className="flex justify-center pb-1 pt-0.5">
              <div className="w-[134px] h-[5px] bg-foreground/30 rounded-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneMockup;
