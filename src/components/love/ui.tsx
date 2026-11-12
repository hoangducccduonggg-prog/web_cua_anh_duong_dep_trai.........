import { useEffect, useState, type ReactNode } from "react";
import { metaOf } from "@/lib/love/catalog";
import { compressImage } from "@/lib/love/codec";
import type { ModuleId } from "@/lib/love/types";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "line" | "gold";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  const look = {
    primary: "bg-primary text-primary-fg",
    ghost: "bg-transparent text-fg hover:bg-surface-2",
    line: "border border-line bg-surface text-fg",
    gold: "bg-gold text-ink",
  }[variant];
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition disabled:opacity-40",
        look,
        className,
      )}
    >
      {children}
    </button>
  );
}

export const fieldClass =
  "min-h-11 w-full rounded-2xl border border-line bg-bg px-3 text-sm text-fg outline-none focus:border-primary";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cx("rounded-3xl border border-line bg-surface p-4 md:p-5", className)}>{children}</section>;
}

export function ModuleFrame({ id, children }: { id: ModuleId; children: ReactNode }) {
  const meta = metaOf(id);
  const Icon = meta.icon;
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gold">
            {meta.index} · {meta.groupLabel}
          </p>
          <h1 className="font-display text-3xl text-fg md:text-4xl">{meta.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{meta.blurb}</p>
        </div>
        <Icon className="mt-1 size-6 shrink-0 text-primary" aria-hidden />
      </header>
      {children}
    </section>
  );
}

export function PhotoPick({
  label,
  onPick,
  multiple,
}: {
  label: string;
  onPick: (urls: string[]) => void;
  multiple?: boolean;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface px-4 text-sm text-fg">
      {label}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        className="sr-only"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = "";
          void (async () => {
            const urls: string[] = [];
            for (const file of files.slice(0, 6)) {
              try {
                urls.push(await compressImage(file));
              } catch {
                /* skip unreadable */
              }
            }
            if (urls.length) onPick(urls);
          })();
        }}
      />
    </label>
  );
}

export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export function useTypewriter(text: string, active: boolean): string {
  const [count, setCount] = useState(active ? 0 : Array.from(text).length);
  useEffect(() => {
    const chars = Array.from(text);
    if (!active) {
      setCount(chars.length);
      return;
    }
    setCount(0);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= chars.length) window.clearInterval(id);
    }, 26);
    return () => window.clearInterval(id);
  }, [text, active]);
  return Array.from(text).slice(0, count).join("");
}

export function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">{text}</p>;
}

export function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
