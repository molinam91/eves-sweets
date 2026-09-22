import { DEFAULT_CATERING, DEFAULT_MENU } from "./mockData";

export type BundledPhoto = { photo: string; label: string };

/**
 * Every stock photo shipped with the site (public/menu/*.jpg), so the admin item
 * editor can offer them as a pick-list. This is what lets Jayro fix a wrong or
 * missing photo himself -- typing the item's name and hoping a guess elsewhere in
 * the app matches it is a trap; picking the photo directly here isn't.
 */
export const BUNDLED_PHOTOS: BundledPhoto[] = [
  ...[...DEFAULT_MENU, ...DEFAULT_CATERING]
    .filter((p) => p.photo)
    .map((p) => ({ photo: p.photo as string, label: p.name })),
  { photo: "/menu/jalapeno-cheddar-bread.jpg?v=2", label: "Jalapeno Cheddar Bread" },
  { photo: "/menu/habanero-cheddar-bread.jpg?v=2", label: "Habanero Cheddar Bread" },
  { photo: "/menu/garlic-cheese-loaf.jpg", label: "Garlic Cheese Loaf" },
  { photo: "/menu/cinnamon-swirl.jpg", label: "Cinnamon Swirl" },
  { photo: "/menu/chocolate-swirl.jpg", label: "Chocolate Swirl" },
  { photo: "/menu/chocolate-chip-banana-muffins.jpg", label: "Chocolate Chip Banana Muffins" },
  { photo: "/menu/mexican-cheesecake.jpg", label: "Mexican Cheese Pie" },
  { photo: "/menu/fitness-banana-bread.jpg", label: "Fitness Banana Bread" },
  { photo: "/menu/banana-bread.jpg", label: "Banana Bread" },
  { photo: "/menu/gelatina-mosaico-party-size.jpg", label: "Gelatina Mosaico (Party Size)" },
];
