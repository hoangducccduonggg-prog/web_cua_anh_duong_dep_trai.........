import { useEffect, useState } from "react";
import { SkyCanvas, SnowGlobe, TreeCanvas } from "./canvas-bits";
import { Btn, Empty, Field, ModuleFrame, Panel, PhotoPick, fieldClass } from "./ui";
import { treeLevel } from "@/lib/love/dates";
import { nickOf } from "@/lib/love/seed";
import { useLoveStore } from "@/lib/love/store";

export function CakeModule() {
  const settings = useLoveStore((s) => s.settings);
  const photos = useLoveStore((s) => s.photos);
  const wish = useLoveStore((s) => s.cakeWish);
  const setCakeWish = useLoveStore((s) => s.setCakeWish);
  const [draft, setDraft] = useState(wish);
  const [lit, setLit] = useState(true);
  const [listening, setListening] = useState(false);
  const [note, setNote] = useState("");
  useEffect(() => setDraft(wish), [wish]);

  const blow = () => {
    setLit(false);
    setNote("Nến đã tắt. Ước gì vừa thầm thì được giữ.");
  };

  return (
    <ModuleFrame id="cake">
      <Panel className="overflow-hidden">
        <div className="relative mx-auto h-80 max-w-lg [perspective:900px]">
          <div className="spin-y absolute inset-0">
            {photos.slice(0, 6).map((photo, i) => (
              <img
                key={photo.id}
                src={photo.dataUrl}
                alt=""
                className="absolute left-1/2 top-1/2 h-16 w-14 -translate-x-1/2 rounded-sm border-2 border-fg object-cover"
                style={{ transform: `rotateY(${i * 60}deg) translateZ(9rem)` }}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0">
            <div className="relative mx-auto w-56">
              <div className="absolute -top-8 left-1/2 flex -translate-x-1/2 gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    {lit ? <span className="flame mb-0.5 block h-4 w-2 rounded-full bg-gold" /> : null}
                    <span className="block h-6 w-1.5 rounded-sm bg-gold" />
                  </div>
                ))}
              </div>
              <div className="mx-auto h-14 w-32 rounded-t-3xl bg-primary" />
              <div className="mx-auto h-14 w-44 bg-gold" />
              <div className="mx-auto h-16 w-56 rounded-b-3xl bg-primary" />
            </div>
          </div>
        </div>
        <p className="mt-3 text-center font-display text-2xl text-fg">
          {settings.nickA} & {settings.nickB}
        </p>
        {note ? <p className="text-center text-sm text-gold">{note}</p> : null}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Btn onClick={blow} disabled={!lit}>Tắt nến</Btn>
          <Btn
            variant="line"
            onClick={() => {
              if (listening) return;
              setListening(true);
              void navigator.mediaDevices
                ?.getUserMedia({ audio: true })
                .then((stream) => {
                  const audio = new AudioContext();
                  const src = audio.createMediaStreamSource(stream);
                  const analyser = audio.createAnalyser();
                  analyser.fftSize = 256;
                  src.connect(analyser);
                  const data = new Uint8Array(analyser.frequencyBinCount);
                  const id = window.setInterval(() => {
                    analyser.getByteFrequencyData(data);
                    const avg = data.reduce((sum, n) => sum + n, 0) / data.length;
                    if (avg > 26) {
                      window.clearInterval(id);
                      stream.getTracks().forEach((track) => track.stop());
                      void audio.close();
                      setListening(false);
                      blow();
                    }
                  }, 140);
                  window.setTimeout(() => {
                    window.clearInterval(id);
                    stream.getTracks().forEach((track) => track.stop());
                    void audio.close();
                    setListening(false);
                  }, 8000);
                })
                .catch(() => {
                  setListening(false);
                  setNote("Máy không cho dùng micro. Bấm nút tắt nến cũng được.");
                });
            }}
          >
            {listening ? "Đang nghe hơi thở…" : "Thổi vào micro"}
          </Btn>
          {!lit ? <Btn variant="ghost" onClick={() => { setLit(true); setNote(""); }}>Thắp lại</Btn> : null}
        </div>
      </Panel>
      <Panel>
        <Field label="Lời chúc trên bánh">
          <textarea className={fieldClass} rows={3} value={draft} onChange={(e) => setDraft(e.target.value)} />
        </Field>
        <div className="mt-3">
          <Btn variant="gold" onClick={() => setCakeWish(draft)}>Lưu lời chúc</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function TreeModule() {
  const tree = useLoveStore((s) => s.tree);
  const waterTree = useLoveStore((s) => s.waterTree);
  const feedTree = useLoveStore((s) => s.feedTree);
  const addTreeWish = useLoveStore((s) => s.addTreeWish);
  const removeTreeWish = useLoveStore((s) => s.removeTreeWish);
  const [text, setText] = useState("");
  const level = treeLevel(tree.water, tree.feed);
  return (
    <ModuleFrame id="tree">
      <Panel>
        <TreeCanvas level={level} blossoms={level > 3 ? tree.wishes.length + 4 : 0} />
        <p className="mt-3 text-sm text-muted">Cấp {level} · tưới {tree.water} lần · bón {tree.feed} lần. Mỗi ngày một lần cho mỗi việc.</p>
        <div className="mt-3 flex gap-2">
          <Btn onClick={waterTree}>Tưới nước</Btn>
          <Btn variant="gold" onClick={feedTree}>Bón phân</Btn>
        </div>
      </Panel>
      <Panel>
        <div className="flex gap-2">
          <input className={fieldClass} value={text} placeholder="Treo một điều ước" onChange={(e) => setText(e.target.value)} />
          <Btn onClick={() => { addTreeWish(text); setText(""); }}>Treo</Btn>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {tree.wishes.map((wish) => (
            <li key={wish.id} className="flex items-center justify-between gap-3 rounded-2xl bg-bg px-3 py-2 text-sm">
              <span>{wish.text}</span>
              <button type="button" className="text-xs text-primary" onClick={() => removeTreeWish(wish.id)}>Gỡ</button>
            </li>
          ))}
        </ul>
      </Panel>
    </ModuleFrame>
  );
}

export function SkyModule() {
  const stars = useLoveStore((s) => s.stars);
  const toggleStar = useLoveStore((s) => s.toggleStar);
  const setStarText = useLoveStore((s) => s.setStarText);
  const [active, setActive] = useState<string | null>(stars.find((s) => s.found)?.id ?? null);
  const star = stars.find((s) => s.id === active) ?? null;
  const [text, setText] = useState(star?.text ?? "");
  useEffect(() => setText(star?.text ?? ""), [star?.id, star?.text]);
  return (
    <ModuleFrame id="sky">
      <SkyCanvas
        stars={stars}
        onPick={(id) => {
          toggleStar(id);
          setActive(id);
        }}
      />
      <p className="text-sm text-muted">Chạm một ngôi sao để bật hoặc tắt. Những sao đã mở được nối thành chòm.</p>
      {star ? (
        <Panel>
          <h2 className="font-display text-2xl">{star.name}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{star.found ? star.text : "Sao này còn khép."}</p>
          {star.found ? (
            <div className="mt-3 grid gap-2">
              <textarea className={fieldClass} rows={3} value={text} onChange={(e) => setText(e.target.value)} />
              <Btn variant="line" onClick={() => setStarText(star.id, text)}>Lưu lời nhắn</Btn>
            </div>
          ) : null}
        </Panel>
      ) : (
        <Empty text="Chạm một sao trên bầu trời." />
      )}
    </ModuleFrame>
  );
}

export function GlobeModule() {
  const globe = useLoveStore((s) => s.globe);
  const photos = useLoveStore((s) => s.photos);
  const settings = useLoveStore((s) => s.settings);
  const setGlobe = useLoveStore((s) => s.setGlobe);
  const photo = photos.find((p) => p.id === globe.photoId)?.dataUrl || photos[0]?.dataUrl;
  return (
    <ModuleFrame id="globe">
      <Panel>
        <SnowGlobe tint={globe.tint} photo={photo} label={`${settings.nameA.slice(0, 1)} ${settings.nameB.slice(0, 1)}`} />
        <p className="text-center text-sm text-muted">Vuốt ngang quả cầu, hoặc lắc điện thoại nếu máy cho phép.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {(["rose", "cream", "gold"] as const).map((tint) => (
            <button
              key={tint}
              type="button"
              onClick={() => setGlobe({ tint })}
              className={globe.tint === tint ? "min-h-11 rounded-full bg-primary px-4 text-sm text-primary-fg" : "min-h-11 rounded-full border border-line px-4 text-sm"}
            >
              {tint === "rose" ? "Tuyết hồng" : tint === "cream" ? "Tuyết kem" : "Tuyết vàng"}
            </button>
          ))}
        </div>
        {photos.length > 0 ? (
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {photos.map((item) => (
              <button key={item.id} type="button" onClick={() => setGlobe({ photoId: item.id })} className="shrink-0">
                <img src={item.dataUrl} alt="" className={item.id === globe.photoId ? "h-16 w-12 rounded-md border-2 border-gold object-cover" : "h-16 w-12 rounded-md object-cover"} />
              </button>
            ))}
          </div>
        ) : null}
      </Panel>
    </ModuleFrame>
  );
}

export function MuseumModule() {
  const relics = useLoveStore((s) => s.relics);
  const addRelic = useLoveStore((s) => s.addRelic);
  const deleteRelic = useLoveStore((s) => s.deleteRelic);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [active, setActive] = useState(relics[0]?.id ?? "");
  const relic = relics.find((r) => r.id === active) ?? relics[0];
  return (
    <ModuleFrame id="museum">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {relics.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className={item.id === relic?.id ? "w-40 shrink-0 rounded-2xl border border-gold bg-surface p-3 text-left" : "w-40 shrink-0 rounded-2xl border border-line bg-surface p-3 text-left"}
          >
            <p className="text-xs text-gold">{item.year}</p>
            <p className="font-display text-lg">{item.title}</p>
          </button>
        ))}
      </div>
      {relic ? (
        <Panel>
          <h2 className="font-display text-3xl">{relic.title}</h2>
          <p className="mt-3 text-sm leading-6">{relic.story}</p>
          <div className="mt-4 flex gap-2">
            <Btn
              variant="line"
              onClick={() => {
                if (!("speechSynthesis" in window)) return;
                window.speechSynthesis.cancel();
                const utter = new SpeechSynthesisUtterance(`${relic.title}. ${relic.story}`);
                utter.lang = "vi-VN";
                utter.rate = 0.96;
                window.speechSynthesis.speak(utter);
              }}
            >
              Nghe lời kể
            </Btn>
            <Btn variant="ghost" onClick={() => deleteRelic(relic.id)}>Gỡ khỏi phòng</Btn>
          </div>
        </Panel>
      ) : (
        <Empty text="Phòng đang trống." />
      )}
      <Panel>
        <div className="grid gap-2">
          <input className={fieldClass} placeholder="Tên kỷ vật" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className={fieldClass} rows={3} placeholder="Câu chuyện của nó" value={story} onChange={(e) => setStory(e.target.value)} />
          <Btn onClick={() => { addRelic(title, story); setTitle(""); setStory(""); }}>Thêm kỷ vật</Btn>
        </div>
      </Panel>
    </ModuleFrame>
  );
}

