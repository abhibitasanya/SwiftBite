"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(display-mode: standalone)").matches || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export function PwaInstallButton() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsInstalled(isStandaloneDisplay());
    setIsReady(true);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
    };

    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker.register("/sw.js");
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  };

  if (!isReady || isInstalled || !promptEvent) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-2.5 rounded-full border border-[#d7e0cf] bg-[linear-gradient(180deg,#f6f2e5_0%,#e3ead8_100%)] px-3.5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#223326] shadow-[0_10px_24px_rgba(34,51,38,0.14)] transition hover:-translate-y-0.5 hover:border-[#bfd0b9] hover:shadow-[0_16px_34px_rgba(34,51,38,0.22)] sm:px-4 sm:py-2.5"
      aria-label="Install SwiftBite app"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#223326] text-[#f5f1e6] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4.5 w-4.5 fill-none stroke-current stroke-[2]">
          <path d="M12 4v9" />
          <path d="M8.5 10.5L12 14l3.5-3.5" />
          <path d="M5 19h14" />
        </svg>
      </span>
      <span className="leading-none">Install App</span>
    </button>
  );
}
