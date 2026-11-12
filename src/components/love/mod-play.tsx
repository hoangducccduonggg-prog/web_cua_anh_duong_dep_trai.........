import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { MELODIES, playChime, playHeartbeat, playKiss, playMeow, playMelody, playPop, playSparkle, setMasterVolume, type MelodyHandle } from "@/lib/love/audio";
import { paintSymbol } from "@/lib/love/art";
import { useLoveStore } from "@/lib/love/store";
import type { MovieStatus } from "@/lib/love/types";
import { Btn, Empty, ModuleFrame, Panel, fieldClass } from "./ui";

export function VinylModule() {
  const tracks = useLoveStore((s) => s.tracks);
  const addTrack = useLoveStore((s) => s.addTrack);
  const deleteTrack = useLoveStore((s) => s.deleteTrack);
  const volume = useLoveStore((s) => s.volume);
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState("Chạm đĩa để mở nhạc.");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [pick, setPick] = useState(MELODIES[0]?.id ?? "box");
  const handle = useRef<MelodyHandle | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const melody = MELODIES.find((m) => m.id === pick) ?? MELODIES[0];

  const stop = () => {
    handle.current?.stop();
    handle.current = null;
    audioRef.current?.pause();
    setPlaying(false);
  };

  useEffect(() => () => stop(), []);

  return (
    <ModuleFrame id="vinyl">
      <Panel className="text-center">
        <button
          type="button"
          className="mx-auto grid size-52 place-items-center rounded-full border-8 border-gold bg-ink text-fg"
          onClick={() => {
            if (playing) {
              stop();
              setLine("Đĩa đã dừng.");
              return;
            }
            if (!melody) return;
            setMasterVolume(volume);
            setPlaying(true);
            handle.current = playMelody(melody, setLine, () => setPlaying(false));
          }}
        >
          <span className={playing ? "spin-disc grid size-44 place-items-center rounded-full border border-line bg-surface" : "grid size-44 place-items-center rounded-full border border-line bg-surface"}>
            <span className="grid size-10 place-items-center rounded-full bg-primary text-xs text-primary-fg">{playing ? "Dừng" : "Mở"}</span>
          </span>
        </button>
        <h2 className="mt-4 font-display text-2xl">{melody?.title}</h2>
        <p className="text-sm text-gold">{line}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {MELODIES.map((item) => (
            <button key={item.id} type="button" className="min-h-11 rounded-full border border-line px-3 text-sm" onClick={() => { stop(); setPick(item.id); }}>
              {item.title}
            </button>
          ))}
        </div>
      </Panel>
      <ul className="flex flex-col gap-2">
        {tracks.map((track) => (
          <li key={track.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line bg-surface px-3 py-2 text-sm">
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => {
                stop();
                const audio = audioRef.current ?? new Audio();
                audioRef.current = audio;
                audio.src = track.url;
                void audio.play().then(() => {
                  setPlaying(true);
                  setLine(track.title);
                }).catch(() => setLine("Link này không phát được trên trình duyệt."));
              }}
            >
              <span className="block font-medium">{track.title}</span>
              <span className="text-xs text-muted">{track.artist}</span>
            </button>
            <button type="button" className="text-xs text-primary" onClick={() => deleteTrack(track.id)}>Xóa</button>
          </li>
        ))}
      </ul>
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tên bài" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className={fieldClass} placeholder="Người hát" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <input className={fieldClass} placeholder="Link file nhạc (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Btn onClick={() => { addTrack(title, artist, url); setTitle(""); setArtist(""); setUrl(""); }}>Thêm vào đĩa</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function MoviesModule() {
  const movies = useLoveStore((s) => s.movies);
  const addMovie = useLoveStore((s) => s.addMovie);
  const patchMovie = useLoveStore((s) => s.patchMovie);
  const deleteMovie = useLoveStore((s) => s.deleteMovie);
  const [title, setTitle] = useState("");
  const [picked, setPicked] = useState("");
  const statuses: { id: MovieStatus; label: string }[] = [
    { id: "want", label: "Muốn xem" },
    { id: "watching", label: "Đang xem" },
    { id: "done", label: "Xong" },
  ];
  return (
    <ModuleFrame id="movies">
      <div className="flex gap-2">
        <input className={fieldClass} placeholder="Thêm phim" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Btn onClick={() => { addMovie(title); setTitle(""); }}>Thêm</Btn>
      </div>
      <Btn
        variant="gold"
        onClick={() => {
          const pool = movies.filter((m) => m.status !== "done");
          const choice = pool[Math.floor(Math.random() * pool.length)];
          setPicked(choice ? choice.title : "Hết phim trong danh sách muốn xem.");
        }}
      >
        Rút ngẫu nhiên
      </Btn>
      {picked ? <p className="font-display text-2xl text-gold">{picked}</p> : null}
      <ul className="flex flex-col gap-3">
        {movies.map((movie) => (
          <li key={movie.id} className="rounded-3xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-xl">{movie.title}</h2>
              <button type="button" className="text-xs text-primary" onClick={() => deleteMovie(movie.id)}>Xóa</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button key={status.id} type="button" className={movie.status === status.id ? "min-h-11 rounded-full bg-primary px-3 text-sm text-primary-fg" : "min-h-11 rounded-full border border-line px-3 text-sm"} onClick={() => patchMovie(movie.id, { status: status.id })}>
                  {status.label}
                </button>
              ))}
            </div>
            <label className="mt-2 block text-xs text-muted">
              Điểm {movie.score}/10
              <input className="mt-1 w-full accent-primary" type="range" min={0} max={10} value={movie.score} onChange={(e) => patchMovie(movie.id, { score: Number(e.target.value) })} />
            </label>
            <input className={`${fieldClass} mt-2`} value={movie.note} placeholder="Ghi chú sau buổi xem" onChange={(e) => patchMovie(movie.id, { note: e.target.value })} />
          </li>
        ))}
      </ul>
    </ModuleFrame>
  );
}

