import { create } from "zustand";
import { P2PRoom } from "@/lib/multiplayer";
import { decrypt, encrypt, mergeUrl, peerId, roomCode, slimUrl, uid } from "./codec";
import { clamp, toISODate } from "./dates";
import { freshState } from "./seed";
import type { Persisted, Settings, Toast, Who } from "./types";
import { PERSIST_KEYS } from "./types";

const KEY = "ngan-ngay.v1";

export type LoveStore = Persisted & {
  tabId: string;
  toasts: Toast[];
  peerCount: number;
  syncLive: boolean;
  syncNote: string;
  vaultOpen: boolean;
  boot: () => () => void;
  dismissToast: (id: string) => void;
  updateSettings: (partial: Partial<Settings>) => void;
  setToday: (partial: Partial<Persisted["today"]>) => void;
  sendPing: (text: string) => void;
  addLetter: (title: string, body: string) => void;
  updateLetter: (id: string, partial: Partial<Persisted["letters"][number]>) => void;
  deleteLetter: (id: string) => void;
  addPhoto: (dataUrl: string, caption: string, date: string) => void;
  updatePhoto: (id: string, partial: Partial<Persisted["photos"][number]>) => void;
  deletePhoto: (id: string) => void;
  setCakeWish: (wish: string) => void;
  waterTree: () => void;
  feedTree: () => void;
  addTreeWish: (text: string) => void;
  removeTreeWish: (id: string) => void;
  toggleStar: (id: string) => void;
  setStarText: (id: string, text: string) => void;
  setGlobe: (partial: Partial<Persisted["globe"]>) => void;
  addRelic: (title: string, story: string) => void;
  updateRelic: (id: string, partial: Partial<Persisted["relics"][number]>) => void;
  deleteRelic: (id: string) => void;
  addLantern: (wish: string) => void;
  deleteLantern: (id: string) => void;
  renamePet: (name: string) => void;
  setPetKind: (kind: Persisted["pet"]["kind"]) => void;
  feedPet: () => void;
  washPet: () => void;
  playPet: () => void;
  cycleAccessory: () => void;
  addJournal: (entry: Omit<Persisted["journal"][number], "id">) => void;
  deleteJournal: (id: string) => void;
  addVoucher: (title: string, detail: string) => void;
  redeemVoucher: (id: string) => void;
  deleteVoucher: (id: string) => void;
  addPlace: (place: Omit<Persisted["places"][number], "id">) => void;
  patchPlace: (id: string, partial: Partial<Persisted["places"][number]>) => void;
  deletePlace: (id: string) => void;
  addBucket: (title: string) => void;
  toggleBucket: (id: string) => void;
  deleteBucket: (id: string) => void;
  addEvent: (title: string, month: number, day: number) => void;
  deleteEvent: (id: string) => void;
  addTrack: (title: string, artist: string, url: string) => void;
  deleteTrack: (id: string) => void;
  addMovie: (title: string) => void;
  patchMovie: (id: string, partial: Partial<Persisted["movies"][number]>) => void;
  deleteMovie: (id: string) => void;
  addDrawing: (dataUrl: string) => void;
  deleteDrawing: (id: string) => void;
  setPuzzleBest: (ms: number) => void;
  addWheel: (label: string) => void;
  deleteWheel: (id: string) => void;
  setVolume: (volume: number) => void;
  addVaultText: (title: string, text: string) => void;
  addVaultImage: (title: string, dataUrl: string) => void;
  deleteVault: (id: string) => void;
  setVaultOpen: (open: boolean) => void;
  setVaultPin: (next: string) => void;
  addCapsule: (title: string, body: string, openOn: string) => void;
  deleteCapsule: (id: string) => void;
  drawTarot: (cardId: string, luck: number, date: string) => void;
  addQuiz: (prompt: string, options: string[], answer: number) => void;
  patchQuiz: (id: string, partial: Partial<Persisted["quiz"][number]>) => void;
  deleteQuiz: (id: string) => void;
  addScore: (who: Who, n: number) => void;
  setSignature: (dataUrl: string) => void;
  setCertNote: (note: string) => void;
  importData: (data: Persisted, mode: "replace" | "merge") => void;
  resetAll: () => void;
  seedPhotos: (photos: Persisted["photos"]) => void;
};

