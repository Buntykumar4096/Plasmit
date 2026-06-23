"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    function loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing?.dataset.loaded === "true") return resolve();
        const script = existing || document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => { script.dataset.loaded = "true"; resolve(); };
        script.onerror = reject;
        if (!existing) document.body.appendChild(script);
      });
    }

    if (!window.__pimedcalLoadPromise) {
      window.__pimedcalLoadPromise = loadScript("/instruments.js").then(() => loadScript("/app.js"));
    }

    window.__pimedcalLoadPromise.then(() => {
      if (active && window.PiMedCalInit && !window.__pimedcalMounted) {
        window.__pimedcalMounted = true;
        window.PiMedCalInit();
        setReady(true);
      }
    });

    return () => { active = false; };
  }, []);

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="masthead">
        <div className="masthead-inner">
          <div>
            <div className="brand"><img className="brand-logo" src="/pimed-logo.png" alt="PiMed logo" /></div>
            <div className="brand-sub">Pneumonia &amp; sepsis risk index — bedside screening</div>
          </div>
          <div className="masthead-meta">
            <span id="clock"></span>
            <button className="print-btn" id="printBtn" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
              Print summary
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="app-shell" aria-busy={!ready}>
        <section className="param-panel" aria-labelledby="param-title">
          <div className="param-header">
            <div>
              <h2 className="param-title" id="param-title">Patient parameters</h2>
            </div>
            <div className="param-completeness" id="paramCompleteness" role="status" aria-live="polite">
              <span className="param-completeness-num" id="paramCompletenessNum">0</span>
              <span className="param-completeness-label">of <span id="paramCompletenessTotal">0</span> core parameters entered</span>
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

    </>
  );
}