const INK = ["--color-primary", "--color-gold", "--color-fg", "--color-muted"] as const;

export function DrawModule() {
  const drawings = useLoveStore((s) => s.drawings);
  const addDrawing = useLoveStore((s) => s.addDrawing);
  const deleteDrawing = useLoveStore((s) => s.deleteDrawing);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState<(typeof INK)[number]>("--color-primary");
  const [size, setSize] = useState(4);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-bg") || "#140e10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  return (
    <ModuleFrame id="draw">
      <Panel>
        <canvas
          ref={canvasRef}
          width={900}
          height={1100}
          className="aspect-[9/11] w-full touch-none rounded-2xl bg-bg"
          onPointerDown={(event) => {
            drawing.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            const p = point(event);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }}
          onPointerMove={(event) => {
            if (!drawing.current) return;
            const ctx = canvasRef.current?.getContext("2d");
            if (!ctx) return;
            const p = point(event);
            const ink = getComputedStyle(document.documentElement).getPropertyValue(color).trim() || "#e07a86";
            ctx.strokeStyle = ink;
            ctx.lineWidth = size * 2;
            ctx.lineCap = "round";
            ctx.shadowColor = ink;
            ctx.shadowBlur = 12;
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            drawing.current = false;
          }}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {INK.map((token) => (
            <button key={token} type="button" className={color === token ? "size-11 rounded-full border-2 border-fg" : "size-11 rounded-full border border-line"} style={{ background: `var(${token})` }} onClick={() => setColor(token)} aria-label="Màu nét" />
          ))}
          <input type="range" min={2} max={16} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          <Btn
            variant="line"
            onClick={() => {
              const canvas = canvasRef.current;
              const ctx = canvas?.getContext("2d");
              if (!canvas || !ctx) return;
              ctx.shadowBlur = 0;
              ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-bg") || "#140e10";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }}
          >
            Xóa bảng
          </Btn>
          <Btn onClick={() => { const url = canvasRef.current?.toDataURL("image/jpeg", 0.85); if (url) addDrawing(url); }}>Lưu tranh</Btn>
        </div>
      </Panel>
      {drawings.length === 0 ? <Empty text="Tranh đã lưu sẽ nằm ở đây." /> : null}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {drawings.map((item) => (
          <figure key={item.id} className="overflow-hidden rounded-2xl border border-line">
            <img src={item.dataUrl} alt="Tranh đã vẽ" className="aspect-[4/5] w-full object-cover" />
            <button type="button" className="w-full py-2 text-xs text-primary" onClick={() => deleteDrawing(item.id)}>Xóa</button>
          </figure>
        ))}
      </div>
    </ModuleFrame>
  );
}

type Card = { uid: string; face: string; image: boolean };

export function PuzzleModule() {
  const photos = useLoveStore((s) => s.photos);
  const best = useLoveStore((s) => s.puzzleBestMs);
  const setPuzzleBest = useLoveStore((s) => s.setPuzzleBest);
  const [deck, setDeck] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [started, setStarted] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [lock, setLock] = useState(false);

  const build = () => {
    const images = photos.slice(0, 8).map((p) => p.dataUrl);
    while (images.length < 8) images.push(paintSymbol(images.length));
    const faces = images.slice(0, 8);
    const cards = faces.flatMap((face, i) => [
      { uid: `a${i}-${Math.random()}`, face, image: face.startsWith("data:") },
      { uid: `b${i}-${Math.random()}`, face, image: face.startsWith("data:") },
    ]);
    for (let i = cards.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j]!, cards[i]!];
    }
    setDeck(cards);
    setOpen([]);
    setMatched([]);
    setStarted(Date.now());
    setElapsed(0);
  };

  useEffect(() => {
    if (!started || matched.length >= 8) return;
    const id = window.setInterval(() => setElapsed(Date.now() - started), 200);
    return () => window.clearInterval(id);
  }, [started, matched.length]);

  useEffect(() => {
    if (matched.length === 8 && started) setPuzzleBest(Date.now() - started);
  }, [matched.length, started, setPuzzleBest]);

  const flip = (index: number) => {
    if (lock || open.includes(index) || matched.includes(deck[index]?.face ?? "")) return;
    const next = [...open, index];
    setOpen(next);
    if (next.length === 2) {
      const [i, j] = next;
      setLock(true);
      window.setTimeout(() => {
        if (deck[i!]?.face && deck[i!]?.face === deck[j!]?.face) setMatched((m) => [...m, deck[i!]!.face]);
        setOpen([]);
        setLock(false);
      }, 650);
    }
  };

  return (
    <ModuleFrame id="puzzle">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Btn onClick={build}>Chia bài mới</Btn>
        <span className="tabular-nums">Giờ: {(elapsed / 1000).toFixed(1)}s</span>
        <span className="text-muted">{best ? `Kỷ lục ${(best / 1000).toFixed(1)}s` : "Chưa có kỷ lục"}</span>
      </div>
      {deck.length === 0 ? <Empty text="Bấm chia bài. Nếu album có ảnh, thẻ sẽ dùng chính những ảnh ấy." /> : null}
      <div className="grid grid-cols-4 gap-2">
        {deck.map((card, index) => {
          const shown = open.includes(index) || matched.includes(card.face);
          return (
            <button key={card.uid} type="button" className="aspect-square overflow-hidden rounded-xl border border-line bg-surface" onClick={() => flip(index)}>
              {shown ? <img src={card.face} alt="" className="h-full w-full object-cover" /> : <span className="font-display text-primary">?</span>}
            </button>
          );
        })}
      </div>
      {matched.length === 8 && deck.length > 0 ? <p className="font-display text-2xl text-gold">Xong cả bàn. Kỷ niệm nằm đúng chỗ.</p> : null}
    </ModuleFrame>
  );
}

