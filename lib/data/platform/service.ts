import { emptyHouse, readPlatform, writePlatform, type Guest, type PlatformRestaurant } from "@/lib/data/platform/houses";
import { activateRestaurant, changeHouse, presentHouse, saveReview, withRestaurant, writeSnapshot } from "@/lib/data/mock/store";
import type { HouseView, Review } from "@/lib/data/types";

export type RestaurantCard = PlatformRestaurant & {
  sales: number;
  openTables: number;
  reviewCount: number;
};

function slug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24);
  return base || `house-${Date.now().toString(36)}`;
}

export function listRestaurants(): RestaurantCard[] {
  return readPlatform().restaurants.map((entry) => {
    const house = withRestaurant(entry.id, presentHouse);
    return {
      ...entry,
      sales: house.today.sales,
      openTables: house.today.openTables,
      reviewCount: house.reviews.length,
    };
  });
}

export function registerRestaurant(input: { name_te: string; name_en: string; city_te: string; city_en: string; ownerName: string }): PlatformRestaurant {
  const blob = readPlatform();
  const id = `${slug(input.name_en)}-${Math.random().toString(36).slice(2, 6)}`;
  const ownerId = `owner-${id}`;
  const token = `${id.slice(0, 8)}-1`;
  const record: PlatformRestaurant = {
    id,
    name_te: input.name_te.trim() || input.name_en.trim(),
    name_en: input.name_en.trim() || input.name_te.trim(),
    city_te: input.city_te.trim(),
    city_en: input.city_en.trim(),
    status: "onboarding",
    sample: false,
    ownerId,
    tableToken: token,
  };
  writeSnapshot(id, emptyHouse({
    id,
    name_te: record.name_te,
    name_en: record.name_en,
    city_te: record.city_te,
    city_en: record.city_en,
    ownerId,
    ownerName: input.ownerName.trim() || record.name_en,
    token,
  }));
  blob.restaurants.push(record);
  writePlatform(blob);
  return record;
}

export function setRestaurantStatus(id: string, status: PlatformRestaurant["status"]) {
  const blob = readPlatform();
  const record = blob.restaurants.find((entry) => entry.id === id);
  if (!record) return;
  record.status = status;
  writePlatform(blob);
}

export function markLive(id: string) {
  setRestaurantStatus(id, "live");
}

export function currentGuest(): Guest | null {
  return readPlatform().guest;
}

export function signInGuest(name: string, phone: string): Guest {
  const blob = readPlatform();
  const guest: Guest = {
    id: blob.guest?.id ?? `guest-${Date.now().toString(36)}`,
    name: name.trim(),
    phone: phone.trim(),
    points: blob.guest?.points ?? 0,
  };
  blob.guest = guest;
  writePlatform(blob);
  return guest;
}

export function signOutGuest() {
  const blob = readPlatform();
  blob.guest = null;
  writePlatform(blob);
}

/** Simulated visit. Points are not a payment and not stored on the bill. */
export function recordVisit(): Guest | null {
  const blob = readPlatform();
  if (!blob.guest) return null;
  blob.guest = { ...blob.guest, points: blob.guest.points + 10 };
  writePlatform(blob);
  return blob.guest;
}

export function houseSummary(id: string): HouseView {
  return withRestaurant(id, presentHouse);
}

export function addReview(restaurantId: string, review: Review) {
  activateRestaurant(restaurantId);
  changeHouse(() => saveReview(review), false);
}
