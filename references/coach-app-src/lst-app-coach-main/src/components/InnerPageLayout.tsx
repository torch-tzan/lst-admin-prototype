import { useNavigate } from "react-router-dom";
import PhoneMockup from "@/components/PhoneMockup";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import React from "react";

export interface InnerPageLayoutProps {
  title: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onCtaClick?: () => void;
  onBack?: () => void;
  hideBack?: boolean;
  rightAction?: React.ReactNode;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
}

const InnerPageLayout = ({
  title,
  children,
  ctaLabel,
  ctaDisabled = false,
  onCtaClick,
  onBack,
  hideBack = false,
  rightAction,
  scrollRef,
  onScroll,
}: InnerPageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <PhoneMockup>
      <div className="flex flex-col h-full bg-background">
        {/* Sticky Header */}
        <div className="flex-shrink-0 sticky top-0 z-30 bg-background">
          <div className="px-[20px] pt-4 pb-3 relative flex items-center justify-center">
            {!hideBack && (
              <button
                onClick={onBack ?? (() => navigate(-1))}
                className="absolute left-[12px] p-1 text-foreground"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <h1 className="text-xl font-bold text-center text-foreground">{title}</h1>
            {rightAction && (
              <div className="absolute right-[20px]">{rightAction}</div>
            )}
          </div>
          <Separator />
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto px-[20px] pt-6 pb-6"
        >
          {children}
        </div>

        {/* Fixed Bottom CTA */}
        {ctaLabel && (
          <div className="flex-shrink-0 px-[20px] pb-6 pt-3 bg-background border-t border-border">
            <Button
              disabled={ctaDisabled}
              onClick={onCtaClick}
              className="w-full h-14 rounded-[8px] text-base font-bold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              {ctaLabel}
            </Button>
          </div>
        )}
      </div>
    </PhoneMockup>
  );
};

export default InnerPageLayout;
