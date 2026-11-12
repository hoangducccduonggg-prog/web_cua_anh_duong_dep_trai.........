import { useEffect, useMemo, useRef, useState } from "react";
import { Delete, Heart } from "lucide-react";
import { Fireworks } from "./canvas-bits";
import { Btn, Empty, Field, ModuleFrame, Panel, PhotoPick, fieldClass, useNow, useTypewriter } from "./ui";
import { daysBetween, formatClock, formatVN, milestones, nextAnnual, parseDate, relativeLabel, splitDuration, togetherMs } from "@/lib/love/dates";
import { paintPoster } from "@/lib/love/art";
import { QUICK_PINGS, MOODS, nickOf } from "@/lib/love/seed";
import { useLoveStore } from "@/lib/love/store";
import { toISODate } from "@/lib/love/dates";

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const settings = useLoveStore((s) => s.settings);
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [burst, setBurst] = useState(0);
  const [help, setHelp] = useState(false);
  const [recA, setRecA] = useState("");
  const [recB, setRecB] = useState("");
  const [error, setError] = useState("");
  const submitRef = useRef<(value: string) => void>(() => {});

  const submit = (value: string) => {
    if (value === settings.pin) {
      setBurst((n) => n + 1);
      window.setTimeout(onUnlock, 700);
      return;
    }
    setShake(true);
    setError("Chưa đúng. Thử lại nhé.");
    window.setTimeout(() => setShake(false), 400);
    setPin("");
  };
  submitRef.current = submit;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key >= "0" && event.key <= "9") {
        setPin((current) => (current + event.key).slice(0, 12));
        return;
      }
      if (event.key === "Backspace") {
        setPin((current) => current.slice(0, -1));
        return;
      }
      if (event.key === "Enter") {
        setPin((current) => {
          window.setTimeout(() => submitRef.current(current), 0);
          return current;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const bday = parseDate(settings.birthdayB);
  const hint = `${String(bday.getDate()).padStart(2, "0")}${String(bday.getMonth() + 1).padStart(2, "0")}`;

  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {Array.from({ length: 14 }, (_, i) => (
          <span
            key={i}
            className="css-heart absolute"
            style={{
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${i * 0.35}s`,
              opacity: 0.35 + (i % 4) * 0.12,
            }}
          />
        ))}
      </div>
      {burst > 0 ? <Fireworks burst={burst} /> : null}
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-5 py-4">
        <div className="paper w-full max-w-56 -rotate-1 rounded-sm px-3 pt-3 pb-3 shadow-2xl">
          <div className="grid h-28 place-items-center overflow-hidden rounded-sm bg-surface">
            {settings.avatarA || settings.avatarB ? (
              <div className="flex h-full w-full">
                {[settings.avatarA, settings.avatarB].map((src, i) =>
                  src ? (
                    <img key={i} src={src} alt="" className="h-full w-1/2 object-cover" />
                  ) : (
                    <div key={i} className="grid h-full w-1/2 place-items-center font-display text-3xl text-gold">
                      {(i === 0 ? settings.nameA : settings.nameB).slice(0, 1)}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="text-center">
                <Heart className="mx-auto size-8 text-primary" />
                <p className="mt-2 font-display text-2xl text-fg">
                  {settings.nameA.slice(0, 1)} · {settings.nameB.slice(0, 1)}
                </p>
              </div>
            )}
          </div>
          <p className="mt-3 text-center font-display text-xl text-ink">
            {settings.nickA} & {settings.nickB}
          </p>
        </div>
        <div className={shake ? "animate-shake w-full" : "w-full"}>
          <p className="text-center text-sm text-muted">Nhập mật khẩu để mở trạm</p>
          <p className="mt-2 text-center font-display text-3xl tracking-widest text-fg tabular-nums">{pin.replace(/./g, "●") || "····"}</p>
          {error ? <p className="mt-1 text-center text-sm text-primary">{error}</p> : null}
          <div className="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map((key) => (
              <button
                key={key}
                type="button"
                className="grid h-12 place-items-center rounded-2xl border border-line bg-surface text-lg text-fg"
                onClick={() => {
                  if (key === "del") setPin((p) => p.slice(0, -1));
                  else if (key === "ok") submit(pin);
                  else setPin((p) => (p + key).slice(0, 12));
                }}
              >
                {key === "del" ? <Delete className="size-5" /> : key === "ok" ? "Mở" : key}
              </button>
            ))}
          </div>
        </div>
        <button type="button" className="text-sm text-gold" onClick={() => setHelp((v) => !v)}>
          Quên mật khẩu?
        </button>
        {help ? (
          <Panel className="w-full">
            <p className="text-sm text-muted">
              Mật khẩu mặc định là ngày sinh bạn nữ dạng DDMM (đang là {hint}). Nếu đã đổi, nhập đúng hai ngày sinh để mở.
            </p>
            <div className="mt-3 grid gap-2">
              <input className={fieldClass} placeholder="Sinh nhật Dương dd/mm/yyyy" value={recA} onChange={(e) => setRecA(e.target.value)} />
              <input className={fieldClass} placeholder="Sinh nhật Dung dd/mm/yyyy" value={recB} onChange={(e) => setRecB(e.target.value)} />
              <Btn
                onClick={() => {
                  const a = formatVN(parseDate(settings.birthdayA));
                  const b = formatVN(parseDate(settings.birthdayB));
                  if (recA.trim() === a && recB.trim() === b) onUnlock();
                  else setError("Ngày sinh chưa khớp dữ liệu đang lưu.");
                }}
              >
                Khôi phục
              </Btn>
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

export function ClockModule() {
  const settings = useLoveStore((s) => s.settings);
  const now = useNow();
  const start = parseDate(settings.startDate);
  const parts = splitDuration(togetherMs(start, now));
  const marks = milestones(start, now);
  const birthdays = [
    { label: settings.nickA, date: parseDate(settings.birthdayA) },
    { label: settings.nickB, date: parseDate(settings.birthdayB) },
  ].map((b) => {
    const next = nextAnnual(b.date, now);
    return { ...b, next, left: daysBetween(now, next) };
  });
  return (
    <ModuleFrame id="clock">
      <Panel className="text-center">
        <p className="text-sm text-muted">Bên nhau từ {formatVN(start)}</p>
        <p className="mt-2 font-display text-5xl text-fg tabular-nums md:text-7xl">{parts.days}</p>
        <p className="text-gold">ngày</p>
        <p className="mt-3 text-2xl text-fg tabular-nums">
          {formatClock({ ...parts, days: 0 }).replace("0 ngày ", "")}
        </p>
      </Panel>
      <div className="grid gap-3 md:grid-cols-2">
        {birthdays.map((b) => (
          <Panel key={b.label}>
            <p className="text-sm text-muted">Sinh nhật {b.label}</p>
            <p className="font-display text-2xl text-fg">{formatVN(b.next)}</p>
            <p className="text-primary">{b.left === 0 ? "Hôm nay là ngày đặc biệt" : relativeLabel(b.left)}</p>
          </Panel>
        ))}
      </div>
      <div className="grid gap-3">
        {marks.map((m) => (
          <div key={m.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{m.label}</span>
              <span className="text-muted">{m.done ? "Đã tới" : `còn ${m.left} ngày`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div className="h-full bg-primary" style={{ width: `${m.done ? 100 : Math.max(4, 100 - (m.left / m.days) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ModuleFrame>
  );
}

export function TodayModule() {
  const today = useLoveStore((s) => s.today);
  const setToday = useLoveStore((s) => s.setToday);
  const [draft, setDraft] = useState(today);
  useEffect(() => setDraft(today), [today]);
  return (
    <ModuleFrame id="today">
      <Panel>
        <div className="grid gap-3">
          <Field label="Muốn ăn">
            <input className={fieldClass} value={draft.food} onChange={(e) => setDraft({ ...draft, food: e.target.value })} />
          </Field>
          <Field label="Muốn mua">
            <input className={fieldClass} value={draft.buy} onChange={(e) => setDraft({ ...draft, buy: e.target.value })} />
          </Field>
          <Field label="Đang ở / muốn đến">
            <input className={fieldClass} value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} />
          </Field>
          <Field label="Ghi chú">
            <textarea className={fieldClass} rows={3} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setDraft({ ...draft, mood: m.id })}
              className={draft.mood === m.id ? "min-h-11 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 rounded-full border border-line px-4 text-sm text-fg"}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Btn onClick={() => setToday(draft)}>Lưu và báo máy kia</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function PingsModule() {
  const pings = useLoveStore((s) => s.pings);
  const settings = useLoveStore((s) => s.settings);
  const sendPing = useLoveStore((s) => s.sendPing);
  const [text, setText] = useState("");
  const [pop, setPop] = useState(0);
  return (
    <ModuleFrame id="pings">
      <Panel>
        <div className="flex gap-2">
          <input
            className={fieldClass}
            value={text}
            placeholder="Một câu ngắn…"
            maxLength={80}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendPing(text);
                setText("");
                setPop((n) => n + 1);
              }
            }}
          />
          <Btn
            onClick={() => {
              sendPing(text);
              setText("");
              setPop((n) => n + 1);
            }}
          >
            Gửi
          </Btn>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_PINGS.map((q) => (
            <button key={q} type="button" className="min-h-11 rounded-full border border-line px-3 text-sm" onClick={() => { sendPing(q); setPop((n) => n + 1); }}>
              {q}
            </button>
          ))}
        </div>
        <div className="relative mt-4 min-h-8">
          {pop > 0 ? (
            <Heart key={pop} className="heart-pop absolute right-4 size-6 text-primary" />
          ) : null}
        </div>
        <ul className="mt-2 flex flex-col gap-2">
          {pings.map((p) => (
            <li key={p.id} className={p.from === settings.me ? "ml-8 rounded-2xl bg-primary px-3 py-2 text-sm text-primary-fg" : "mr-8 rounded-2xl bg-bg px-3 py-2 text-sm"}>
              <p>{p.text}</p>
              <p className="mt-1 text-xs opacity-80">{nickOf(settings, p.from)} · {new Date(p.at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </ModuleFrame>
  );
}

export function LettersModule() {
  const letters = useLoveStore((s) => s.letters);
  const settings = useLoveStore((s) => s.settings);
  const addLetter = useLoveStore((s) => s.addLetter);
  const updateLetter = useLoveStore((s) => s.updateLetter);
  const deleteLetter = useLoveStore((s) => s.deleteLetter);
  const [openId, setOpenId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const open = letters.find((l) => l.id === openId) ?? null;
  const typed = useTypewriter(open?.body ?? "", Boolean(open && !open.sealed));
  return (
    <ModuleFrame id="letters">
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tiêu đề thư" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={fieldClass} rows={4} placeholder="Viết điều muốn cất…" value={body} onChange={(e) => setBody(e.target.value)} />
          <Btn onClick={() => { addLetter(title, body); setTitle(""); setBody(""); }}>Niêm thư mới</Btn>
        </div>
      </Panel>
      <div className="grid gap-3">
        {letters.map((letter) => (
          <article key={letter.id} className="paper rounded-3xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl">{letter.title}</h2>
                <p className="text-xs opacity-70">{nickOf(settings, letter.from)} · {formatVN(new Date(letter.createdAt))}</p>
              </div>
              <button
                type="button"
                className="grid size-16 place-items-center rounded-full bg-primary text-xs font-medium text-primary-fg"
                onClick={() => {
                  updateLetter(letter.id, { sealed: false });
                  setOpenId(letter.id);
                }}
              >
                {letter.sealed ? "Mở sáp" : "Đọc"}
              </button>
            </div>
            {openId === letter.id && !letter.sealed ? (
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{typed}</p>
            ) : null}
            <button type="button" className="mt-3 text-xs underline" onClick={() => deleteLetter(letter.id)}>
              Xóa thư
            </button>
          </article>
        ))}
      </div>
    </ModuleFrame>
  );
}

export function AlbumModule() {
  const photos = useLoveStore((s) => s.photos);
  const albumSeeded = useLoveStore((s) => s.albumSeeded);
  const addPhoto = useLoveStore((s) => s.addPhoto);
  const updatePhoto = useLoveStore((s) => s.updatePhoto);
  const deletePhoto = useLoveStore((s) => s.deletePhoto);
  const seedPhotos = useLoveStore((s) => s.seedPhotos);
  const [mode, setMode] = useState<"grid" | "show">("grid");
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (albumSeeded) return;
    const made = [0, 1, 2].map((kind) => ({
      id: `sample-${kind}`,
      dataUrl: paintPoster(kind),
      caption: ["Ngày đầu", "Đêm mưa", "Mốc 27.06"][kind] ?? "Kỷ niệm",
      date: "2026-06-27",
      sample: true,
    }));
    seedPhotos(made);
  }, [albumSeeded, seedPhotos]);
  useEffect(() => {
    if (mode !== "show" || photos.length === 0) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), 2800);
    return () => window.clearInterval(id);
  }, [mode, photos.length]);
  const current = photos[index % Math.max(photos.length, 1)];
  const today = useMemo(() => toISODate(new Date()), []);
  return (
    <ModuleFrame id="album">
      <div className="flex flex-wrap gap-2">
        <PhotoPick label="Thêm ảnh" multiple onPick={(urls) => urls.forEach((url) => addPhoto(url, "", today))} />
        <Btn variant="line" onClick={() => setMode(mode === "grid" ? "show" : "grid")}>
          {mode === "grid" ? "Trình chiếu" : "Xem lưới"}
        </Btn>
      </div>
      {photos.length === 0 ? <Empty text="Chưa có ảnh. Hãy tải một tấm từ máy." /> : null}
      {mode === "show" && current ? (
        <Panel>
          <div className="overflow-hidden rounded-2xl [perspective:800px]">
            <img src={current.dataUrl} alt={current.caption} className="mx-auto max-h-[28rem] w-full object-contain transition duration-700 [transform:rotateY(8deg)]" />
          </div>
          <p className="mt-3 text-center font-display text-2xl">{current.caption || "Không chú thích"}</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-2xl border border-line bg-surface">
              <img src={photo.dataUrl} alt={photo.caption} className="aspect-[4/5] w-full object-cover" />
              <figcaption className="space-y-2 p-2">
                {photo.sample ? <p className="text-xs text-gold">Ảnh mẫu</p> : null}
                <input className={fieldClass} value={photo.caption} onChange={(e) => updatePhoto(photo.id, { caption: e.target.value })} />
                <input className={fieldClass} type="date" value={photo.date} onChange={(e) => updatePhoto(photo.id, { date: e.target.value })} />
                <button type="button" className="text-xs text-primary" onClick={() => deletePhoto(photo.id)}>Xóa</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </ModuleFrame>
  );
}
