"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    PiMedCalInit?: () => void;
    __pimedcalLoadPromise?: Promise<void>;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded === "true") {
      resolve();
      return;
    }

    const script = existing || document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Unable to load ${src}`));

    if (!existing) {
      document.body.appendChild(script);
    }
  });
}

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    if (!window.__pimedcalLoadPromise) {
      window.__pimedcalLoadPromise = loadScript("/instruments.js").then(() => loadScript("/app.js"));
    }

    window.__pimedcalLoadPromise.then(() => {
      if (active && window.PiMedCalInit) {
        window.PiMedCalInit();
        setReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="early-warning-page">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="early-warning-toolbar">
        <span className="hidden text-xs font-medium text-muted-foreground md:inline" id="clock"></span>
        <Button id="printBtn" type="button">
          <Printer className="h-4 w-4" />
          Print summary
        </Button>
      </div>

      <main id="main-content" className="app-shell" aria-busy={!ready}>
        <section className="param-panel" aria-labelledby="param-title">
          <div className="param-header">
            <div>
              <h2 className="param-title" id="param-title">Early warning score</h2>
            </div>
            <div className="param-completeness" id="paramCompleteness" role="status" aria-live="polite">
              <div className="param-completeness-progress">
                <span className="param-completeness-num" id="paramCompletenessNum">0</span>
                <span className="param-completeness-total">/ <span id="paramCompletenessTotal">0</span></span>
              </div>
              <span className="param-completeness-label">Core parameters completed</span>
            </div>
          </div>
          <div className="param-grid" id="paramGrid"></div>
        </section>

        <nav className="tab-nav" aria-label="Screening instruments">
          <div className="tab-list" id="tabList" role="tablist" aria-label="Screening instruments and index"></div>
        </nav>

        <div id="tabPanels"></div>
        <p className="live-status visually-hidden" id="liveStatus" aria-live="polite"></p>
      </main>
    </div>
  );
}