export function WheelModule() {
  const wheel = useLoveStore((s) => s.wheel);
  const addWheel = useLoveStore((s) => s.addWheel);
  const deleteWheel = useLoveStore((s) => s.deleteWheel);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState("");
  const [label, setLabel] = useState("");
  const base = useRef(0);
  const slice = wheel.length ? 360 / wheel.length : 360;
  const gradient = useMemo(() => {
    if (!wheel.length) return "var(--color-surface)";
    return `conic-gradient(${wheel
      .map((_, i) => {
        const color = i % 2 === 0 ? "var(--color-primary)" : "var(--color-gold)";
        return `${color} ${i * slice}deg ${(i + 1) * slice}deg`;
      })
      .join(",")})`;
  }, [wheel, slice]);

  return (
    <ModuleFrame id="wheel">
      <div className="relative mx-auto h-72 w-72 max-w-full">
        <div className="absolute left-1/2 top-0 z-10 h-4 w-4 -translate-x-1/2 rotate-45 bg-fg" />
        <div
          className="absolute inset-4 rounded-full border border-line ease-out"
          style={{ background: gradient, transform: `rotate(${angle}deg)`, transition: "transform 4.2s ease-out" }}
        >
          {wheel.map((item, i) => (
            <span
              key={item.id}
              className="absolute left-1/2 top-1/2 w-24 origin-left text-left text-xs text-ink"
              style={{ transform: `rotate(${(i + 0.5) * slice}deg) translateX(3.2rem)` }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
      <div className="text-center">
        <Btn
          disabled={spinning || wheel.length < 2}
          onClick={() => {
            const index = Math.floor(Math.random() * wheel.length);
            const center = (index + 0.5) * slice;
            const want = (360 - center) % 360;
            const current = base.current % 360;
            let add = (want - current + 360) % 360;
            if (add < 15) add += 360;
            const next = base.current + 360 * 5 + add;
            base.current = next;
            setSpinning(true);
            setAngle(next);
            window.setTimeout(() => {
              setSpinning(false);
              setResult(wheel[index]?.label ?? "");
            }, 4300);
          }}
        >
          Quay
        </Btn>
        {result ? <p className="mt-3 font-display text-3xl">{result}</p> : null}
      </div>
      <Panel>
        <div className="flex gap-2">
          <input className={fieldClass} value={label} placeholder="Thêm lựa chọn" onChange={(e) => setLabel(e.target.value)} />
          <Btn onClick={() => { addWheel(label); setLabel(""); }}>Thêm</Btn>
        </div>
        <ul className="mt-3 flex flex-col gap-1">
          {wheel.map((item) => (
            <li key={item.id} className="flex justify-between text-sm">
              <span>{item.label}</span>
              <button type="button" className="text-xs text-primary" onClick={() => deleteWheel(item.id)}>Xóa</button>
            </li>
          ))}
        </ul>
      </Panel>
    </ModuleFrame>
  );
}

export function SoundsModule() {
  const volume = useLoveStore((s) => s.volume);
  const setVolume = useLoveStore((s) => s.setVolume);
  const pads = [
    { label: "Tim đập", play: playHeartbeat },
    { label: "Hôn gió", play: playKiss },
    { label: "Mèo kêu", play: playMeow },
    { label: "Hộp nhạc", play: playChime },
    { label: "Lấp lánh", play: playSparkle },
    { label: "Pop", play: playPop },
  ];
  return (
    <ModuleFrame id="sounds">
      <Panel>
        <label className="text-sm text-muted">
          Độ lớn {Math.round(volume * 100)}%
          <input
            className="mt-2 w-full accent-primary"
            type="range"
            min={0}
            max={100}
            value={Math.round(volume * 100)}
            onChange={(e) => {
              const next = Number(e.target.value) / 100;
              setVolume(next);
              setMasterVolume(next);
            }}
          />
        </label>
      </Panel>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {pads.map((pad) => (
          <button
            key={pad.label}
            type="button"
            className="min-h-24 rounded-3xl border border-line bg-surface font-display text-xl text-fg"
            onClick={() => {
              setMasterVolume(volume);
              pad.play();
            }}
          >
            {pad.label}
          </button>
        ))}
      </div>
    </ModuleFrame>
  );
}
