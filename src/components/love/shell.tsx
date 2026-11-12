import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Heart, Settings, X } from "lucide-react";
import { CATALOG, GROUPS } from "@/lib/love/catalog";
import { paintPoster } from "@/lib/love/art";
import { daysBetween, formatVN, nextAnnual, parseDate, splitDuration, togetherMs } from "@/lib/love/dates";
import { useLoveStore } from "@/lib/love/store";
import type { ModuleId, Settings as CoupleSettings } from "@/lib/love/types";
import { AlbumModule, ClockModule, LettersModule, LockScreen, PingsModule, TodayModule } from "./mod-start";
import { CakeModule, GlobeModule, LanternModule, MuseumModule, SkyModule, TreeModule } from "./mod-dream";
import { BucketModule, CalendarModule, JournalModule, MapModule, PetModule, VoucherModule } from "./mod-daily";
import { DrawModule, MoviesModule, PuzzleModule, SoundsModule, VinylModule, WheelModule } from "./mod-play";
import { BackupModule, CapsuleModule, CertificateModule, QuizModule, TarotModule, VaultModule } from "./mod-forever";
import { Flow } from "./flow";
import { Btn, Field, PhotoPick, fieldClass, useNow } from "./ui";

function ModuleView({ id }: { id: ModuleId }) {
  switch (id) {
    case "clock":
      return <ClockModule />;
    case "today":
      return <TodayModule />;
    case "pings":
      return <PingsModule />;
    case "letters":
      return <LettersModule />;
    case "album":
      return <AlbumModule />;
    case "cake":
      return <CakeModule />;
    case "tree":
      return <TreeModule />;
    case "sky":
      return <SkyModule />;
    case "globe":
      return <GlobeModule />;
    case "museum":
      return <MuseumModule />;
    case "lanterns":
      return <LanternModule />;
    case "pet":
      return <PetModule />;
    case "journal":
      return <JournalModule />;
    case "vouchers":
      return <VoucherModule />;
    case "map":
      return <MapModule />;
    case "bucket":
      return <BucketModule />;
    case "calendar":
      return <CalendarModule />;
    case "vinyl":
      return <VinylModule />;
    case "movies":
      return <MoviesModule />;
    case "draw":
      return <DrawModule />;
    case "puzzle":
      return <PuzzleModule />;
    case "wheel":
      return <WheelModule />;
    case "sounds":
      return <SoundsModule />;
    case "vault":
      return <VaultModule />;
    case "capsule":
      return <CapsuleModule />;
    case "tarot":
      return <TarotModule />;
    case "quiz":
      return <QuizModule />;
    case "certificate":
      return <CertificateModule />;
    case "backup":
      return <BackupModule />;
    default:
      return <ClockModule />;
  }
}

