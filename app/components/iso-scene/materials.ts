// One `background` per visible face (any CSS background, so patterns are
// allowed). Most materials are a single hue lit top > left (+y) > right (+x,
// the darkest); a few mix surfaces on purpose (GROUND, CLIPBOARD). The bottom
// tone is optional and falls back to the right tone.
export type Material = { top: string; left: string; right: string; bottom?: string };

const tone = (top: string, left: string, right: string): Material => ({
  top,
  left,
  right,
});

const lattice = (base: string) =>
  `repeating-linear-gradient(45deg, rgba(70, 52, 8, 0.55) 0 max(1px, calc(var(--u) * 0.08)), transparent max(1px, calc(var(--u) * 0.08)) calc(var(--u) * 0.6)), ${base}`;

const courses = (base: string) =>
  `repeating-linear-gradient(0deg, rgba(110, 112, 140, 0.5) 0 max(1px, calc(var(--u) * 0.05)), transparent max(1px, calc(var(--u) * 0.05)) calc(var(--u) * 0.35)), ${base}`;

export const CLAWD = tone("#E8906F", "#D97757", "#B85F42");

export const HAT = tone("#FFA733", "#FF8A00", "#D96E00");
export const HAT_BRIM = tone("#F08A12", "#E56F00", "#BF5A00");
export const HAT_STRIPE = tone("#FFD08A", "#FFC266", "#E0A24A");

export const GROUND = tone("#7CC15A", "#8A5A2B", "#6F4620");
export const PIT = tone("#2A170A", "#1B0F06", "#1B0F06");
export const SOIL = tone("#B0814B", "#9A6A3A", "#7A4A21");

export const CONCRETE = tone("#F1F2FA", "#DADBE9", "#C0C2D8");
export const CONCRETE_DARK = tone("#C9CBDD", "#B3B5CC", "#9A9CB6");
export const BRICK = tone(
  "#E6E7F2",
  courses("#D2D3E4"),
  courses("#B9BBD2"),
);

export const CRANE = tone("#FFD966", "#F5C23A", "#D9A21F");
export const CRANE_LATTICE = tone(
  lattice("#FFD966"),
  lattice("#F5C23A"),
  lattice("#D9A21F"),
);
export const MACHINE_ORANGE = tone("#FFB44D", "#F0952A", "#C77A1C");

export const DARK = tone("#55565E", "#3B3C42", "#2A2B30");
export const GLASS = tone("#B4E1F5", "#8CC4E0", "#6AA6C6");
export const STEEL = tone("#C7CDD5", "#9AA3AD", "#7C858F");
export const WOOD = tone("#B98A55", "#8B5A2B", "#6E451F");
export const CLIPBOARD = tone("#A47441", "#F4F1E8", "#8B5A2B");
export const POST = tone("#B4BBC4", "#9AA3AD", "#7C858F");
export const CLEAR = tone("transparent", "transparent", "transparent");
