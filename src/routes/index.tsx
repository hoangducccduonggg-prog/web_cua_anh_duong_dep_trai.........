import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { App } from "@/components/love/shell";
import { useLoveStore } from "@/lib/love/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const stop = useLoveStore.getState().boot();
    setReady(true);
    return () => stop();
  }, []);
  if (!ready) return <Splash />;
  return <App />;
}

function Splash() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center text-fg">
      <div>
        <p className="font-display text-4xl text-balance">Ngàn Ngày</p>
        <p className="mt-2 text-sm text-muted">Đang mở tủ kỷ niệm…</p>
      </div>
    </main>
  );
}
