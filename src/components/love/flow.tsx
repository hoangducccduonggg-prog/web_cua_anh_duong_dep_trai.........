import { Bell, Flame, Mail, NotebookPen } from "lucide-react";
import { formatVN, parseDate } from "@/lib/love/dates";
import { JOURNAL_MOODS, nickOf } from "@/lib/love/seed";
import { useLoveStore } from "@/lib/love/store";

export function Flow() {
  const settings = useLoveStore((s) => s.settings);
  const today = useLoveStore((s) => s.today);
  const pings = useLoveStore((s) => s.pings);
  const letters = useLoveStore((s) => s.letters);
  const journal = useLoveStore((s) => s.journal);
  const lanterns = useLoveStore((s) => s.lanterns);
  const latestLetter = letters[0];
  const latestNote = journal[0];
  const latestWish = lanterns[0];

  return (
    <section className="grid gap-3 md:grid-cols-2">
      <article className="rounded-3xl border border-line bg-surface p-4">
        <div className="flex items-center gap-2 text-gold">
          <Bell className="size-4" aria-hidden />
          <h2 className="text-sm">Trạm hôm nay</h2>
        </div>
        <p className="mt-2 font-display text-2xl text-fg">{today.mood || "Chưa chọn tâm trạng"}</p>
        <ul className="mt-2 space-y-1 text-sm text-muted">
          {today.food ? <li>Muốn ăn: {today.food}</li> : null}
          {today.buy ? <li>Muốn mua: {today.buy}</li> : null}
          {today.place ? <li>Chỗ: {today.place}</li> : null}
          {today.note ? <li>{today.note}</li> : null}
        </ul>
        <p className="mt-2 text-xs text-gold">Cập nhật bởi {nickOf(settings, today.by)}</p>
      </article>
      <article className="rounded-3xl border border-line bg-surface p-4">
        <h2 className="text-sm text-gold">Nhắn gần đây</h2>
        <ul className="mt-2 flex flex-col gap-2">
          {pings.slice(0, 3).map((ping) => (
            <li key={ping.id} className="text-sm">
              <span className="text-muted">{nickOf(settings, ping.from)}: </span>
              {ping.text}
            </li>
          ))}
          {pings.length === 0 ? <li className="text-sm text-muted">Chưa có câu nào.</li> : null}
        </ul>
      </article>
      {latestLetter ? (
        <article className="rounded-3xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-gold">
            <Mail className="size-4" aria-hidden />
            <h2 className="text-sm">Thư mới cất</h2>
          </div>
          <p className="mt-2 font-display text-xl">{latestLetter.title}</p>
          <p className="text-xs text-muted">
            {nickOf(settings, latestLetter.from)} · {formatVN(new Date(latestLetter.createdAt))}
          </p>
        </article>
      ) : null}
      {latestNote ? (
        <article className="rounded-3xl border border-line bg-surface p-4">
          <div className="flex items-center gap-2 text-gold">
            <NotebookPen className="size-4" aria-hidden />
            <h2 className="text-sm">Nhật ký</h2>
          </div>
          <p className="mt-2 text-sm leading-6">{latestNote.text}</p>
          <p className="mt-1 text-xs text-muted">
            {formatVN(parseDate(latestNote.date))} · {JOURNAL_MOODS.find((mood) => mood.id === latestNote.mood)?.label}
          </p>
        </article>
      ) : null}
      {latestWish ? (
        <article className="rounded-3xl border border-line bg-surface p-4 md:col-span-2">
          <div className="flex items-center gap-2 text-gold">
            <Flame className="size-4" aria-hidden />
            <h2 className="text-sm">Đèn ước vừa thả</h2>
          </div>
          <p className="mt-2 font-display text-2xl text-fg">{latestWish.wish}</p>
        </article>
      ) : null}
    </section>
  );
}
