export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map((n) => Number(n));
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  next.setDate(next.getDate() + n);
  return next;
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatVN(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export type Parts = { days: number; hours: number; minutes: number; seconds: number };

export function splitDuration(ms: number): Parts {
  const safe = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(safe / 86_400);
  const hours = Math.floor((safe % 86_400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return { days, hours, minutes, seconds };
}

export function nextAnnual(src: Date, from: Date): Date {
  const y = from.getFullYear();
  let n = new Date(y, src.getMonth(), src.getDate());
  if (startOfDay(n).getTime() < startOfDay(from).getTime()) {
    n = new Date(y + 1, src.getMonth(), src.getDate());
  }
  return n;
}

export function ageOn(birth: Date, on: Date): number | null {
  if (startOfDay(birth).getTime() > startOfDay(on).getTime()) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const before =
    on.getMonth() < birth.getMonth() ||
    (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate());
  if (before) age -= 1;
  return Math.max(0, age);
}

export type Milestone = { label: string; days: number; done: boolean; left: number };

export function milestones(start: Date, now: Date): Milestone[] {
  const elapsed = Math.max(0, daysBetween(start, now));
  const marks: { label: string; days: number }[] = [
    { label: "100 ngày", days: 100 },
    { label: "200 ngày", days: 200 },
    { label: "1 năm", days: 365 },
    { label: "500 ngày", days: 500 },
    { label: "2 năm", days: 730 },
    { label: "1000 ngày", days: 1000 },
  ];
  return marks.map((m) => ({
    ...m,
    done: elapsed >= m.days,
    left: Math.max(0, m.days - elapsed),
  }));
}

export function togetherMs(start: Date, now: Date): number {
  return now.getTime() - startOfDay(start).getTime();
}

export function monthAnniversary(start: Date, from: Date): Date {
  const day = start.getDate();
  const y = from.getFullYear();
  const m = from.getMonth();
  const dim = new Date(y, m + 1, 0).getDate();
  let n = new Date(y, m, Math.min(day, dim));
  if (startOfDay(n).getTime() < startOfDay(from).getTime()) {
    const dim2 = new Date(y, m + 2, 0).getDate();
    n = new Date(y, m + 1, Math.min(day, dim2));
  }
  return n;
}

export function weekdayVN(d: Date): string {
  return ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"][d.getDay()] ?? "";
}

export function monthName(m: number): string {
  return `Tháng ${m + 1}`;
}

export function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function treeLevel(water: number, feed: number): number {
  return Math.min(8, 1 + Math.floor((water + feed * 2) / 3));
}

export function petLevel(xp: number): number {
  return 1 + Math.floor(xp / 40);
}

export function formatClock(parts: Parts): string {
  return `${parts.days} ngày ${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export function relativeLabel(days: number): string {
  if (days === 0) return "Hôm nay";
  if (days === 1) return "Ngày mai";
  if (days < 0) return `${Math.abs(days)} ngày trước`;
  return `Còn ${days} ngày`;
}
