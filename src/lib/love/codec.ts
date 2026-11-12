const KEEP = "@@keep";
const MAX_URL = 18_000;

export function uid(prefix = ""): string {
  const raw =
    globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  const id = raw.replace(/-/g, "").slice(0, 24);
  return prefix ? `${prefix}${id}` : id;
}

export function roomCode(code: string): string {
  const s = code.trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
  return s || "DD-2706";
}

export function peerId(): string {
  const key = "ngan-ngay-device";
  let base = "";
  try {
    base = localStorage.getItem(key) ?? "";
  } catch {
    base = "";
  }
  if (!/^[a-zA-Z0-9_-]{4,40}$/.test(base)) {
    base = `d${Math.random().toString(36).slice(2, 12)}`;
    try {
      localStorage.setItem(key, base);
    } catch {
      /* ignore quota */
    }
  }
  let tab = "";
  try {
    tab = sessionStorage.getItem("ngan-tab") ?? "";
    if (!tab) {
      tab = Math.random().toString(36).slice(2, 6);
      sessionStorage.setItem("ngan-tab", tab);
    }
  } catch {
    tab = "tab";
  }
  return `${base}${tab}`.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

function bytesToB64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i] ?? 0);
  return btoa(binary);
}

function b64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

export function encrypt(plain: string, pin: string): string {
  const data = new TextEncoder().encode(plain);
  const key = new TextEncoder().encode(pin || "0");
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += 1) {
    out[i] = (data[i] ?? 0) ^ (key[i % key.length] ?? 0) ^ ((i * 13) & 255);
  }
  return `v1:${bytesToB64(out)}`;
}

export function decrypt(payload: string, pin: string): string {
  if (!payload.startsWith("v1:")) return "";
  try {
    const raw = b64ToBytes(payload.slice(3));
    const key = new TextEncoder().encode(pin || "0");
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      out[i] = (raw[i] ?? 0) ^ (key[i % key.length] ?? 0) ^ ((i * 13) & 255);
    }
    return new TextDecoder().decode(out);
  } catch {
    return "";
  }
}

export function slimUrl(url: string): string {
  if (!url) return "";
  if (url.length > MAX_URL) return KEEP;
  return url;
}

export function mergeUrl(local: string, incoming: string): string {
  if (incoming === KEEP) return local;
  return incoming;
}

export const MEDIA_KEEP = KEEP;

export function compressImage(file: File, max = 960, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("canvas"));
        return;
      }
      ctx.fillStyle = "#140e10";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

export function cssColor(name: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function downloadText(filename: string, text: string, type = "application/json"): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsText(file);
  });
}
