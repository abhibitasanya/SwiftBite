"use client";

import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [showUI, setShowUI] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handler(e: any) {
      e.preventDefault();
      setPromptEvent(e);
      setShowUI(true);
    }

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    window.addEventListener("appinstalled", () => setInstalled(true));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler as EventListener);
      window.removeEventListener("appinstalled", () => setInstalled(true));
    };
  }, []);

  async function handleInstallClick() {
    if (!promptEvent) return;
    try {
      // show native install prompt
      promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice && choice.outcome === "accepted") setInstalled(true);
      setPromptEvent(null);
      setShowUI(false);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="p-2">
          <div className="rounded-lg border-4 border-[#314a32] bg-[#223326] p-2 w-20 h-20 flex items-center justify-center">
          <img src="/icon.svg" alt="SwiftBite logo" className="max-w-full max-h-full object-contain" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (promptEvent) handleInstallClick();
              else setShowUI(true);
            }}
            className="rounded-full bg-[#314a32] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(47,79,47,0.25)] hover:opacity-95"
          >
            {installed ? "Installed" : "Install app"}
          </button>

          <button
            onClick={() => setShowUI((s) => !s)}
            className="rounded-full border border-[#cfd8cc] bg-white px-3 py-2 text-sm font-medium text-[#243025]"
          >
            Options
          </button>
        </div>

        {showUI ? (
          <div className="mt-2 w-[22rem] rounded-lg border border-[#e6e6dc] bg-white p-3 shadow-[0_12px_40px_rgba(20,28,24,0.08)]">
            <p className="text-sm font-semibold">Install & download options</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-[#555]">
              <li>Use the <strong>Install app</strong> button for supported browsers (Chrome/Edge on desktop & Android will show a native prompt).</li>
              <li>iOS: open Safari → tap Share → <em>Add to Home Screen</em>.</li>
              <li>Android (older): use the browser menu → <em>Add to Home screen</em> if native prompt not shown.</li>
              <li>Desktop Chromium: if a prompt doesn't appear, open the browser menu → <em>Install app</em>.</li>
              <li>You can also download the package from a hosted store or provide an APK externally.</li>
            </ul>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="/" className="rounded-md border border-[#dfe7d0] bg-[#f8fbf4] px-3 py-2 text-sm text-[#314a32] text-center">Open app</a>
              <a href="#" className="rounded-md border border-[#dfe7d0] bg-white px-3 py-2 text-sm text-[#314a32] text-center">Download (APK)</a>
            </div>

            <div className="mt-3">
              <p className="text-xs text-[#6b6b6b]">Logo preview</p>
              <div className="mt-2 inline-block rounded-lg border-4 border-[#314a32] bg-[#223326] p-2">
                <img src="/icon.svg" alt="logo preview" className="w-28 h-28 object-contain" />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