type Wire =
  | { id: string; origin: string; kind: "patch"; patch: Persisted; toast?: string }
  | { id: string; origin: string; kind: "media"; bucket: "photos" | "drawings" | "avatars" | "signature" | "vault"; itemId: string; dataUrl: string; which?: "a" | "b" };

let bc: BroadcastChannel | null = null;
let room: P2PRoom | null = null;
let applying = false;
let started = false;
let timer = 0;
let pendingToast: string | undefined;
const seen = new Set<string>();

function snapshot(state: LoveStore): Persisted {
  const out = {} as Persisted;
  for (const key of PERSIST_KEYS) {
    (out[key] as Persisted[typeof key]) = state[key];
  }
  return out;
}

function load(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data?: Persisted } & Partial<Persisted>;
    const data = parsed.data && parsed.data.settings ? parsed.data : (parsed as Persisted);
    if (!data.settings) return null;
    return { ...freshState(), ...data, settings: { ...freshState().settings, ...data.settings } };
  } catch {
    return null;
  }
}

function writeLocal(data: Persisted): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify({ app: "ngan-ngay", version: 1, data }));
    return true;
  } catch {
    return false;
  }
}

function lite(data: Persisted): Persisted {
  return {
    ...data,
    photos: data.photos.map((p) => ({ ...p, dataUrl: slimUrl(p.dataUrl) })),
    drawings: data.drawings.map((d) => ({ ...d, dataUrl: slimUrl(d.dataUrl) })),
    signature: slimUrl(data.signature),
    settings: {
      ...data.settings,
      avatarA: slimUrl(data.settings.avatarA),
      avatarB: slimUrl(data.settings.avatarB),
    },
    vaultItems: data.vaultItems.map((v) => ({ ...v, payload: v.kind === "image" ? slimUrl(v.payload) : v.payload })),
  };
}

function reconcile(prev: Persisted, incoming: Persisted): Persisted {
  const photos = incoming.photos.map((p) => {
    const old = prev.photos.find((x) => x.id === p.id);
    return { ...p, dataUrl: mergeUrl(old?.dataUrl ?? "", p.dataUrl) };
  });
  const drawings = incoming.drawings.map((d) => {
    const old = prev.drawings.find((x) => x.id === d.id);
    return { ...d, dataUrl: mergeUrl(old?.dataUrl ?? "", d.dataUrl) };
  });
  const vaultItems = incoming.vaultItems.map((v) => {
    const old = prev.vaultItems.find((x) => x.id === v.id);
    return { ...v, payload: v.kind === "image" ? mergeUrl(old?.payload ?? "", v.payload) : v.payload || old?.payload || "" };
  });
  return {
    ...incoming,
    photos,
    drawings,
    vaultItems,
    signature: mergeUrl(prev.signature, incoming.signature),
    settings: {
      ...incoming.settings,
      avatarA: mergeUrl(prev.settings.avatarA, incoming.settings.avatarA),
      avatarB: mergeUrl(prev.settings.avatarB, incoming.settings.avatarB),
    },
  };
}

function pushLocal(text: string) {
  const id = uid("t");
  const cur = useLoveStore.getState();
  useLoveStore.setState({ toasts: [...cur.toasts, { id, text }].slice(-4) });
  window.setTimeout(() => {
    useLoveStore.setState({ toasts: useLoveStore.getState().toasts.filter((t) => t.id !== id) });
  }, 4200);
}

function publish(toast?: string) {
  const state = useLoveStore.getState();
  const data = snapshot(state);
  if (!writeLocal(data)) pushLocal("Bộ nhớ trình duyệt đầy. Hãy xuất bản sao lưu và bớt ảnh.");
  const id = uid("m");
  const packet: Wire = { id, origin: state.tabId, kind: "patch", patch: data, toast };
  try {
    bc?.postMessage(packet);
  } catch {
    pushLocal("Bản đồng bộ quá nặng cho tab kia. Dữ liệu vẫn nằm trên máy này.");
  }
  try {
    room?.send({ ...packet, patch: lite(data) });
  } catch {
    /* peer busy */
  }
}