function SettingsPanel({ onClose, onLock }: { onClose: () => void; onLock: () => void }) {
  const settings = useLoveStore((s) => s.settings);
  const updateSettings = useLoveStore((s) => s.updateSettings);
  const peerCount = useLoveStore((s) => s.peerCount);
  const syncNote = useLoveStore((s) => s.syncNote);
  const set = (partial: Partial<CoupleSettings>) => updateSettings(partial);
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-bg px-4 py-6 text-fg">
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl">Cài đặt sống</h2>
          <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={onClose} aria-label="Đóng">
            <X className="size-5" />
          </button>
        </div>
        <p className="text-sm text-muted">Đổi tên, ngày, ảnh và mật khẩu. Mọi thứ tự lưu trên máy này.</p>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Biệt danh bạn nam">
            <input className={fieldClass} value={settings.nickA} onChange={(e) => set({ nickA: e.target.value })} />
          </Field>
          <Field label="Biệt danh bạn nữ">
            <input className={fieldClass} value={settings.nickB} onChange={(e) => set({ nickB: e.target.value })} />
          </Field>
          <Field label="Tên bạn nam">
            <input className={fieldClass} value={settings.nameA} onChange={(e) => set({ nameA: e.target.value })} />
          </Field>
          <Field label="Tên bạn nữ">
            <input className={fieldClass} value={settings.nameB} onChange={(e) => set({ nameB: e.target.value })} />
          </Field>
          <Field label="Ngày bắt đầu yêu">
            <input className={fieldClass} type="date" value={settings.startDate} onChange={(e) => e.target.value && set({ startDate: e.target.value })} />
          </Field>
          <Field label="Mã kết nối">
            <input className={fieldClass} value={settings.syncCode} onChange={(e) => set({ syncCode: e.target.value })} />
          </Field>
          <Field label="Sinh nhật bạn nam">
            <input className={fieldClass} type="date" value={settings.birthdayA} onChange={(e) => e.target.value && set({ birthdayA: e.target.value })} />
          </Field>
          <Field label="Sinh nhật bạn nữ">
            <input className={fieldClass} type="date" value={settings.birthdayB} onChange={(e) => e.target.value && set({ birthdayB: e.target.value })} />
          </Field>
          <Field label="Mật khẩu màn hình khóa">
            <input className={fieldClass} value={settings.pin} onChange={(e) => set({ pin: e.target.value })} />
          </Field>
          <Field label="Mật khẩu két">
            <input className={fieldClass} value={settings.vaultPin} onChange={(e) => set({ vaultPin: e.target.value })} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          <PhotoPick label="Ảnh bạn nam" onPick={(urls) => urls[0] && set({ avatarA: urls[0] })} />
          <PhotoPick label="Ảnh bạn nữ" onPick={(urls) => urls[0] && set({ avatarB: urls[0] })} />
          <Btn variant="ghost" onClick={() => set({ avatarA: "", avatarB: "" })}>Gỡ ảnh</Btn>
        </div>
        <div className="flex gap-2">
          <button type="button" className={settings.me === "a" ? "min-h-11 flex-1 rounded-full bg-primary text-sm text-primary-fg" : "min-h-11 flex-1 rounded-full border border-line text-sm"} onClick={() => set({ me: "a" })}>
            Tôi là {settings.nickA}
          </button>
          <button type="button" className={settings.me === "b" ? "min-h-11 flex-1 rounded-full bg-primary text-sm text-primary-fg" : "min-h-11 flex-1 rounded-full border border-line text-sm"} onClick={() => set({ me: "b" })}>
            Tôi là {settings.nickB}
          </button>
        </div>
        <div className="rounded-3xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Nối hai máy</p>
              <p className="text-sm text-muted">{syncNote || "Tắt"} · {peerCount} máy đang nối</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.cloudSync}
              className={settings.cloudSync ? "min-h-11 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 rounded-full border border-line px-4 text-sm"}
              onClick={() => set({ cloudSync: !settings.cloudSync })}
            >
              {settings.cloudSync ? "Đang bật" : "Đang tắt"}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Cùng một trình duyệt, hai tab tự cập nhật. Hai điện thoại cần bật nút này và nhập cùng mã. Ai có mã cũng đọc được dữ liệu đang đồng bộ — hãy đổi mã riêng. Mã chỉ gồm chữ, số và dấu gạch.
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="line" onClick={onLock}>Khóa màn hình</Btn>
          <Btn onClick={onClose}>Xong</Btn>
        </div>
      </div>
    </div>
  );
}

