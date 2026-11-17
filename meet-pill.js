/**
 * Pastille Yamada sur meet.google.com — POST /api/v1/os/calls/meet-offer
 * Origin Work : localStorage decodeWorkBaseUrl (défaut http://127.0.0.1:3100)
 */

(function () {
  const CODE_RE = /^\/([a-z]{3}-[a-z]{4}-[a-z]{3})$/i;
  const LOOKUP_RE = /^\/lookup\/([a-zA-Z0-9_-]+)$/i;
  const ROOT_ID = "decode-meet-transcript-pill-root";

  function normalizeMeetUri(raw) {
    try {
      const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
      const host = url.hostname.toLowerCase();
      if (host !== "meet.google.com" && !host.endsWith(".meet.google.com")) return null;
      const path = url.pathname.replace(/\/+$/, "") || "/";
      const code = path.match(CODE_RE);
      if (code) return `https://meet.google.com/${code[1].toLowerCase()}`;
      const lookup = path.match(LOOKUP_RE);
      if (lookup) return `https://meet.google.com/lookup/${lookup[1]}`;
      return null;
    } catch {
      return null;
    }
  }

  let cachedBase = "http://127.0.0.1:3100";
  try {
    chrome.storage?.local?.get?.(["decodeWorkBaseUrl"], (data) => {
      if (data?.decodeWorkBaseUrl) {
        cachedBase = String(data.decodeWorkBaseUrl).replace(/\/$/, "");
      }
    });
  } catch {
    /* ignore */
  }

  function workBase() {
    return cachedBase;
  }

  function removePill() {
    document.getElementById(ROOT_ID)?.remove();
  }

  function renderPill(meetUri) {
    if (document.getElementById(ROOT_ID)) return;
    const root = document.createElement("div");
    root.id = ROOT_ID;
    root.setAttribute("data-testid", "meet-transcript-pill");
    root.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:24px",
      "transform:translateX(-50%)",
      "z-index:2147483646",
      "display:flex",
      "flex-wrap:wrap",
      "align-items:center",
      "gap:10px 12px",
      "max-width:min(560px,calc(100vw - 24px))",
      "padding:10px 12px",
      "border-radius:999px",
      "background:rgba(32,33,36,0.92)",
      "color:#fff",
      "font:14px/1.35 system-ui,sans-serif",
      "box-shadow:0 8px 24px rgba(0,0,0,0.35)",
    ].join(";");

    const mark = document.createElement("span");
    mark.textContent = "_d";
    mark.style.cssText =
      "display:grid;place-items:center;width:32px;height:32px;border-radius:8px;background:#111;font-weight:700;flex-shrink:0";

    const copy = document.createElement("div");
    copy.style.flex = "1 1 140px";
    const title = document.createElement("div");
    title.textContent = "Notes Yamada";
    title.style.fontWeight = "600";
    const sub = document.createElement("div");
    sub.textContent = "La transcription alimente le CR Yamada.";
    sub.style.cssText = "font-size:12px;opacity:0.8;margin-top:2px";
    copy.appendChild(title);
    copy.appendChild(sub);

    const cta = document.createElement("button");
    cta.type = "button";
    cta.textContent = "Commencer la transcription";
    cta.setAttribute("data-testid", "meet-transcript-pill-cta");
    cta.style.cssText =
      "border:none;border-radius:999px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer;background:#1a73e8;color:#fff";

    const dismiss = document.createElement("button");
    dismiss.type = "button";
    dismiss.textContent = "×";
    dismiss.title = "Ne plus pour ce Meet";
    dismiss.setAttribute("aria-label", "Ne plus pour ce Meet");
    dismiss.setAttribute("data-testid", "meet-transcript-pill-dismiss");
    dismiss.style.cssText =
      "width:32px;height:32px;border-radius:999px;border:1px solid rgba(255,255,255,0.25);background:transparent;color:#fff;cursor:pointer;font-size:18px";

    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "Fermer";
    close.setAttribute("data-testid", "meet-transcript-pill-close");
    close.style.cssText =
      "border:none;background:transparent;color:rgba(255,255,255,0.75);font:inherit;font-size:12px;cursor:pointer";

    async function post(isDismiss) {
      cta.disabled = true;
      dismiss.disabled = true;
      cta.textContent = "Armement…";
      try {
        const res = await fetch(`${workBase()}/api/v1/os/calls/meet-offer`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetUri, source: "extension", dismiss: Boolean(isDismiss) }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          sub.textContent =
            data.message ||
            data.error ||
            "Active la transcription Meet (hôte) ou lie un call Work.";
          cta.disabled = false;
          dismiss.disabled = false;
          cta.textContent = "Commencer la transcription";
          return;
        }
        if (isDismiss || data.status === "dismissed") {
          removePill();
          return;
        }
        cta.textContent = "Armé";
        sub.textContent = data.message || "Transcript armé pour Yamada.";
      } catch {
        sub.textContent = "Active la transcription Meet (hôte) ou lie un call Work.";
        cta.disabled = false;
        dismiss.disabled = false;
        cta.textContent = "Commencer la transcription";
      }
    }

    cta.addEventListener("click", () => {
      void post(false);
    });
    dismiss.addEventListener("click", () => {
      void post(true);
    });
    close.addEventListener("click", removePill);

    root.appendChild(mark);
    root.appendChild(copy);
    root.appendChild(cta);
    root.appendChild(dismiss);
    root.appendChild(close);
    document.documentElement.appendChild(root);
  }

  function sync() {
    const meetUri = normalizeMeetUri(location.href);
    if (!meetUri) {
      removePill();
      return;
    }
    renderPill(meetUri);
  }

  sync();
  const mo = new MutationObserver(() => sync());
  mo.observe(document.documentElement, { childList: true, subtree: false });
  window.addEventListener("popstate", sync);
  setInterval(sync, 4000);
})();