export function LanternModule() {
  const lanterns = useLoveStore((s) => s.lanterns);
  const settings = useLoveStore((s) => s.settings);
  const addLantern = useLoveStore((s) => s.addLantern);
  const deleteLantern = useLoveStore((s) => s.deleteLantern);
  const [wish, setWish] = useState("");
  return (
    <ModuleFrame id="lanterns">
      <Panel className="relative h-80 overflow-hidden bg-bg">
        {lanterns.slice(0, 8).map((lantern, index) => (
          <div
            key={lantern.id}
            className="lantern-rise absolute bottom-0 w-24 rounded-t-full bg-primary px-2 py-3 text-center text-primary-fg"
            style={{ left: `${8 + ((index * 19) % 78)}%`, animationDelay: `${index * 1.3}s` }}
          >
            <span className="block text-xs leading-4">{lantern.wish}</span>
          </div>
        ))}
        <p className="relative z-10 p-4 text-sm text-muted">Đèn đang bay là những ước đã thả.</p>
      </Panel>
      <div className="flex gap-2">
        <input className={fieldClass} value={wish} placeholder="Viết điều ước" onChange={(e) => setWish(e.target.value)} />
        <Btn onClick={() => { addLantern(wish); setWish(""); }}>Thả</Btn>
      </div>
      <ul className="flex flex-col gap-2">
        {lanterns.map((lantern) => (
          <li key={lantern.id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-surface px-3 py-2 text-sm">
            <span>
              {lantern.wish}
              <span className="mt-1 block text-xs text-muted">{nickOf(settings, lantern.by)}</span>
            </span>
            <button type="button" className="text-xs text-primary" onClick={() => deleteLantern(lantern.id)}>Gỡ</button>
          </li>
        ))}
      </ul>
    </ModuleFrame>
  );
}
