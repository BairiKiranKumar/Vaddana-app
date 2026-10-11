import type { MenuItem, Restaurant, Review, StaffMember } from "@/lib/data/types";
import type { Snapshot as HouseSnapshot } from "@/lib/data/mock/store";

// Built-in houses ship in code. Restaurants created from the join form are stored beside them.
export const BUILTIN_IDS = ["srinidhi", "annapurna"] as const;

export type RestaurantStatus = "onboarding" | "live" | "suspended";

export type PlatformRestaurant = {
  id: string;
  name_te: string;
  name_en: string;
  city_te: string;
  city_en: string;
  status: RestaurantStatus;
  sample: boolean;
  ownerId: string;
  tableToken: string;
};

export type Guest = {
  id: string;
  name: string;
  phone: string;
  points: number;
};

type PlatformBlob = {
  restaurants: PlatformRestaurant[];
  guest: Guest | null;
};

const PLATFORM_KEY = "vaddana-platform-v1";

const builtins: PlatformRestaurant[] = [
  {
    id: "srinidhi",
    name_te: "శ్రీనిధి భవన్",
    name_en: "Srinidhi Bhavan",
    city_te: "నిజామాబాద్",
    city_en: "Nizamabad",
    status: "live",
    sample: true,
    ownerId: "lakshmi",
    tableToken: "7",
  },
  {
    id: "annapurna",
    name_te: "అన్నపూర్ణ మెస్",
    name_en: "Annapurna Mess",
    city_te: "నిజామాబాద్",
    city_en: "Nizamabad",
    status: "live",
    sample: true,
    ownerId: "ap-owner",
    tableToken: "ap1",
  },
];

function emptyBlob(): PlatformBlob {
  return { restaurants: builtins.map((entry) => ({ ...entry })), guest: null };
}

export function readPlatform(): PlatformBlob {
  if (typeof localStorage === "undefined") return emptyBlob();
  try {
    const raw = localStorage.getItem(PLATFORM_KEY);
    if (!raw) return emptyBlob();
    const parsed = JSON.parse(raw) as PlatformBlob;
    if (!Array.isArray(parsed.restaurants)) return emptyBlob();
    const ids = new Set(parsed.restaurants.map((entry) => entry.id));
    const restaurants = [...parsed.restaurants];
    for (const builtin of builtins) {
      if (!ids.has(builtin.id)) restaurants.push({ ...builtin });
    }
    return { restaurants, guest: parsed.guest ?? null };
  } catch {
    return emptyBlob();
  }
}

export function writePlatform(blob: PlatformBlob) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(PLATFORM_KEY, JSON.stringify(blob));
}

export function knownRestaurantIds(): string[] {
  return [...new Set([...BUILTIN_IDS, ...readPlatform().restaurants.map((entry) => entry.id)])];
}

export function isSuspended(id: string): boolean {
  return readPlatform().restaurants.find((entry) => entry.id === id)?.status === "suspended";
}

function item(partial: MenuItem): MenuItem {
  return partial;
}

export function annapurnaSeed(): HouseSnapshot {
  const settings: Restaurant = {
    id: "annapurna",
    name_te: "అన్నపూర్ణ మెస్",
    name_en: "Annapurna Mess",
    tagline_te: "నిజామాబాద్",
    tagline_en: "Nizamabad",
    defaultLocale: "te",
    gstin: "",
    fssai: "",
    taxMode: "none",
    gstRate: 0,
    upiId: "",
    autoAccept: false,
    payFirst: false,
    logoDataUrl: null,
  };
  const staff: StaffMember[] = [
    { id: "ap-owner", name: "పద్మ", role: "owner", locale: "te", active: true },
    { id: "ap-waiter", name: "ఇమ్రాన్", role: "waiter", locale: "te", active: true },
    { id: "ap-cook", name: "రాజు", role: "cook", locale: "te", active: true },
  ];
  const review: Review = {
    id: "ap-sample-review",
    author: "Sample diner",
    rating: 5,
    body: "Sample review for the mess meals. Not a real guest.",
    createdAt: new Date(0).toISOString(),
    sample: true,
  };
  return {
    revision: 1,
    settings,
    categories: [
      { id: "meals", name_te: "భోజనం", name_en: "Meals", sort: 1 },
      { id: "tiffin", name_te: "టిఫిన్", name_en: "Tiffin", sort: 2 },
    ],
    items: [
      item({
        id: "ap-meals",
        categoryId: "meals",
        name_te: "మెస్ భోజనం",
        name_en: "Mess meals",
        description_te: "అన్నం, పప్పు, కూర, పెరుగు",
        description_en: "Rice, dal, curry and curd",
        search: ["meals", "mess"],
        price: 120,
        diet: "veg",
        available: true,
        image: "/menu/telangana-meals.jpg",
      }),
      item({
        id: "ap-pulihora",
        categoryId: "tiffin",
        name_te: "పులిహోర",
        name_en: "Pulihora",
        description_te: "నిమ్మకాయ అన్నం",
        description_en: "Lemon rice",
        search: ["pulihora", "lemon"],
        price: 60,
        diet: "veg",
        available: true,
        image: "/menu/idli.jpg",
      }),
      item({
        id: "ap-chai",
        categoryId: "tiffin",
        name_te: "చాయ్",
        name_en: "Chai",
        description_te: "ఒక కప్పు",
        description_en: "One cup",
        search: ["chai", "tea"],
        price: 10,
        diet: "veg",
        available: true,
        image: "/menu/chai.jpg",
      }),
    ],
    areas: [{ id: "hall", name_te: "హాల్", name_en: "Hall" }],
    desks: [
      { id: "ap-d1", token: "ap1", number: 1, areaId: "hall", seats: 4 },
      { id: "ap-d2", token: "ap2", number: 2, areaId: "hall", seats: 4 },
      { id: "ap-d3", token: "ap3", number: 3, areaId: "hall", seats: 2 },
    ],
    staff,
    sessions: [["ap2", { lines: [], notes: "", orders: [], payment: "unpaid", paymentMode: null, prepaid: false, waiterCalled: false, billRequested: false }]],
    offers: [
      { id: "ap-lunch", name_te: "లంచ్ 10%", name_en: "Lunch 10%", percent: 10, active: true },
    ],
    reviews: [review],
  };
}

export function emptyHouse(input: {
  id: string;
  name_te: string;
  name_en: string;
  city_te: string;
  city_en: string;
  ownerId: string;
  ownerName: string;
  token: string;
}): HouseSnapshot {
  const settings: Restaurant = {
    id: input.id,
    name_te: input.name_te,
    name_en: input.name_en,
    tagline_te: input.city_te,
    tagline_en: input.city_en,
    defaultLocale: "te",
    gstin: "",
    fssai: "",
    taxMode: "none",
    gstRate: 0,
    upiId: "",
    autoAccept: false,
    payFirst: false,
    logoDataUrl: null,
  };
  return {
    revision: 1,
    settings,
    categories: [],
    items: [],
    areas: [{ id: "hall", name_te: "హాల్", name_en: "Hall" }],
    desks: [{ id: `${input.id}-d1`, token: input.token, number: 1, areaId: "hall", seats: 4 }],
    staff: [{ id: input.ownerId, name: input.ownerName, role: "owner", locale: "te", active: true }],
    sessions: [],
    offers: [],
    reviews: [],
  };
}

