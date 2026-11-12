export type Who = "a" | "b";
export type Mood = "vui" | "nho" | "hon" | "hanh";
export type PetKind = "cat" | "dog" | "rabbit";
export type MovieStatus = "want" | "watching" | "done";
export type SnowTint = "rose" | "cream" | "gold";
export type ModuleId =
  | "lock"
  | "clock"
  | "today"
  | "pings"
  | "letters"
  | "album"
  | "cake"
  | "tree"
  | "sky"
  | "globe"
  | "museum"
  | "lanterns"
  | "pet"
  | "journal"
  | "vouchers"
  | "map"
  | "bucket"
  | "calendar"
  | "vinyl"
  | "movies"
  | "draw"
  | "puzzle"
  | "wheel"
  | "sounds"
  | "vault"
  | "capsule"
  | "tarot"
  | "quiz"
  | "certificate"
  | "backup";

export type GroupId = "start" | "dream" | "daily" | "play" | "ever";

export type Settings = {
  nameA: string;
  nameB: string;
  nickA: string;
  nickB: string;
  startDate: string;
  birthdayA: string;
  birthdayB: string;
  avatarA: string;
  avatarB: string;
  syncCode: string;
  pin: string;
  vaultPin: string;
  me: Who;
  cloudSync: boolean;
};

export type Today = {
  food: string;
  buy: string;
  mood: string;
  place: string;
  note: string;
  at: number;
  by: Who;
};

export type Ping = { id: string; text: string; from: Who; at: number };
export type Letter = {
  id: string;
  title: string;
  body: string;
  from: Who;
  sealed: boolean;
  createdAt: number;
};
export type Photo = {
  id: string;
  dataUrl: string;
  caption: string;
  date: string;
  sample: boolean;
};
export type WishTag = { id: string; text: string };
export type Tree = {
  water: number;
  feed: number;
  wishes: WishTag[];
  lastWater: string;
  lastFeed: string;
};
export type Star = { id: string; x: number; y: number; name: string; text: string; found: boolean };
export type Globe = { tint: SnowTint; photoId: string };
export type Relic = { id: string; title: string; year: string; story: string };
export type Lantern = { id: string; wish: string; at: number; by: Who };
export type Pet = {
  name: string;
  kind: PetKind;
  hunger: number;
  joy: number;
  clean: number;
  xp: number;
  accessory: number;
  lastTick: number;
};
export type Journal = { id: string; date: string; mood: Mood; text: string; author: Who };
export type Voucher = { id: string; title: string; detail: string; stock: number; used: number };
export type Place = {
  id: string;
  name: string;
  city: string;
  note: string;
  rating: number;
  visited: boolean;
  x: number;
  y: number;
};
export type Bucket = { id: string; title: string; done: boolean; doneOn: string };
export type EventItem = { id: string; title: string; month: number; day: number; remind: boolean };
export type Track = { id: string; title: string; artist: string; url: string };
export type Movie = { id: string; title: string; status: MovieStatus; score: number; note: string };
export type Drawing = { id: string; dataUrl: string; at: number };
export type WheelOpt = { id: string; label: string };
export type VaultItem = { id: string; title: string; payload: string; kind: "text" | "image"; at: number };
export type Capsule = { id: string; title: string; body: string; openOn: string; createdAt: number };
export type TarotDraw = { date: string; cardId: string; luck: number };
export type QuizQ = { id: string; prompt: string; options: string[]; answer: number };
export type Scoreboard = { a: number; b: number };
export type Toast = { id: string; text: string };

export type Persisted = {
  settings: Settings;
  today: Today;
  pings: Ping[];
  letters: Letter[];
  photos: Photo[];
  albumSeeded: boolean;
  cakeWish: string;
  tree: Tree;
  stars: Star[];
  globe: Globe;
  relics: Relic[];
  lanterns: Lantern[];
  pet: Pet;
  journal: Journal[];
  vouchers: Voucher[];
  places: Place[];
  bucket: Bucket[];
  events: EventItem[];
  tracks: Track[];
  movies: Movie[];
  drawings: Drawing[];
  puzzleBestMs: number | null;
  wheel: WheelOpt[];
  volume: number;
  vaultItems: VaultItem[];
  capsules: Capsule[];
  tarot: TarotDraw | null;
  tarotLog: TarotDraw[];
  quiz: QuizQ[];
  scores: Scoreboard;
  signature: string;
  certNote: string;
};

export const PERSIST_KEYS = [
  "settings",
  "today",
  "pings",
  "letters",
  "photos",
  "albumSeeded",
  "cakeWish",
  "tree",
  "stars",
  "globe",
  "relics",
  "lanterns",
  "pet",
  "journal",
  "vouchers",
  "places",
  "bucket",
  "events",
  "tracks",
  "movies",
  "drawings",
  "puzzleBestMs",
  "wheel",
  "volume",
  "vaultItems",
  "capsules",
  "tarot",
  "tarotLog",
  "quiz",
  "scores",
  "signature",
  "certNote",
] as const satisfies readonly (keyof Persisted)[];
