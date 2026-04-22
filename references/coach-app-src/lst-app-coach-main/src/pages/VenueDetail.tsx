import { useParams, useSearchParams } from "react-router-dom";
import InnerPageLayout from "@/components/InnerPageLayout";
import { getVenueByName } from "@/lib/venueData";
import { MapPin, Clock, Star } from "lucide-react";

const VenueDetail = () => {
  const [searchParams] = useSearchParams();
  const venueName = searchParams.get("name") || "";
  const venue = getVenueByName(venueName);

  if (!venue) {
    return (
      <InnerPageLayout title="会場詳細">
        <div className="flex items-center justify-center pt-20">
          <p className="text-sm text-muted-foreground">会場が見つかりません</p>
        </div>
      </InnerPageLayout>
    );
  }

  return (
    <InnerPageLayout title="会場詳細">
      <div className="flex flex-col">
        {/* Hero image */}
        <div className="relative w-full">
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="w-full h-48 object-cover"
          />
          {venue.hasAvailability && (
            <span className="absolute bottom-3 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-[4px]">
              空き枠あり
            </span>
          )}
        </div>

        {/* Content */}
        <div className="px-[20px] py-5 space-y-4">
          {/* Title & court type */}
          <div>
            <h2 className="text-lg font-bold text-foreground">{venue.name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{venue.courtType}</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="text-sm font-bold text-foreground">{venue.rating}</span>
              <span className="text-xs text-muted-foreground">({venue.reviewCount}件のレビュー)</span>
            </div>
          </div>

          {/* Address & price */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-foreground">{venue.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-foreground">¥{venue.pricePerHour.toLocaleString()}/時間</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">施設紹介</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{venue.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-bold text-foreground mb-2">設備・サービス</h3>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="text-xs text-foreground border border-border rounded-[4px] px-3 py-1.5"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </InnerPageLayout>
  );
};

export default VenueDetail;
