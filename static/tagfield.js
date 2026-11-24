// songbird — tag playground: floating bubbles you can throw around.
// click = filter the entries below, double-click = open the tag page.
(() => {
  const field = document.querySelector(".tagfield");
  if (!field) return;
  const els = [...field.querySelectorAll(".bubble")];
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = field.clientWidth, H = field.clientHeight;
  const maxN = Math.max(1, ...els.map(e => +e.dataset.n));
  const bodies = els.map((el, i) => {
    const r = Math.round(38 + 30 * Math.sqrt(+el.dataset.n / maxN));
    el.style.width = el.style.height = 2 * r + "px";
    const a = (i / els.length) * Math.PI * 2;
    return {
      el, r,
      x: W / 2 + Math.cos(a) * Math.min(W, H) * 0.28 + (Math.random() - 0.5) * 20,
      y: H / 2 + Math.sin(a) * Math.min(W, H) * 0.28 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      held: false,
    };
  });

  /* drag + throw */
  let drag = null;
  bodies.forEach(b => {
    b.el.addEventListener("pointerdown", e => {
      b.el.setPointerCapture(e.pointerId);
      drag = { b, ox: e.clientX, oy: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), moved: 0 };
      b.held = true; b.vx = b.vy = 0;
      b.el.classList.add("held");
    });
    b.el.addEventListener("pointermove", e => {
      if (!drag || drag.b !== b) return;
      const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly, now = performance.now();
      const dt = Math.max(16, now - drag.t);
      b.x += dx; b.y += dy;
      b.vx = (dx / dt) * 16; b.vy = (dy / dt) * 16;
      drag.lx = e.clientX; drag.ly = e.clientY; drag.t = now;
      drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.ox, e.clientY - drag.oy));
    });
    const release = () => {
      if (!drag || drag.b !== b) return;
      b.held = false;
      b.el.classList.remove("held");
      if (drag.moved < 5) { b.vx = b.vy = 0; toggle(b.el.dataset.tag); }
      drag = null;
    };
    b.el.addEventListener("pointerup", release);
    b.el.addEventListener("pointercancel", release);
    b.el.addEventListener("dblclick", () => (location.href = b.el.dataset.href));
    b.el.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); toggle(b.el.dataset.tag); }
    });
  });

  /* physics */
  const step = () => {
    for (const b of bodies) {
      if (b.held) continue;
      if (!still) { b.vx += (Math.random() - 0.5) * 0.06; b.vy += (Math.random() - 0.5) * 0.06; }
      b.vx *= 0.985; b.vy *= 0.985;
      b.x += b.vx; b.y += b.vy;
      if (b.x < b.r) { b.x = b.r; b.vx = Math.abs(b.vx) * 0.8; }
      if (b.x > W - b.r) { b.x = W - b.r; b.vx = -Math.abs(b.vx) * 0.8; }
      if (b.y < b.r) { b.y = b.r; b.vy = Math.abs(b.vy) * 0.8; }
      if (b.y > H - b.r) { b.y = H - b.r; b.vy = -Math.abs(b.vy) * 0.8; }
    }
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], c = bodies[j];
        const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy) || 0.01, min = a.r + c.r + 4;
        if (d >= min) continue;
        const nx = dx / d, ny = dy / d, push = (min - d) / 2;
        if (!a.held) { a.x -= nx * push; a.y -= ny * push; }
        if (!c.held) { c.x += nx * push; c.y += ny * push; }
        const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rel < 0) {
          const k = -rel * 0.9;
          if (!a.held) { a.vx -= nx * k; a.vy -= ny * k; }
          if (!c.held) { c.vx += nx * k; c.vy += ny * k; }
        }
      }
    }
    paint();
    requestAnimationFrame(step);
  };
  const paint = () => { for (const b of bodies) b.el.style.transform = `translate(${b.x - b.r}px, ${b.y - b.r}px)`; };
  addEventListener("resize", () => { W = field.clientWidth; H = field.clientHeight; });
  field.classList.add("live");
  paint();
  requestAnimationFrame(step);

  /* filtering */
  const cards = [...document.querySelectorAll(".filter-grid .card")];
  const status = document.querySelector(".filter-status");
  const clear = document.querySelector(".filter-clear");
  let current = null;
  function toggle(tag) {
    current = current === tag ? null : tag;
    let shown = 0;
    cards.forEach(c => {
      const ok = !current || (c.dataset.tags || "").split("|").includes(current);
      c.hidden = !ok;
      shown += ok;
    });
    bodies.forEach(b => b.el.classList.toggle("on", b.el.dataset.tag === current));
    document.querySelectorAll(".tagcloud .tag").forEach(t => t.classList.toggle("on", t.dataset.tag === current));
    status.textContent = current ? `${shown} entr${shown === 1 ? "y" : "ies"} tagged #${current}` : "all entries";
    clear.hidden = !current;
  }
  clear.addEventListener("click", () => toggle(current));
  // plain clicks on the tag pills filter too; ctrl/cmd-click still opens the tag page
  document.querySelectorAll(".tagcloud .tag").forEach(t => t.addEventListener("click", e => {
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    toggle(t.dataset.tag);
  }));
})();
