export interface Venue {
  id: string;
  name: string;
  courtType: string;
  rating: number;
  reviewCount: number;
  address: string;
  pricePerHour: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  hasAvailability: boolean;
}

const venues: Venue[] = [
  {
    id: "v1",
    name: "パデルコート広島",
    courtType: "コートA（屋外ハード）",
    rating: 4.5,
    reviewCount: 128,
    address: "広島県広島市中区大手町1-2-3",
    pricePerHour: 2000,
    description: "広島市中心部にある本格的なパデルコート。屋外ハードコートで、初心者から上級者まで楽しめます。ナイター設備完備。",
    amenities: ["駐車場", "シャワー", "ロッカー", "レンタル用具", "ナイター"],
    imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=400&fit=crop",
    hasAvailability: true,
  },
  {
    id: "v2",
    name: "北広島パデルクラブ",
    courtType: "コートB（屋内カーペット）",
    rating: 4.3,
    reviewCount: 86,
    address: "広島県北広島市中央5-8-12",
    pricePerHour: 2500,
    description: "屋内カーペットコートで天候に左右されず快適にプレーできます。広々としたスペースで初心者スクールも開催中。",
    amenities: ["駐車場", "シャワー", "ロッカー", "レンタル用具", "カフェ", "プロショップ"],
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=400&fit=crop",
    hasAvailability: true,
  },
];

export const getVenueByName = (name: string): Venue | undefined =>
  venues.find((v) => v.name === name);

export const getVenueById = (id: string): Venue | undefined =>
  venues.find((v) => v.id === id);

export const getAllVenues = (): Venue[] => venues;