function schedule(toast?: string) {
  if (applying) return;
  if (toast) pendingToast = toast;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    const t = pendingToast;
    pendingToast = undefined;
    publish(t);
  }, 140);
}

function commit(partial: Partial<Persisted>, toast?: string) {
  useLoveStore.setState(partial);
  schedule(toast);
}

function ingest(msg: Wire) {
  if (!msg || msg.origin === useLoveStore.getState().tabId) return;
  if (seen.has(msg.id)) return;
  seen.add(msg.id);
  if (seen.size > 200) {
    const first = seen.values().next().value;
    if (first) seen.delete(first);
  }
  if (msg.kind !== "patch") return;
  applying = true;
  const prev = snapshot(useLoveStore.getState());
  const next = reconcile(prev, { ...freshState(), ...msg.patch, settings: { ...freshState().settings, ...msg.patch.settings } });
  useLoveStore.setState(next);
  writeLocal(next);
  applying = false;
  if (msg.toast) pushLocal(msg.toast);
}

function bindChannel(code: string, origin: string) {
  bc?.close();
  bc = new BroadcastChannel(`ngan-ngay:${roomCode(code)}`);
  bc.onmessage = (event: MessageEvent<Wire>) => {
    if (event.data?.origin === origin) return;
    ingest(event.data);
  };
  return () => {
    bc?.close();
    bc = null;
  };
}

function joinCloud() {
  room?.close();
  room = null;
  const state = useLoveStore.getState();
  if (!state.settings.cloudSync) {
    useLoveStore.setState({ syncLive: false, peerCount: 0, syncNote: "Đồng bộ hai máy đang tắt." });
    return () => {};
  }
  const name = (state.settings.me === "a" ? state.settings.nickA : state.settings.nickB).slice(0, 64);
  const next = new P2PRoom({
    room: roomCode(state.settings.syncCode),
    selfId: state.tabId,
    name,
    onPeersChanged: (peers) => {
      const n = peers.filter((p) => p.connectionState === "connected").length;
      useLoveStore.setState({
        peerCount: n,
        syncLive: n > 0,
        syncNote: n > 0 ? `Đã nối ${n} máy.` : "Đang tìm máy cùng mã…",
      });
      if (n > 0) {
        try {
          next.send({ id: uid("m"), origin: state.tabId, kind: "patch", patch: lite(snapshot(useLoveStore.getState())) });
        } catch {
          /* ignore */
        }
      }
    },
    onMessage: (_from, data) => {
      ingest(data as Wire);
    },
  });
  room = next;
  useLoveStore.setState({ syncNote: "Đang mở phòng đồng bộ…", syncLive: false });
  void next.join().catch(() => {
    useLoveStore.setState({ syncLive: false, syncNote: "Chưa nối được phòng. Hai cửa sổ cùng máy vẫn đồng bộ." });
  });
  return () => {
    next.close();
    if (room === next) room = null;
  };
}

function myName(): string {
  const s = useLoveStore.getState().settings;
  return s.me === "a" ? s.nickA : s.nickB;
}

function decayPet(pet: Persisted["pet"]): Persisted["pet"] {
  const hours = Math.max(0, (Date.now() - pet.lastTick) / 3_600_000);
  if (hours < 0.25) return pet;
  const steps = Math.min(hours, 72);
  return {
    ...pet,
    hunger: clamp(pet.hunger - steps * 2.2),
    joy: clamp(pet.joy - steps * 1.5),
    clean: clamp(pet.clean - steps * 1.3),
    lastTick: Date.now(),
  };
}

const base = freshState();