function Home({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  const settings = useLoveStore((s) => s.settings);
  const photos = useLoveStore((s) => s.photos);
  const letters = useLoveStore((s) => s.letters);
  const pet = useLoveStore((s) => s.pet);
  const bucket = useLoveStore((s) => s.bucket);
  const pings = useLoveStore((s) => s.pings);
  const [group, setGroup] = useState<(typeof GROUPS)[number]["id"] | "all">("all");
  const now = useNow();
  const parts = splitDuration(togetherMs(parseDate(settings.startDate), now));
  const nextA = daysBetween(now, nextAnnual(parseDate(settings.birthdayA), now));
  const nextB = daysBetween(now, nextAnnual(parseDate(settings.birthdayB), now));
  const done = bucket.filter((item) => item.done).length;
  const list = CATALOG.filter((item) => group === "all" || item.group === group);
  const stats: Partial<Record<ModuleId, string>> = {
    clock: `${parts.days} ngày`,
    album: `${photos.length} ảnh`,
    letters: `${letters.length} thư`,
    pet: pet.name,
    bucket: `${done}/${bucket.length}`,
    pings: pings[0]?.text ?? "Chưa nhắn",
  };
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-line bg-surface px-5 py-6">
        <p className="text-sm text-gold">Từ {formatVN(parseDate(settings.startDate))}</p>
        <h1 className="mt-1 font-display text-4xl text-fg md:text-6xl">
          {settings.nickA}
          <Heart className="mx-2 inline size-7 text-primary" aria-hidden />
          {settings.nickB}
        </h1>
        <p className="mt-3 font-display text-5xl tabular-nums text-fg">{parts.days}</p>
        <p className="text-muted">ngày bên nhau · sinh nhật {settings.nameA} còn {nextA} ngày · {settings.nameB} còn {nextB} ngày</p>
      </section>
      <Flow />
      <div className="flex gap-2 overflow-x-auto">
        <button type="button" className={group === "all" ? "min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 shrink-0 rounded-full border border-line px-4 text-sm"} onClick={() => setGroup("all")}>
          Cả 30
        </button>
        {GROUPS.map((item) => (
          <button key={item.id} type="button" className={group === item.id ? "min-h-11 shrink-0 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 shrink-0 rounded-full border border-line px-4 text-sm"} onClick={() => setGroup(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {list.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} type="button" onClick={() => onOpen(item.id)} className="rounded-3xl border border-line bg-surface p-4 text-left">
              <Icon className="size-5 text-primary" aria-hidden />
              <p className="mt-3 text-xs text-gold">{item.index}</p>
              <p className="font-display text-xl text-fg">{item.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{stats[item.id] ?? item.blurb}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function App() {
  const settings = useLoveStore((s) => s.settings);
  const toasts = useLoveStore((s) => s.toasts);
  const dismissToast = useLoveStore((s) => s.dismissToast);
  const albumSeeded = useLoveStore((s) => s.albumSeeded);
  const seedPhotos = useLoveStore((s) => s.seedPhotos);
  const [locked, setLocked] = useState(true);
  const [active, setActive] = useState<ModuleId | null>(null);
  const [gear, setGear] = useState(false);
  const now = useNow();
  const days = useMemo(() => splitDuration(togetherMs(parseDate(settings.startDate), now)).days, [settings.startDate, now]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("ngan-open") === "1") setLocked(false);
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    document.title = `${settings.nickA} & ${settings.nickB} · Ngàn Ngày`;
  }, [settings.nickA, settings.nickB]);

  useEffect(() => {
    if (albumSeeded) return;
    seedPhotos(
      [0, 1, 2].map((kind) => ({
        id: `sample-${kind}`,
        dataUrl: paintPoster(kind),
        caption: ["Ngày đầu", "Đêm mưa", "Mốc 27.06"][kind] ?? "Kỷ niệm",
        date: "2026-06-27",
        sample: true,
      })),
    );
  }, [albumSeeded, seedPhotos]);

  const unlock = () => {
    try {
      sessionStorage.setItem("ngan-open", "1");
    } catch {
      /* ignore */
    }
    setLocked(false);
  };
  const lock = () => {
    try {
      sessionStorage.removeItem("ngan-open");
    } catch {
      /* ignore */
    }
    setGear(false);
    setActive(null);
    setLocked(true);
  };

  if (locked) return <LockScreen onUnlock={unlock} />;

  return (
    <div className="min-h-dvh text-fg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          {active ? (
            <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setActive(null)} aria-label="Về trang chính">
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <Heart className="size-5 text-primary" aria-hidden />
          )}
          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setActive(null)}>
            <p className="truncate font-display text-lg">{settings.nickA} & {settings.nickB}</p>
            <p className="text-xs text-muted tabular-nums">{days} ngày</p>
          </button>
          <button type="button" className="grid size-11 place-items-center rounded-full border border-line" onClick={() => setGear(true)} aria-label="Cài đặt">
            <Settings className="size-5" />
          </button>
        </div>
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 pb-16">
        {active && active !== "lock" ? <ModuleView id={active} /> : <Home onOpen={(id) => (id === "lock" ? lock() : setActive(id))} />}
      </main>
      <div className="fixed right-4 bottom-4 left-4 z-30 flex flex-col gap-2 md:left-auto md:w-80">
        {toasts.map((toast) => (
          <button key={toast.id} type="button" onClick={() => dismissToast(toast.id)} className="rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm text-fg shadow-lg">
            {toast.text}
          </button>
        ))}
      </div>
      {gear ? <SettingsPanel onClose={() => setGear(false)} onLock={lock} /> : null}
    </div>
  );
}
