import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import UnsavedChangesAlert from "@/components/UnsavedChangesAlert";
import { PLATFORM_VENUES, getCoachVenues, saveCoachVenues } from "@/lib/coachSettingsStore";
import { toast } from "sonner";
import { MapPin, Check, Search } from "lucide-react";

const VenueSettings = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(getCoachVenues);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const initialRef = useRef(JSON.stringify(getCoachVenues()));
  const isDirty = useCallback(() => JSON.stringify(selected) !== initialRef.current, [selected]);

  const toggleVenue = (venueId: string) => {
    setSelected((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]
    );
  };

  const handleSave = () => {
    saveCoachVenues(selected);
    toast.success("場地設定を保存しました");
    navigate(-1);
  };

  const handleBack = () => {
    if (isDirty()) {
      setShowUnsavedAlert(true);
    } else {
      navigate(-1);
    }
  };

  const filtered = searchQuery
    ? PLATFORM_VENUES.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.area.includes(searchQuery)
      )
    : PLATFORM_VENUES;

  return (
    <InnerPageLayout title="場地設定" ctaLabel="保存する" onCtaClick={handleSave} onBack={handleBack}>
      <div className="space-y-4 -mt-2">
        <p className="text-xs text-muted-foreground leading-relaxed">
          レッスンを行う場地を選択してください。生徒の予約時に表示されます。
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="場地名・エリアで検索..."
            className="w-full h-10 pl-9 pr-4 rounded-[8px] border border-border bg-muted/30 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-muted-foreground">
            {selected.length}件選択中
          </p>
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="text-[10px] font-medium text-destructive"
            >
              すべて解除
            </button>
          )}
        </div>

        <div className="space-y-2">
          {filtered.map((venue) => {
            const isSelected = selected.includes(venue.id);
            return (
              <button
                key={venue.id}
                onClick={() => toggleVenue(venue.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-[8px] border text-left transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-[8px] flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-primary" : "bg-muted"
                  }`}
                >
                  {isSelected ? (
                    <Check className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{venue.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground">{venue.area}</span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[11px] text-muted-foreground">{venue.courts}面</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{venue.address}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <UnsavedChangesAlert open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert} />
    </InnerPageLayout>
  );
};

export default VenueSettings;
