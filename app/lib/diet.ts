import type { MenuItem } from "./types";

/**
 * Allergen and diet flags for menu items.
 *
 * IMPORTANT: this is a reading of the menu text, not a declaration from the
 * kitchen. Restaurants here don't publish allergen data, so the alternative to
 * guessing was showing nothing at all — but a guess presented as fact is worse
 * than useless to someone with a real allergy. Every flag is therefore phrased
 * as "may contain" in the UI and paired with a line telling people to confirm
 * with the restaurant. Never tighten that wording.
 *
 * Matching is deliberately generous (false positives over false negatives): a
 * dish wrongly flagged costs someone a dish, a dish wrongly cleared costs a lot
 * more.
 */

export type DietKey =
  | "shellfish"
  | "fish"
  | "peanuts"
  | "treenuts"
  | "dairy"
  | "eggs"
  | "gluten"
  | "soy"
  | "sesame"
  | "vegetarian"
  | "vegan";

export type DietOption = {
  key: DietKey;
  label: string;
  /** "avoid" flags dishes that contain it; "only" flags dishes that don't fit. */
  kind: "avoid" | "only";
  /** Words that imply the ingredient is present. */
  contains: string[];
  /** Words that clear a dish despite a `contains` hit, e.g. "peanut-free". */
  clears?: string[];
};

const MEAT = [
  "chicken", "beef", "mutton", "lamb", "pork", "bacon", "ham", "sausage",
  "steak", "meat", "kebab", "chop", "wing", "burger", "pepperoni", "salami",
  "duck", "turkey", "mince", "keema",
];

const SEA = [
  "fish", "tuna", "reef fish", "mas", "garudhiya", "anchov", "sardine",
  "salmon", "seafood", "calamari", "squid", "octopus",
];

const SHELL = [
  "prawn", "shrimp", "lobster", "crab", "clam", "mussel", "oyster", "scallop",
  "shellfish",
];

const DAIRY = [
  "cheese", "milk", "cream", "butter", "yoghurt", "yogurt", "paneer", "ghee",
  "mozzarella", "cheddar", "parmesan", "mayo", "mayonnaise", "ice cream",
  "custard", "kulfi", "latte", "cappuccino", "milkshake",
];

const EGG = ["egg", "omelette", "omelet", "mayo", "mayonnaise", "meringue", "custard"];

const GLUTEN = [
  "bread", "bun", "roshi", "chapati", "naan", "paratha", "roti", "pasta",
  "noodle", "spaghetti", "penne", "lasagne", "lasagna", "flour", "batter",
  "breaded", "crumbed", "wrap", "tortilla", "pastry", "cake", "biscuit",
  "cookie", "doughnut", "donut", "pizza", "burger bun", "toast", "croissant",
  "samosa", "spring roll", "dumpling", "beer",
];

const SOY = ["soy", "soya", "tofu", "teriyaki", "hoisin", "miso", "edamame", "tempeh"];

const SESAME = ["sesame", "tahini", "hummus", "za'atar", "halva"];

const PEANUT = ["peanut", "groundnut", "satay"];

const TREENUT = [
  "cashew", "almond", "walnut", "pistachio", "hazelnut", "pecan", "macadamia",
  "nutella", "praline", "marzipan", "coconut nut",
];

export const DIET_OPTIONS: DietOption[] = [
  { key: "shellfish", label: "Shellfish", kind: "avoid", contains: SHELL },
  { key: "fish", label: "Fish", kind: "avoid", contains: SEA },
  { key: "peanuts", label: "Peanuts", kind: "avoid", contains: PEANUT, clears: ["peanut-free", "no peanut"] },
  { key: "treenuts", label: "Tree nuts", kind: "avoid", contains: TREENUT, clears: ["nut-free"] },
  { key: "dairy", label: "Dairy", kind: "avoid", contains: DAIRY, clears: ["dairy-free", "vegan"] },
  { key: "eggs", label: "Eggs", kind: "avoid", contains: EGG, clears: ["egg-free", "vegan"] },
  { key: "gluten", label: "Gluten", kind: "avoid", contains: GLUTEN, clears: ["gluten-free", "gluten free"] },
  { key: "soy", label: "Soy", kind: "avoid", contains: SOY, clears: ["soy-free"] },
  { key: "sesame", label: "Sesame", kind: "avoid", contains: SESAME },
  { key: "vegetarian", label: "Vegetarian", kind: "only", contains: [...MEAT, ...SEA, ...SHELL] },
  { key: "vegan", label: "Vegan", kind: "only", contains: [...MEAT, ...SEA, ...SHELL, ...DAIRY, ...EGG] },
];

export const DIET_BY_KEY: Record<DietKey, DietOption> = Object.fromEntries(
  DIET_OPTIONS.map((o) => [o.key, o])
) as Record<DietKey, DietOption>;

/** Word-boundary match, so "creamy" hits "cream" but "crab" doesn't hit "scrabble". */
function mentions(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z])${escaped}`, "i").test(haystack);
}

function itemText(item: MenuItem): string {
  return `${item.name} ${item.description ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
}

/**
 * Which of the selected flags this dish trips.
 *
 * An explicit tag beats the text: a dish tagged "Vegan" is cleared of dairy and
 * eggs even if the description mentions butter, because someone wrote that tag
 * on purpose.
 */
export function flagsFor(item: MenuItem, selected: DietKey[]): DietKey[] {
  if (selected.length === 0) return [];
  const text = itemText(item);
  const tags = (item.tags ?? []).map((t) => t.toLowerCase());

  return selected.filter((key) => {
    const option = DIET_BY_KEY[key];
    if (!option) return false;

    if (option.clears?.some((c) => text.includes(c))) return false;

    if (option.kind === "only") {
      // Tagged as such — trust it.
      if (tags.includes(key)) return false;
      if (key === "vegetarian" && tags.includes("vegan")) return false;
      return option.contains.some((w) => mentions(text, w));
    }

    return option.contains.some((w) => mentions(text, w));
  });
}

/** True when the dish trips none of the selected flags. */
export function suitsDiet(item: MenuItem, selected: DietKey[]): boolean {
  return flagsFor(item, selected).length === 0;
}

function list(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} and ${parts.slice(-1)[0]}`;
}

/** Human-readable summary of the flags on a dish. */
export function flagLabel(keys: DietKey[]): string {
  const contains = keys
    .filter((k) => DIET_BY_KEY[k]?.kind === "avoid")
    .map((k) => DIET_BY_KEY[k].label.toLowerCase());
  const diets = keys
    .filter((k) => DIET_BY_KEY[k]?.kind === "only")
    .map((k) => DIET_BY_KEY[k].label.toLowerCase());

  const parts: string[] = [];
  if (contains.length) parts.push(`May contain ${list(contains)}`);
  if (diets.length) parts.push(`May not be ${list(diets)}`);
  return parts.join(" · ");
}
