import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { Bar, Btn, Empty, Field, ModuleFrame, Panel, fieldClass } from "./ui";
import { CITY_POS, JOURNAL_MOODS, nickOf } from "@/lib/love/seed";
import { useLoveStore } from "@/lib/love/store";
import {
  daysBetween,
  formatVN,
  monthAnniversary,
  nextAnnual,
  parseDate,
  petLevel,
  relativeLabel,
  toISODate,
  weekdayVN,
} from "@/lib/love/dates";
import type { Mood, PetKind } from "@/lib/love/types";

export function PetModule() {
  const pet = useLoveStore((s) => s.pet);
  const renamePet = useLoveStore((s) => s.renamePet);
  const setPetKind = useLoveStore((s) => s.setPetKind);
  const feedPet = useLoveStore((s) => s.feedPet);
  const washPet = useLoveStore((s) => s.washPet);
  const playPet = useLoveStore((s) => s.playPet);
  const cycleAccessory = useLoveStore((s) => s.cycleAccessory);
  const level = petLevel(pet.xp);
  const face = pet.joy > 60 ? "◕ ◕" : pet.joy > 30 ? "• •" : "– –";
  const hat = ["", "nơ", "vương miện", "hoa"][pet.accessory] ?? "";
  return (
    <ModuleFrame id="pet">
      <Panel className="text-center">
        <p className="text-xs text-gold">{hat ? `Đang đội ${hat}` : "Chưa đội gì"}</p>
        <div className="float-y mx-auto mt-3 grid h-40 w-40 place-items-center rounded-full bg-primary text-primary-fg">
          <div>
            <p className="font-display text-3xl">{face}</p>
            <p className="text-sm">{pet.kind === "cat" ? "Mèo" : pet.kind === "dog" ? "Cún" : "Thỏ"}</p>
          </div>
        </div>
        <h2 className="mt-3 font-display text-3xl">{pet.name}</h2>
        <p className="text-sm text-muted">Cấp {level}</p>
        <div className="mx-auto mt-4 grid max-w-sm gap-3 text-left">
          <Bar value={pet.hunger} label="No" />
          <Bar value={pet.joy} label="Vui" />
          <Bar value={pet.clean} label="Sạch" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Btn onClick={feedPet}>Cho ăn</Btn>
          <Btn variant="line" onClick={washPet}>Tắm</Btn>
          <Btn variant="gold" onClick={playPet}>Chơi</Btn>
          <Btn variant="ghost" onClick={cycleAccessory}>Đổi phụ kiện</Btn>
        </div>
      </Panel>
      <Panel>
        <Field label="Tên bé">
          <input className={fieldClass} value={pet.name} onChange={(e) => renamePet(e.target.value)} />
        </Field>
        <div className="mt-3 flex gap-2">
          {(["cat", "dog", "rabbit"] as PetKind[]).map((kind) => (
            <button key={kind} type="button" className={pet.kind === kind ? "min-h-11 flex-1 rounded-full bg-primary text-sm text-primary-fg" : "min-h-11 flex-1 rounded-full border border-line text-sm"} onClick={() => setPetKind(kind)}>
              {kind === "cat" ? "Mèo" : kind === "dog" ? "Cún" : "Thỏ"}
            </button>
          ))}
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function JournalModule() {
  const journal = useLoveStore((s) => s.journal);
  const settings = useLoveStore((s) => s.settings);
  const addJournal = useLoveStore((s) => s.addJournal);
  const deleteJournal = useLoveStore((s) => s.deleteJournal);
  const [date, setDate] = useState(toISODate(new Date()));
  const [mood, setMood] = useState<Mood>("vui");
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("");
  const shown = journal.filter((item) => !filter || item.date === filter);
  return (
    <ModuleFrame id="journal">
      <Panel>
        <div className="grid gap-3">
          <Field label="Ngày">
            <input className={fieldClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-2">
            {JOURNAL_MOODS.map((item) => (
              <button key={item.id} type="button" onClick={() => setMood(item.id)} className={mood === item.id ? "min-h-11 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 rounded-full border border-line px-4 text-sm"}>
                {item.label}
              </button>
            ))}
          </div>
          <textarea className={fieldClass} rows={4} placeholder="Hôm nay thế nào?" value={text} onChange={(e) => setText(e.target.value)} />
          <Btn onClick={() => { addJournal({ date, mood, text, author: settings.me }); setText(""); }}>Ghi vào sổ</Btn>
        </div>
      </Panel>
      <div className="flex gap-2 overflow-x-auto">
        <button type="button" className="min-h-11 shrink-0 rounded-full border border-line px-3 text-sm" onClick={() => setFilter("")}>Tất cả</button>
        {[...new Set(journal.map((j) => j.date))].slice(0, 10).map((day) => (
          <button key={day} type="button" className="min-h-11 shrink-0 rounded-full border border-line px-3 text-sm" onClick={() => setFilter(day)}>
            {day.slice(8)}/{day.slice(5, 7)}
          </button>
        ))}
      </div>
      {shown.length === 0 ? <Empty text="Chưa có dòng nào cho ngày này." /> : null}
      <ul className="flex flex-col gap-3">
        {shown.map((item) => (
          <li key={item.id} className="rounded-3xl border border-line bg-surface p-4">
            <p className="text-xs text-gold">{formatVN(parseDate(item.date))} · {JOURNAL_MOODS.find((m) => m.id === item.mood)?.label} · {nickOf(settings, item.author)}</p>
            <p className="mt-2 text-sm leading-6">{item.text}</p>
            <button type="button" className="mt-2 text-xs text-primary" onClick={() => deleteJournal(item.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </ModuleFrame>
  );
}

export function VoucherModule() {
  const vouchers = useLoveStore((s) => s.vouchers);
  const redeemVoucher = useLoveStore((s) => s.redeemVoucher);
  const addVoucher = useLoveStore((s) => s.addVoucher);
  const deleteVoucher = useLoveStore((s) => s.deleteVoucher);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  return (
    <ModuleFrame id="vouchers">
      <div className="grid gap-3 md:grid-cols-2">
        {vouchers.map((card) => (
          <article key={card.id} className="rounded-3xl border border-gold bg-surface p-4">
            <h2 className="font-display text-2xl">{card.title}</h2>
            <p className="mt-1 text-sm text-muted">{card.detail}</p>
            <p className="mt-3 text-sm tabular-nums">Còn {card.stock} · đã dùng {card.used}</p>
            <div className="mt-3 flex gap-2">
              <Btn disabled={card.stock <= 0} onClick={() => redeemVoucher(card.id)}>Dùng thẻ</Btn>
              <Btn variant="ghost" onClick={() => deleteVoucher(card.id)}>Xóa</Btn>
            </div>
          </article>
        ))}
      </div>
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tên thẻ mới" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={fieldClass} placeholder="Quyền lợi" value={detail} onChange={(e) => setDetail(e.target.value)} />
          <Btn onClick={() => { addVoucher(title, detail); setTitle(""); setDetail(""); }}>Cho vào hũ</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function MapModule() {
  const places = useLoveStore((s) => s.places);
  const addPlace = useLoveStore((s) => s.addPlace);
  const patchPlace = useLoveStore((s) => s.patchPlace);
  const deletePlace = useLoveStore((s) => s.deletePlace);
  const [name, setName] = useState("");
  const [city, setCity] = useState("Hà Nội");
  const [note, setNote] = useState("");
  const cities = Object.keys(CITY_POS);
  return (
    <ModuleFrame id="map">
      <Panel className="relative h-80 overflow-hidden bg-bg">
        <div className="absolute top-6 bottom-6 left-1/2 w-px bg-gold/70" />
        {places.map((place) => (
          <button
            key={place.id}
            type="button"
            className="absolute grid min-h-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface px-2 text-xs"
            style={{ left: `${place.x}%`, top: `${place.y}%` }}
            onClick={() => patchPlace(place.id, { visited: !place.visited })}
          >
            {place.visited ? "●" : "○"} {place.city}
          </button>
        ))}
      </Panel>
      <ul className="flex flex-col gap-3">
        {places.map((place) => (
          <li key={place.id} className="rounded-3xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl">{place.name}</h2>
                <p className="text-xs text-gold">{place.city} · {place.visited ? "Đã đi" : "Chưa đi"}</p>
                <p className="mt-1 text-sm text-muted">{place.note}</p>
              </div>
              <button type="button" className="text-xs text-primary" onClick={() => deletePlace(place.id)}>Xóa</button>
            </div>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} sao`} onClick={() => patchPlace(place.id, { rating: n })}>
                  <Star className={n <= place.rating ? "size-5 fill-gold text-gold" : "size-5 text-line"} />
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tên quán, rạp, góc phố" value={name} onChange={(e) => setName(e.target.value)} />
          <select className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)}>
            {cities.map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className={fieldClass} placeholder="Ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
          <Btn
            onClick={() => {
              const pos = CITY_POS[city] ?? { x: 50, y: 50 };
              addPlace({ name, city, note, rating: 0, visited: false, ...pos });
              setName("");
              setNote("");
            }}
          >
            Ghim địa điểm
          </Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function BucketModule() {
  const bucket = useLoveStore((s) => s.bucket);
  const addBucket = useLoveStore((s) => s.addBucket);
  const toggleBucket = useLoveStore((s) => s.toggleBucket);
  const deleteBucket = useLoveStore((s) => s.deleteBucket);
  const [title, setTitle] = useState("");
  const [q, setQ] = useState("");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const done = bucket.filter((item) => item.done).length;
  const shown = bucket.filter((item) => {
    if (onlyOpen && item.done) return false;
    if (q && !item.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return (
    <ModuleFrame id="bucket">
      <Panel>
        <div className="mb-1 flex justify-between text-sm">
          <span>Đã làm {done}/{bucket.length}</span>
          <span className="text-muted">{bucket.length ? Math.round((done / bucket.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-bg">
          <div className="h-full bg-primary" style={{ width: `${bucket.length ? (done / bucket.length) * 100 : 0}%` }} />
        </div>
        <div className="mt-3 flex gap-2">
          <input className={fieldClass} placeholder="Thêm một điều" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Btn onClick={() => { addBucket(title); setTitle(""); }}>Thêm</Btn>
        </div>
        <div className="mt-3 flex gap-2">
          <input className={fieldClass} placeholder="Tìm trong sổ" value={q} onChange={(e) => setQ(e.target.value)} />
          <Btn variant="line" onClick={() => setOnlyOpen((v) => !v)}>{onlyOpen ? "Hiện hết" : "Chưa làm"}</Btn>
        </div>
      </Panel>
      <ul className="flex flex-col gap-2">
        {shown.map((item) => (
          <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-3 py-2">
            <button type="button" className="grid size-11 place-items-center rounded-full border border-line text-sm" onClick={() => toggleBucket(item.id)} aria-pressed={item.done}>
              {item.done ? "✓" : ""}
            </button>
            <div className="min-w-0 flex-1">
              <p className={item.done ? "text-sm text-muted line-through" : "text-sm"}>{item.title}</p>
              {item.doneOn ? <p className="text-xs text-gold">Làm ngày {formatVN(parseDate(item.doneOn))}</p> : null}
            </div>
            <button type="button" className="text-xs text-primary" onClick={() => deleteBucket(item.id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </ModuleFrame>
  );
}

export function CalendarModule() {
  const settings = useLoveStore((s) => s.settings);
  const events = useLoveStore((s) => s.events);
  const addEvent = useLoveStore((s) => s.addEvent);
  const deleteEvent = useLoveStore((s) => s.deleteEvent);
  const [title, setTitle] = useState("");
  const [month, setMonth] = useState(12);
  const [day, setDay] = useState(10);
  const now = new Date();
  const upcoming = useMemo(() => {
    const rows: { id: string; title: string; when: Date; custom?: boolean }[] = [
      { id: "bday-a", title: `Sinh nhật ${settings.nickA}`, when: nextAnnual(parseDate(settings.birthdayA), now) },
      { id: "bday-b", title: `Sinh nhật ${settings.nickB}`, when: nextAnnual(parseDate(settings.birthdayB), now) },
      { id: "month", title: "Kỷ niệm tháng", when: monthAnniversary(parseDate(settings.startDate), now) },
      ...events.map((event) => ({
        id: event.id,
        title: event.title,
        when: nextAnnual(new Date(now.getFullYear(), event.month - 1, event.day), now),
        custom: true,
      })),
    ];
    return rows
      .map((row) => ({ ...row, left: daysBetween(now, row.when) }))
      .sort((a, b) => a.left - b.left);
  }, [settings, events, now]);
  return (
    <ModuleFrame id="calendar">
      <ul className="flex flex-col gap-2">
        {upcoming.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted">{weekdayVN(item.when)} · {formatVN(item.when)}</p>
            </div>
            <div className="text-right">
              <p className={item.left <= 3 ? "text-sm text-primary" : "text-sm text-gold"}>{relativeLabel(item.left)}</p>
              {item.left <= 3 ? <p className="text-xs text-primary">Nhắc trong 3 ngày</p> : null}
              {item.custom ? (
                <button type="button" className="text-xs text-muted" onClick={() => deleteEvent(item.id)}>Xóa</button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <Panel>
        <div className="grid gap-2 md:grid-cols-4">
          <input className={fieldClass} placeholder="Tên dịp" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={fieldClass} type="number" min={1} max={12} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          <input className={fieldClass} type="number" min={1} max={31} value={day} onChange={(e) => setDay(Number(e.target.value))} />
          <Btn onClick={() => { addEvent(title, month, day); setTitle(""); }}>Thêm ngày</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}
