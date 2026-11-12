import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { daysBetween, formatVN, parseDate, splitDuration, togetherMs, toISODate } from "@/lib/love/dates";
import { decrypt, downloadText, readFileText } from "@/lib/love/codec";
import { TAROT_DECK, nickOf } from "@/lib/love/seed";
import { exportPayload, parseImport, useLoveStore } from "@/lib/love/store";
import { Btn, Empty, Field, ModuleFrame, Panel, PhotoPick, fieldClass } from "./ui";

export function VaultModule() {
  const settings = useLoveStore((s) => s.settings);
  const items = useLoveStore((s) => s.vaultItems);
  const open = useLoveStore((s) => s.vaultOpen);
  const setVaultOpen = useLoveStore((s) => s.setVaultOpen);
  const addVaultText = useLoveStore((s) => s.addVaultText);
  const addVaultImage = useLoveStore((s) => s.addVaultImage);
  const deleteVault = useLoveStore((s) => s.deleteVault);
  const setVaultPin = useLoveStore((s) => s.setVaultPin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [nextPin, setNextPin] = useState("");
  if (!open) {
    return (
      <ModuleFrame id="vault">
        <Panel>
          <Field label="Mật khẩu lớp hai">
            <input className={fieldClass} type="password" value={pin} onChange={(e) => setPin(e.target.value)} />
          </Field>
          {error ? <p className="mt-2 text-sm text-primary">{error}</p> : null}
          <div className="mt-3">
            <Btn
              onClick={() => {
                if (pin === settings.vaultPin) {
                  setVaultOpen(true);
                  setError("");
                } else setError("Chưa đúng mật khẩu két.");
              }}
            >
              Mở két
            </Btn>
          </div>
          <p className="mt-3 text-xs text-muted">Mặc định là 2706. Mật khẩu chỉ khóa giao diện trên máy này.</p>
        </Panel>
      </ModuleFrame>
    );
  }
  return (
    <ModuleFrame id="vault">
      <div className="flex gap-2">
        <Btn variant="line" onClick={() => setVaultOpen(false)}>Khóa lại</Btn>
      </div>
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={fieldClass} rows={3} placeholder="Điều chỉ hai đứa biết" value={text} onChange={(e) => setText(e.target.value)} />
          <Btn onClick={() => { addVaultText(title, text); setTitle(""); setText(""); }}>Cất chữ</Btn>
          <PhotoPick label="Cất một ảnh" onPick={(urls) => urls[0] && addVaultImage(title || "Ảnh riêng", urls[0])} />
        </div>
      </Panel>
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const plain = decrypt(item.payload, settings.vaultPin);
          return (
            <li key={item.id} className="rounded-3xl border border-line bg-surface p-4">
              <div className="flex justify-between gap-2">
                <h2 className="font-display text-xl">{item.title}</h2>
                <button type="button" className="text-xs text-primary" onClick={() => deleteVault(item.id)}>Xóa</button>
              </div>
              {item.kind === "image" && plain.startsWith("data:") ? (
                <img src={plain} alt="" className="mt-2 max-h-64 rounded-xl object-contain" />
              ) : (
                <p className="mt-2 whitespace-pre-wrap text-sm">{plain || "Không đọc được mục này."}</p>
              )}
            </li>
          );
        })}
      </ul>
      {items.length === 0 ? <Empty text="Két đang trống." /> : null}
      <Panel>
        <Field label="Đổi mật khẩu két">
          <input className={fieldClass} value={nextPin} onChange={(e) => setNextPin(e.target.value)} />
        </Field>
        <div className="mt-3">
          <Btn variant="gold" onClick={() => { setVaultPin(nextPin); setNextPin(""); }}>Đổi</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function CapsuleModule() {
  const capsules = useLoveStore((s) => s.capsules);
  const addCapsule = useLoveStore((s) => s.addCapsule);
  const deleteCapsule = useLoveStore((s) => s.deleteCapsule);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [openOn, setOpenOn] = useState("2027-06-27");
  const today = toISODate(new Date());
  return (
    <ModuleFrame id="capsule">
      <ul className="flex flex-col gap-3">
        {capsules.map((capsule) => {
          const locked = capsule.openOn > today;
          return (
            <li key={capsule.id} className="paper rounded-3xl p-4">
              <p className="text-xs opacity-70">Mở ngày {formatVN(parseDate(capsule.openOn))}</p>
              <h2 className="font-display text-2xl">{capsule.title}</h2>
              {locked ? (
                <p className="mt-3 text-sm">Niêm đến đúng ngày. Còn {daysBetween(new Date(), parseDate(capsule.openOn))} ngày.</p>
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{capsule.body}</p>
              )}
              <button type="button" className="mt-3 text-xs underline" onClick={() => deleteCapsule(capsule.id)}>Xóa nang</button>
            </li>
          );
        })}
      </ul>
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={fieldClass} rows={4} placeholder="Lời gửi cho tương lai" value={body} onChange={(e) => setBody(e.target.value)} />
          <input className={fieldClass} type="date" value={openOn} onChange={(e) => setOpenOn(e.target.value)} />
          <Btn onClick={() => { addCapsule(title, body, openOn); setTitle(""); setBody(""); }}>Niêm nang</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function TarotModule() {
  const tarot = useLoveStore((s) => s.tarot);
  const log = useLoveStore((s) => s.tarotLog);
  const drawTarot = useLoveStore((s) => s.drawTarot);
  const today = toISODate(new Date());
  const card = TAROT_DECK.find((item) => item.id === tarot?.cardId) ?? null;
  const already = tarot?.date === today;
  return (
    <ModuleFrame id="tarot">
      <Panel className="text-center">
        {card && already ? (
          <>
            <p className="text-xs text-gold">Lá của hôm nay · may mắn {tarot?.luck}</p>
            <h2 className="mt-2 font-display text-4xl">{card.name}</h2>
            <p className="mt-3 text-lg">{card.line}</p>
            <p className="mt-2 text-sm text-muted">{card.advice}</p>
          </>
        ) : (
          <p className="text-sm text-muted">Mỗi ngày một lá. Rút xong là giữ đến hết ngày.</p>
        )}
        <div className="mt-4">
          <Btn
            disabled={already}
            onClick={() => {
              const pick = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
              if (!pick) return;
              drawTarot(pick.id, 60 + Math.floor(Math.random() * 40), today);
            }}
          >
            {already ? "Đã rút hôm nay" : "Rút một lá"}
          </Btn>
        </div>
      </Panel>
      <ul className="flex flex-col gap-2">
        {log.map((item) => {
          const found = TAROT_DECK.find((cardItem) => cardItem.id === item.cardId);
          return (
            <li key={item.date} className="flex justify-between rounded-2xl border border-line bg-surface px-3 py-2 text-sm">
              <span>{formatVN(parseDate(item.date))} · {found?.name}</span>
              <span className="text-gold tabular-nums">{item.luck}</span>
            </li>
          );
        })}
      </ul>
    </ModuleFrame>
  );
}

export function QuizModule() {
  const quiz = useLoveStore((s) => s.quiz);
  const scores = useLoveStore((s) => s.scores);
  const settings = useLoveStore((s) => s.settings);
  const addScore = useLoveStore((s) => s.addScore);
  const addQuiz = useLoveStore((s) => s.addQuiz);
  const patchQuiz = useLoveStore((s) => s.patchQuiz);
  const deleteQuiz = useLoveStore((s) => s.deleteQuiz);
  const [cursor, setCursor] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [answer, setAnswer] = useState(0);
  const question = quiz[cursor];
  return (
    <ModuleFrame id="quiz">
      <Panel>
        <p className="text-sm text-muted">
          {settings.nickA}: {scores.a} điểm · {settings.nickB}: {scores.b} điểm
        </p>
        {question ? (
          <>
            <h2 className="mt-2 font-display text-2xl">{question.prompt}</h2>
            <div className="mt-3 grid gap-2">
              {question.options.map((option, index) => (
                <button
                  key={option}
                  type="button"
                  className="min-h-11 rounded-2xl border border-line px-3 text-left text-sm"
                  onClick={() => {
                    if (picked !== null) return;
                    setPicked(index);
                    if (index === question.answer) {
                      addScore(settings.me, 1);
                      setRound((n) => n + 1);
                    }
                  }}
                >
                  {option}
                  {picked === index ? (index === question.answer ? " · đúng" : " · chưa khớp đáp án đang lưu") : ""}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Btn variant="line" onClick={() => { setCursor((c) => (c + 1) % quiz.length); setPicked(null); }}>Câu tiếp</Btn>
              <span className="self-center text-xs text-muted">Ván này đúng {round}</span>
            </div>
          </>
        ) : (
          <Empty text="Chưa có câu hỏi." />
        )}
      </Panel>
      <Panel>
        <p className="mb-2 text-sm text-muted">Sửa đáp án cho đúng với hai bạn, hoặc thêm câu mới. Điểm chỉ tăng khi chọn đúng đáp án đang lưu.</p>
        {quiz.map((item) => (
          <div key={item.id} className="mb-3 border-b border-line pb-3">
            <input className={fieldClass} value={item.prompt} onChange={(e) => patchQuiz(item.id, { prompt: e.target.value })} />
            <div className="mt-2 flex flex-wrap gap-2">
              {item.options.map((option, index) => (
                <button key={`${item.id}-${index}`} type="button" className={item.answer === index ? "min-h-11 rounded-full bg-primary px-3 text-xs text-primary-fg" : "min-h-11 rounded-full border border-line px-3 text-xs"} onClick={() => patchQuiz(item.id, { answer: index })}>
                  Đáp án {index + 1}: {option}
                </button>
              ))}
              <button type="button" className="text-xs text-primary" onClick={() => deleteQuiz(item.id)}>Xóa câu</button>
            </div>
          </div>
        ))}
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Câu hỏi mới" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          {options.map((option, index) => (
            <input key={index} className={fieldClass} placeholder={`Lựa chọn ${index + 1}`} value={option} onChange={(e) => setOptions(options.map((item, i) => (i === index ? e.target.value : item)))} />
          ))}
          <label className="text-sm text-muted">
            Đáp án đúng
            <select className={fieldClass} value={answer} onChange={(e) => setAnswer(Number(e.target.value))}>
              <option value={0}>1</option>
              <option value={1}>2</option>
              <option value={2}>3</option>
              <option value={3}>4</option>
            </select>
          </label>
          <Btn onClick={() => { addQuiz(prompt, options, answer); setPrompt(""); setOptions(["", "", "", ""]); }}>Thêm câu</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function CertificateModule() {
  const settings = useLoveStore((s) => s.settings);
  const note = useLoveStore((s) => s.certNote);
  const signature = useLoveStore((s) => s.signature);
  const setCertNote = useLoveStore((s) => s.setCertNote);
  const setSignature = useLoveStore((s) => s.setSignature);
  const pad = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const now = new Date();
  const parts = splitDuration(togetherMs(parseDate(settings.startDate), now));
  const clearPad = () => {
    const canvas = pad.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };
  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = pad.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };
  return (
    <ModuleFrame id="certificate">
      <article className="paper rounded-sm px-6 py-8">
        <p className="text-center text-xs tracking-widest">GIẤY CHỨNG NHẬN</p>
        <h2 className="mt-2 text-center font-display text-4xl">Ngàn Ngày</h2>
        <p className="mt-4 text-center text-lg">
          {settings.nickA} và {settings.nickB}
        </p>
        <p className="mt-3 text-center text-sm leading-6">{note}</p>
        <p className="mt-4 text-center text-sm">Bắt đầu {formatVN(parseDate(settings.startDate))} · đã {parts.days} ngày</p>
        <div className="mt-6 flex justify-end">
          {signature ? <img src={signature} alt="Chữ ký" className="h-16" /> : <p className="text-xs opacity-60">Chữ ký để trống</p>}
        </div>
      </article>
      <Panel>
        <Field label="Lời trên giấy">
          <textarea className={fieldClass} rows={3} value={note} onChange={(e) => setCertNote(e.target.value)} />
        </Field>
        <p className="mt-3 text-sm text-muted">Ký bằng ngón tay hoặc chuột.</p>
        <canvas
          ref={pad}
          width={800}
          height={240}
          className="mt-2 h-28 w-full touch-none rounded-2xl bg-fg"
          onPointerDown={(event) => {
            drawing.current = true;
            const ctx = pad.current?.getContext("2d");
            if (!ctx) return;
            const p = point(event);
            ctx.strokeStyle = "#1a1214";
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
          }}
          onPointerMove={(event) => {
            if (!drawing.current) return;
            const ctx = pad.current?.getContext("2d");
            if (!ctx) return;
            const p = point(event);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }}
          onPointerUp={() => {
            drawing.current = false;
            const url = pad.current?.toDataURL("image/png");
            if (url) setSignature(url);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn variant="line" onClick={clearPad}>Ký lại</Btn>
          <Btn
            onClick={() => {
              void (async () => {
                await document.fonts.ready;
                const canvas = document.createElement("canvas");
                canvas.width = 1200;
                canvas.height = 800;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.fillStyle = "#f7efe8";
                ctx.fillRect(0, 0, 1200, 800);
                ctx.strokeStyle = "#e8c4a0";
                ctx.lineWidth = 8;
                ctx.strokeRect(36, 36, 1128, 728);
                ctx.fillStyle = "#1a1214";
                ctx.textAlign = "center";
                ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
                ctx.fillText("GIẤY CHỨNG NHẬN", 600, 140);
                ctx.font = "680 84px Fraunces, serif";
                ctx.fillText("Ngàn Ngày", 600, 250);
                ctx.font = "520 36px Fraunces, serif";
                ctx.fillText(`${settings.nickA}  và  ${settings.nickB}`, 600, 340);
                ctx.font = "400 26px 'Be Vietnam Pro', sans-serif";
                wrapText(ctx, note, 600, 410, 860, 36);
                ctx.fillText(`Từ ${formatVN(parseDate(settings.startDate))}  ·  ${parts.days} ngày`, 600, 560);
                if (signature) {
                  const img = new Image();
                  img.src = signature;
                  await img.decode().catch(() => undefined);
                  ctx.drawImage(img, 780, 580, 280, 90);
                }
                const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
                if (!blob) return;
                const href = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = href;
                a.download = "chung-nhan-ngan-ngay.png";
                a.click();
                URL.revokeObjectURL(href);
              })();
            }}
          >
            Xuất PNG
          </Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number) {
  const words = text.split(" ");
  let row = "";
  let yy = y;
  for (const word of words) {
    const test = row ? `${row} ${word}` : word;
    if (ctx.measureText(test).width > max) {
      ctx.fillText(row, x, yy);
      row = word;
      yy += line;
    } else row = test;
  }
  if (row) ctx.fillText(row, x, yy);
}

export function BackupModule() {
  const importData = useLoveStore((s) => s.importData);
  const resetAll = useLoveStore((s) => s.resetAll);
  const photos = useLoveStore((s) => s.photos);
  const letters = useLoveStore((s) => s.letters);
  const journal = useLoveStore((s) => s.journal);
  const [note, setNote] = useState("");
  const [confirm, setConfirm] = useState(false);
  const summary = useMemo(() => `${photos.length} ảnh · ${letters.length} thư · ${journal.length} nhật ký`, [photos.length, letters.length, journal.length]);
  return (
    <ModuleFrame id="backup">
      <Panel>
        <p className="text-sm text-muted">Đang giữ trên máy này: {summary}. Ảnh và thư không lên máy chủ, trừ khi hai bạn chủ động bật nối máy trong phần cài đặt.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => downloadText(`ngan-ngay-${toISODate(new Date())}.json`, exportPayload())}>Xuất JSON</Btn>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm">
            Khôi phục đè
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void readFileText(file).then((text) => {
                  const data = parseImport(text);
                  if (!data) setNote("File không đúng định dạng Ngàn Ngày.");
                  else {
                    importData(data, "replace");
                    setNote("Đã khôi phục và thay dữ liệu trên máy này.");
                  }
                });
              }}
            />
          </label>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line px-4 text-sm">
            Gộp thêm
            <input
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                void readFileText(file).then((text) => {
                  const data = parseImport(text);
                  if (!data) setNote("File không đúng định dạng Ngàn Ngày.");
                  else {
                    importData(data, "merge");
                    setNote("Đã gộp những mục chưa có.");
                  }
                });
              }}
            />
          </label>
        </div>
        {note ? <p className="mt-3 text-sm text-gold">{note}</p> : null}
      </Panel>
      <Panel>
        <p className="text-sm">Đưa máy này về dữ liệu mẫu. Ảnh và thư đang có sẽ mất nếu chưa xuất file.</p>
        {confirm ? (
          <div className="mt-3 flex gap-2">
            <Btn onClick={() => { resetAll(); setConfirm(false); }}>Xác nhận xóa</Btn>
            <Btn variant="ghost" onClick={() => setConfirm(false)}>Thôi</Btn>
          </div>
        ) : (
          <div className="mt-3">
            <Btn variant="line" onClick={() => setConfirm(true)}>Khôi phục mặc định</Btn>
          </div>
        )}
      </Panel>
    </ModuleFrame>
  );
}

export function whoLabel(who: "a" | "b") {
  return nickOf(useLoveStore.getState().settings, who);
}
