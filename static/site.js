// songbird — CRT toggle, expanding search, copy buttons. No dependencies.
(() => {
  const root = document.documentElement;

  /* ── CRT toggle ─────────────────────────────────────────── */
  const crtBtn = document.querySelector(".crt-toggle");
  const syncCrt = () => crtBtn && crtBtn.setAttribute("aria-pressed", String(root.classList.contains("crt-on")));
  syncCrt();
  crtBtn?.addEventListener("click", () => {
    const on = root.classList.toggle("crt-on");
    try { localStorage.setItem("crt", on ? "on" : "off"); } catch (e) {}
    if (on) {                       // brief power-on flash
      root.classList.remove("crt-boot");
      void root.offsetWidth;
      root.classList.add("crt-boot");
    }
    syncCrt();
  });

  /* ── search ─────────────────────────────────────────────── */
  const box = document.querySelector(".search");
  if (box) {
    const btn = box.querySelector(".search-btn");
    const input = box.querySelector(".search-input");
    const out = box.querySelector(".search-results");
    let index = null, loading = null, active = -1;

    const load = () => loading ??= fetch(box.dataset.index)
      .then(r => r.json())
      .then(d => { index = d.filter(p => p.body || p.description); })
      .catch(() => { index = []; });

    const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    const mark = (text, terms) => {
      let html = esc(text);
      for (const t of terms) html = html.replace(new RegExp(esc(t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), m => `<mark>${m}</mark>`);
      return html;
    };
    const snippet = (body, term) => {
      const flat = body.replace(/\s+/g, " ");
      const i = flat.toLowerCase().indexOf(term);
      if (i < 0) return flat.slice(0, 110) + (flat.length > 110 ? "…" : "");
      const s = Math.max(0, i - 40);
      return (s ? "…" : "") + flat.slice(s, s + 120) + (s + 120 < flat.length ? "…" : "");
    };

    const open = () => {
      box.classList.add("open");
      btn.setAttribute("aria-expanded", "true");
      input.tabIndex = 0;
      input.focus();
      load();
    };
    const close = () => {
      box.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      input.tabIndex = -1;
      input.value = "";
      out.hidden = true;
      out.innerHTML = "";
    };

    const render = async () => {
      const q = input.value.trim().toLowerCase();
      active = -1;
      if (q.length < 2) { out.hidden = true; out.innerHTML = ""; return; }
      await load();
      const terms = q.split(/\s+/).filter(Boolean);
      const hits = [];
      for (const p of index) {
        const t = p.title.toLowerCase(), d = (p.description || "").toLowerCase(), b = p.body.toLowerCase();
        let score = 0, ok = true;
        for (const term of terms) {
          const s = (t.includes(term) ? 6 : 0) + (d.includes(term) ? 3 : 0) + (b.includes(term) ? 1 : 0);
          if (!s) { ok = false; break; }
          score += s;
        }
        if (ok) hits.push({ p, score });
      }
      hits.sort((a, b) => b.score - a.score);
      out.hidden = false;
      out.innerHTML = hits.length
        ? hits.slice(0, 8).map(({ p }) =>
            `<a class="sr" role="option" href="${esc(p.url)}"><span class="sr-title">${mark(p.title, terms)}</span>` +
            `<span class="sr-snip">${mark(snippet(p.body || p.description, terms[0]), terms)}</span></a>`).join("") +
          `<p class="sr-foot">${hits.length} match${hits.length === 1 ? "" : "es"} · ↑↓ enter · esc</p>`
        : `<p class="sr-none">no signal for “${esc(q)}”</p>`;
    };

    btn.addEventListener("click", () => box.classList.contains("open") ? close() : open());
    input.addEventListener("input", render);
    input.addEventListener("keydown", e => {
      const items = [...out.querySelectorAll(".sr")];
      if (e.key === "Escape") { close(); btn.focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!items.length) return;
        e.preventDefault();
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach((el, i) => el.classList.toggle("active", i === active));
        items[active].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter" && items.length) {
        e.preventDefault();
        location.href = items[Math.max(active, 0)].href;
      }
    });
    document.addEventListener("click", e => { if (box.classList.contains("open") && !box.contains(e.target) && !input.value) close(); });
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !box.classList.contains("open") && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); open();
      }
    });
  }

  /* ── copy buttons on code blocks ────────────────────────── */
  document.querySelectorAll(".prose pre").forEach(pre => {
    // wrap the block so the button is pinned to the frame, not the scrolling code
    const wrap = document.createElement("div");
    wrap.className = "code-wrap";
    pre.before(wrap);
    wrap.appendChild(pre);
    const b = document.createElement("button");
    b.type = "button"; b.className = "copy"; b.textContent = "copy";
    b.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector("code")?.innerText ?? pre.innerText);
        b.textContent = "copied";
      } catch (e) { b.textContent = "error"; }
      setTimeout(() => (b.textContent = "copy"), 1400);
    });
    wrap.appendChild(b);
  });
  /* ── home tiles: local clock + typing ticker ─────────────── */
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = document.querySelector(".clock");
  if (clock) {
    const tz = clock.dataset.tz;
    const t = clock.querySelector(".clock-time");
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    const tick = () => {
      const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
      t.innerHTML = `${parts.hour}<span class="clock-colon">:</span>${parts.minute}`;
      t.dateTime = `${parts.hour}:${parts.minute}`;
    };
    tick();
    setInterval(tick, 1000 * 15);
  }

  const ticker = document.querySelector(".ticker");
  const lines = ticker?.dataset.lines.split("|").filter(Boolean) ?? [];
  if (ticker && lines.length) {
    const el = ticker.querySelector(".ticker-text");
    let i = 0;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const loop = async () => {
      for (;;) {
        const line = lines[i];
        if (still) { el.textContent = line; await wait(3200); }
        else {
          for (let c = 1; c <= line.length; c++) { el.textContent = line.slice(0, c); await wait(55 + Math.random() * 40); }
          await wait(1900);
          for (let c = line.length; c >= 0; c--) { el.textContent = line.slice(0, c); await wait(26); }
          await wait(450);
        }
        i = (i + 1) % lines.length;
      }
    };
    el.textContent = "";
    setTimeout(loop, 700);
  }

  /* ── reading progress (posts only) ───────────────────────── */
  // lift the bar out of <main> so the CRT jitter transform can't pin it in place
  const progress = document.querySelector(".progress");
  if (progress) document.body.prepend(progress);
  const bar = progress?.querySelector("span");
  const article = document.querySelector(".post");
  if (bar && article) {
    let ticking = false;
    const update = () => {
      const r = article.getBoundingClientRect();
      const total = r.height - innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.transform = `scaleX(${p})`;
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* ── keyboard shortcuts ─────────────────────────────────── */
  const base = document.querySelector(".brand")?.getAttribute("href") || "/";
  const go = { h: "", l: "posts/", w: "work/", i: "tags/", t: "tools/", s: "stats/", a: "about/" };
  const keys = [
    ["g h", "home"], ["g l", "log"], ["g w", "work"], ["g i", "tags index"], ["g t", "tools"], ["g s", "stats"], ["g a", "about"],
    ["/", "search"], ["c", "toggle CRT"], ["[  ]", "older / newer entry"], ["?", "this list"], ["esc", "close"],
  ];
  let help = null;
  const toggleHelp = () => {
    if (help) { help.remove(); help = null; return; }
    help = document.createElement("div");
    help.className = "kbd-help";
    help.setAttribute("role", "dialog");
    help.setAttribute("aria-label", "Keyboard shortcuts");
    help.innerHTML = `<div class="kbd-card"><p class="label"><span class="idx">?</span> shortcuts</p><table>${
      keys.map(([k, d]) => `<tr><td>${k.split(" ").map(x => x ? `<kbd>${x}</kbd>` : "").join(" ")}</td><td>${d}</td></tr>`).join("")
    }</table><p class="kbd-foot">press <kbd>?</kbd> or <kbd>esc</kbd> to close</p></div>`;
    help.addEventListener("click", e => { if (e.target === help) toggleHelp(); });
    document.body.appendChild(help);
  };
  let gPending = 0;
  document.addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/input|textarea|select/i.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable) return;
    if (e.key === "Escape" && help) { toggleHelp(); return; }
    if (e.key === "?") { e.preventDefault(); toggleHelp(); return; }
    if (gPending && Date.now() - gPending < 1200 && e.key in go) {
      e.preventDefault(); gPending = 0; location.href = base + go[e.key]; return;
    }
    gPending = e.key === "g" ? Date.now() : 0;
    if (e.key === "c") crtBtn?.click();
    else if (e.key === "[") document.querySelector(".pn-prev")?.click();
    else if (e.key === "]") document.querySelector(".pn-next")?.click();
  });
})();