export const useLoveStore = create<LoveStore>((set, get) => ({
  ...base,
  tabId: "boot",
  toasts: [],
  peerCount: 0,
  syncLive: false,
  syncNote: "",
  vaultOpen: false,
  boot: () => {
    if (!started) {
      started = true;
      const loaded = load() ?? freshState();
      const tabId = peerId();
      set({
        ...loaded,
        pet: decayPet(loaded.pet),
        tabId,
        toasts: [],
        peerCount: 0,
        syncLive: false,
        syncNote: loaded.settings.cloudSync ? "Đang mở phòng đồng bộ…" : "Hai tab cùng trình duyệt sẽ tự đồng bộ.",
        vaultOpen: false,
      });
      writeLocal(snapshot(get()));
    }
    const origin = get().tabId;
    const stopBc = bindChannel(get().settings.syncCode, origin);
    const stopRoom = joinCloud();
    return () => {
      stopBc();
      stopRoom();
    };
  },
  dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  updateSettings: (partial) => {
    const prev = get().settings;
    const pin = (partial.pin ?? prev.pin).slice(0, 12);
    const vaultPin = (partial.vaultPin ?? prev.vaultPin).slice(0, 12);
    let vaultItems = get().vaultItems;
    if (partial.vaultPin !== undefined && vaultPin !== prev.vaultPin) {
      vaultItems = vaultItems.map((item) => ({
        ...item,
        payload: encrypt(decrypt(item.payload, prev.vaultPin), vaultPin || prev.vaultPin),
      }));
    }
    const settings = { ...prev, ...partial, pin, vaultPin: vaultPin || prev.vaultPin };
    commit({ settings, vaultItems });
    if (partial.syncCode && partial.syncCode !== prev.syncCode) {
      bindChannel(settings.syncCode, get().tabId);
      if (settings.cloudSync) joinCloud();
    }
    if (partial.cloudSync !== undefined && partial.cloudSync !== prev.cloudSync) joinCloud();
  },
  setToday: (partial) => {
    const today = { ...get().today, ...partial, at: Date.now(), by: get().settings.me };
    commit({ today }, `${myName()} cập nhật trạm hôm nay: ${today.mood || today.food || "có tin mới"}.`);
  },
  sendPing: (text) => {
    const clean = text.trim().slice(0, 80);
    if (!clean) return;
    const ping = { id: uid("p"), text: clean, from: get().settings.me, at: Date.now() };
    commit({ pings: [ping, ...get().pings].slice(0, 20) }, `${myName()}: ${clean}`);
  },
  addLetter: (title, body) => {
    const letter = {
      id: uid("l"),
      title: title.trim() || "Thư không đề",
      body: body.trim(),
      from: get().settings.me,
      sealed: true,
      createdAt: Date.now(),
    };
    if (!letter.body) return;
    commit({ letters: [letter, ...get().letters] }, `${myName()} cất thêm một bức thư.`);
  },
  updateLetter: (id, partial) => commit({ letters: get().letters.map((l) => (l.id === id ? { ...l, ...partial } : l)) }),
  deleteLetter: (id) => commit({ letters: get().letters.filter((l) => l.id !== id) }),
  addPhoto: (dataUrl, caption, date) => {
    const photo = { id: uid("ph"), dataUrl, caption: caption.trim(), date, sample: false };
    commit({ photos: [photo, ...get().photos].slice(0, 48), albumSeeded: true }, `${myName()} thêm một ảnh kỷ niệm.`);
  },
  updatePhoto: (id, partial) => commit({ photos: get().photos.map((p) => (p.id === id ? { ...p, ...partial } : p)) }),
  deletePhoto: (id) => commit({ photos: get().photos.filter((p) => p.id !== id) }),
  setCakeWish: (wish) => commit({ cakeWish: wish.slice(0, 280) }),
  waterTree: () => {
    const today = toISODate(new Date());
    const tree = get().tree;
    if (tree.lastWater === today) {
      pushLocal("Hôm nay mình đã tưới rồi. Mai tiếp nhé.");
      return;
    }
    commit({ tree: { ...tree, water: tree.water + 1, lastWater: today } }, `${myName()} vừa tưới cây.`);
  },
  feedTree: () => {
    const today = toISODate(new Date());
    const tree = get().tree;
    if (tree.lastFeed === today) {
      pushLocal("Phân bón hôm nay đã đủ.");
      return;
    }
    commit({ tree: { ...tree, feed: tree.feed + 1, lastFeed: today } }, `${myName()} vừa bón cây.`);
  },
  addTreeWish: (text) => {
    const clean = text.trim().slice(0, 80);
    if (!clean) return;
    const tree = get().tree;
    commit({ tree: { ...tree, wishes: [{ id: uid("w"), text: clean }, ...tree.wishes].slice(0, 12) } });
  },
  removeTreeWish: (id) => {
    const tree = get().tree;
    commit({ tree: { ...tree, wishes: tree.wishes.filter((w) => w.id !== id) } });
  },
  toggleStar: (id) => commit({ stars: get().stars.map((s) => (s.id === id ? { ...s, found: !s.found } : s)) }),
  setStarText: (id, text) => commit({ stars: get().stars.map((s) => (s.id === id ? { ...s, text: text.slice(0, 180) } : s)) }),
  setGlobe: (partial) => commit({ globe: { ...get().globe, ...partial } }),
  addRelic: (title, story) => {
    if (!title.trim() || !story.trim()) return;
    const relic = { id: uid("r"), title: title.trim(), year: String(new Date().getFullYear()), story: story.trim() };
    commit({ relics: [relic, ...get().relics] });
  },
  updateRelic: (id, partial) => commit({ relics: get().relics.map((r) => (r.id === id ? { ...r, ...partial } : r)) }),
  deleteRelic: (id) => commit({ relics: get().relics.filter((r) => r.id !== id) }),
  addLantern: (wish) => {
    const clean = wish.trim().slice(0, 120);
    if (!clean) return;
    const lantern = { id: uid("la"), wish: clean, at: Date.now(), by: get().settings.me };
    commit({ lanterns: [lantern, ...get().lanterns].slice(0, 40) }, `${myName()} thả một đèn ước.`);
  },
  deleteLantern: (id) => commit({ lanterns: get().lanterns.filter((l) => l.id !== id) }),
  renamePet: (name) => commit({ pet: { ...get().pet, name: name.slice(0, 16) || get().pet.name } }),
  setPetKind: (kind) => commit({ pet: { ...get().pet, kind } }),
  feedPet: () => {
    const pet = get().pet;
    commit({
      pet: { ...pet, hunger: clamp(pet.hunger + 22), xp: pet.xp + 4, lastTick: Date.now() },
    }, `${myName()} cho ${pet.name} ăn.`);
  },
  washPet: () => {
    const pet = get().pet;
    commit({ pet: { ...pet, clean: clamp(pet.clean + 28), xp: pet.xp + 3, lastTick: Date.now() } });
  },
  playPet: () => {
    const pet = get().pet;
    commit({
      pet: { ...pet, joy: clamp(pet.joy + 20), hunger: clamp(pet.hunger - 6), xp: pet.xp + 5, lastTick: Date.now() },
    });
  },
  cycleAccessory: () => commit({ pet: { ...get().pet, accessory: (get().pet.accessory + 1) % 4 } }),
  addJournal: (entry) => {
    if (!entry.text.trim()) return;
    commit({
      journal: [{ ...entry, id: uid("j"), text: entry.text.trim() }, ...get().journal].slice(0, 200),
    });
  },
  deleteJournal: (id) => commit({ journal: get().journal.filter((j) => j.id !== id) }),
  addVoucher: (title, detail) => {
    if (!title.trim()) return;
    commit({
      vouchers: [{ id: uid("v"), title: title.trim(), detail: detail.trim(), stock: 3, used: 0 }, ...get().vouchers],
    });
  },
  redeemVoucher: (id) => {
    const card = get().vouchers.find((v) => v.id === id);
    if (!card || card.stock <= 0) return;
    commit(
      {
        vouchers: get().vouchers.map((v) => (v.id === id ? { ...v, stock: v.stock - 1, used: v.used + 1 } : v)),
      },
      `${myName()} dùng thẻ “${card.title}”.`,
    );
  },
  deleteVoucher: (id) => commit({ vouchers: get().vouchers.filter((v) => v.id !== id) }),
  addPlace: (place) => {
    if (!place.name.trim()) return;
    commit({ places: [{ ...place, id: uid("pl"), name: place.name.trim() }, ...get().places] });
  },
  patchPlace: (id, partial) => commit({ places: get().places.map((p) => (p.id === id ? { ...p, ...partial } : p)) }),
  deletePlace: (id) => commit({ places: get().places.filter((p) => p.id !== id) }),
  addBucket: (title) => {
    if (!title.trim()) return;
    commit({ bucket: [{ id: uid("b"), title: title.trim(), done: false, doneOn: "" }, ...get().bucket] });
  },
  toggleBucket: (id) =>
    commit({
      bucket: get().bucket.map((b) =>
        b.id === id ? { ...b, done: !b.done, doneOn: !b.done ? toISODate(new Date()) : "" } : b,
      ),
    }),
  deleteBucket: (id) => commit({ bucket: get().bucket.filter((b) => b.id !== id) }),
  addEvent: (title, month, day) => {
    if (!title.trim() || month < 1 || month > 12 || day < 1 || day > 31) return;
    commit({ events: [...get().events, { id: uid("e"), title: title.trim(), month, day, remind: true }] });
  },
  deleteEvent: (id) => commit({ events: get().events.filter((e) => e.id !== id) }),
  addTrack: (title, artist, url) => {
    if (!url.trim()) return;
    commit({ tracks: [...get().tracks, { id: uid("tr"), title: title.trim() || "Bài hát", artist: artist.trim() || "Tự thêm", url: url.trim() }] });
  },
  deleteTrack: (id) => commit({ tracks: get().tracks.filter((t) => t.id !== id) }),
  addMovie: (title) => {
    if (!title.trim()) return;
    commit({ movies: [{ id: uid("mv"), title: title.trim(), status: "want", score: 0, note: "" }, ...get().movies] });
  },
  patchMovie: (id, partial) => commit({ movies: get().movies.map((m) => (m.id === id ? { ...m, ...partial } : m)) }),
  deleteMovie: (id) => commit({ movies: get().movies.filter((m) => m.id !== id) }),
  addDrawing: (dataUrl) => commit({ drawings: [{ id: uid("dr"), dataUrl, at: Date.now() }, ...get().drawings].slice(0, 24) }),
  deleteDrawing: (id) => commit({ drawings: get().drawings.filter((d) => d.id !== id) }),
  setPuzzleBest: (ms) => {
    const best = get().puzzleBestMs;
    if (best !== null && ms >= best) return;
    commit({ puzzleBestMs: ms }, `${myName()} lập kỷ lục ghép hình.`);
  },
  addWheel: (label) => {
    if (!label.trim()) return;
    commit({ wheel: [...get().wheel, { id: uid("wh"), label: label.trim().slice(0, 32) }].slice(0, 12) });
  },
  deleteWheel: (id) => commit({ wheel: get().wheel.filter((w) => w.id !== id) }),
  setVolume: (volume) => commit({ volume: Math.max(0, Math.min(1, volume)) }),
  addVaultText: (title, text) => {
    if (!text.trim()) return;
    const item = {
      id: uid("va"),
      title: title.trim() || "Ghi chép",
      payload: encrypt(text.trim(), get().settings.vaultPin),
      kind: "text" as const,
      at: Date.now(),
    };
    commit({ vaultItems: [item, ...get().vaultItems] });
  },
  addVaultImage: (title, dataUrl) => {
    const item = {
      id: uid("va"),
      title: title.trim() || "Ảnh riêng",
      payload: encrypt(dataUrl, get().settings.vaultPin),
      kind: "image" as const,
      at: Date.now(),
    };
    commit({ vaultItems: [item, ...get().vaultItems] });
  },
  deleteVault: (id) => commit({ vaultItems: get().vaultItems.filter((v) => v.id !== id) }),
  setVaultOpen: (open) => set({ vaultOpen: open }),
  setVaultPin: (next) => {
    const clean = next.trim().slice(0, 12);
    if (clean.length < 4) {
      pushLocal("Mật khẩu két cần ít nhất 4 ký tự.");
      return;
    }
    const prev = get().settings.vaultPin;
    const vaultItems = get().vaultItems.map((item) => ({
      ...item,
      payload: encrypt(decrypt(item.payload, prev), clean),
    }));
    commit({ settings: { ...get().settings, vaultPin: clean }, vaultItems }, "Đã đổi mật khẩu két.");
    set({ vaultOpen: false });
  },
  addCapsule: (title, body, openOn) => {
    if (!body.trim() || !openOn) return;
    commit({
      capsules: [
        { id: uid("c"), title: title.trim() || "Thư tương lai", body: body.trim(), openOn, createdAt: Date.now() },
        ...get().capsules,
      ],
    });
  },
  deleteCapsule: (id) => commit({ capsules: get().capsules.filter((c) => c.id !== id) }),
  drawTarot: (cardId, luck, date) => {
    const draw = { date, cardId, luck };
    const log = [draw, ...get().tarotLog.filter((t) => t.date !== date)].slice(0, 30);
    commit({ tarot: draw, tarotLog: log });
  },
  addQuiz: (prompt, options, answer) => {
    if (!prompt.trim() || options.filter(Boolean).length < 2) return;
    commit({
      quiz: [...get().quiz, { id: uid("q"), prompt: prompt.trim(), options: options.map((o) => o.trim()).filter(Boolean), answer }],
    });
  },
  patchQuiz: (id, partial) => commit({ quiz: get().quiz.map((q) => (q.id === id ? { ...q, ...partial } : q)) }),
  deleteQuiz: (id) => commit({ quiz: get().quiz.filter((q) => q.id !== id) }),
  addScore: (who, n) => commit({ scores: { ...get().scores, [who]: get().scores[who] + n } }),
  setSignature: (dataUrl) => commit({ signature: dataUrl }),
  setCertNote: (note) => commit({ certNote: note.slice(0, 280) }),
  importData: (data, mode) => {
    if (mode === "replace") {
      commit(data, "Đã khôi phục bản sao lưu.");
      bindChannel(data.settings.syncCode, get().tabId);
      if (data.settings.cloudSync) joinCloud();
      return;
    }
    const cur = snapshot(get());
    const mergeBy = <T extends { id: string }>(a: T[], b: T[]) => {
      const map = new Map<string, T>();
      for (const item of a) map.set(item.id, item);
      for (const item of b) if (!map.has(item.id)) map.set(item.id, item);
      return [...map.values()];
    };
    const next: Persisted = {
      ...cur,
      settings: { ...cur.settings, ...data.settings },
      letters: mergeBy(cur.letters, data.letters),
      photos: mergeBy(cur.photos, data.photos),
      journal: mergeBy(cur.journal, data.journal),
      relics: mergeBy(cur.relics, data.relics),
      lanterns: mergeBy(cur.lanterns, data.lanterns),
      places: mergeBy(cur.places, data.places),
      bucket: mergeBy(cur.bucket, data.bucket),
      movies: mergeBy(cur.movies, data.movies),
      drawings: mergeBy(cur.drawings, data.drawings),
      capsules: mergeBy(cur.capsules, data.capsules),
      vouchers: mergeBy(cur.vouchers, data.vouchers),
      pings: mergeBy(cur.pings, data.pings).slice(0, 20),
    };
    commit(next, "Đã gộp bản sao lưu.");
  },
  resetAll: () => {
    const fresh = freshState();
    set({ vaultOpen: false });
    commit(fresh, "Đã trở về dữ liệu mặc định trên máy này.");
    bindChannel(fresh.settings.syncCode, get().tabId);
    joinCloud();
  },
  seedPhotos: (photos) => {
    if (get().albumSeeded) return;
    set({ photos, albumSeeded: true });
    writeLocal(snapshot(get()));
  },
}));

export function exportPayload(): string {
  const data = snapshot(useLoveStore.getState());
  return JSON.stringify({ app: "ngan-ngay", version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
}

export function parseImport(raw: string): Persisted | null {
  try {
    const parsed = JSON.parse(raw) as { data?: Persisted } & Partial<Persisted>;
    const data = parsed.data?.settings ? parsed.data : (parsed as Persisted);
    if (!data.settings?.startDate) return null;
    const fresh = freshState();
    return {
      ...fresh,
      ...data,
      settings: { ...fresh.settings, ...data.settings },
      photos: Array.isArray(data.photos) ? data.photos : [],
      letters: Array.isArray(data.letters) ? data.letters : fresh.letters,
      pings: Array.isArray(data.pings) ? data.pings : [],
      journal: Array.isArray(data.journal) ? data.journal : [],
      bucket: Array.isArray(data.bucket) ? data.bucket : fresh.bucket,
      quiz: Array.isArray(data.quiz) ? data.quiz : fresh.quiz,
    };
  } catch {
    return null;
  }
}
