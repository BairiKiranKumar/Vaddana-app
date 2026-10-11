import type { Diet } from "@/lib/data/types";

export type { Diet };

// SAMPLE DATA for /preview only. Not a real restaurant, not real prices.
// Dishes are common on Nizamabad / Hyderabad menus; Telugu spellings are drafts pending native review.
// Field names follow the proposed name_te / name_en column model (design/DECISIONS.md).

export type SampleItem = {
  id: string;
  name_te: string | null;
  name_en: string;
  description_te: string | null;
  description_en: string | null;
  price: number;
  diet: Diet;
  available: boolean;
  variants?: { id: string; name_te: string; name_en: string; price: number }[];
  addons?: { max: number; options: { id: string; name_te: string; name_en: string; price: number }[] };
};

export const sampleItems: SampleItem[] = [
  {
    id: "veg-meals",
    // Longest name on the sample menu: the Telugu clipping and wrapping stress test.
    name_te: "తెలంగాణ శాకాహార భోజనం (పచ్చిపులుసు, ముద్దపప్పు, నెయ్యి)",
    name_en: "Telangana Veg Meals (Pachi Pulusu, Mudda Pappu, Ghee)",
    description_te: "అన్నం, పచ్చిపులుసు, ముద్దపప్పు, రెండు కూరలు, పెరుగు, అప్పడం",
    description_en: "Rice, pachi pulusu, mudda pappu, two curries, curd and appadam",
    price: 220,
    diet: "veg",
    available: true,
  },
  {
    id: "dum-biryani-family",
    name_te: "హైదరాబాదీ చికెన్ దమ్ బిర్యానీ (ఫ్యామిలీ ప్యాక్)",
    name_en: "Hyderabadi Chicken Dum Biryani (Family Pack)",
    description_te: "మిర్చి కా సాలన్, రైతాతో. ముగ్గురు నలుగురికి సరిపోతుంది",
    description_en: "With mirchi ka salan and raita. Serves three to four",
    price: 649,
    diet: "nonveg",
    available: true,
  },
  {
    id: "natu-kodi-pulusu",
    name_te: "నాటు కోడి పులుసు",
    name_en: "Natu Kodi Pulusu",
    description_te: "చింతపండు పులుసులో నాటు కోడి కూర",
    description_en: "Country chicken in a tangy tamarind gravy",
    price: 320,
    diet: "nonveg",
    available: true,
    variants: [
      { id: "half", name_te: "హాఫ్", name_en: "Half", price: 180 },
      { id: "full", name_te: "ఫుల్", name_en: "Full", price: 320 },
    ],
    addons: {
      max: 2,
      options: [
        { id: "rice", name_te: "అన్నం", name_en: "Plain rice", price: 60 },
        { id: "jonna-rotte", name_te: "జొన్న రొట్టె", name_en: "Jonna rotte", price: 30 },
        { id: "egg", name_te: "ఉడికించిన గుడ్డు", name_en: "Boiled egg", price: 20 },
      ],
    },
  },
  {
    id: "paneer-butter-masala",
    // Telugu name intentionally missing: shows the English fallback.
    name_te: null,
    name_en: "Paneer Butter Masala",
    description_te: null,
    description_en: "Cottage cheese in a tomato and butter gravy",
    price: 240,
    diet: "veg",
    available: true,
  },
  {
    id: "sarva-pindi",
    name_te: "సర్వపిండి",
    name_en: "Sarva Pindi",
    description_te: "బియ్యప్పిండి, శనగపప్పు, పల్లీలతో చేసిన తెలంగాణ రొట్టె",
    description_en: "Telangana rice-flour flatbread with chana dal and peanuts",
    price: 90,
    diet: "veg",
    available: false,
  },
];
