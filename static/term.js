// songbird — about-page terminal.
// Files come from about.md: text before the first "##" is `whoami`,
// every "## name.txt" section becomes a file you can `cat`.
(() => {
  const term = document.querySelector(".term");
  const src = document.querySelector(".about-src");
  if (!term || !src) return;

  const out = term.querySelector(".term-out");
  const form = term.querySelector(".term-line");
  const input = term.querySelector(".term-in");
  const screen = term.querySelector(".term-screen");
  const chips = document.querySelector(".term-chips");
  const { host = "songbird", owner = "song", visitor = "guest" } = term.dataset;

  /* build the filesystem from the rendered markdown */
  const files = {};
  let whoami = "";
  let current = null;
  for (const node of [...src.children]) {
    if (node.tagName === "H2") {
      current = node.textContent.trim().replace(/\s+/g, "-");
      files[current] = "";
    } else if (current) files[current] += node.outerHTML;
    else whoami += node.outerHTML;
  }
  const names = Object.keys(files);

  const esc = s => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ps1 = term.querySelector(".term-ps1").innerHTML;
  const print = (html, cls = "") => {
    const d = document.createElement("div");
    d.className = "term-block " + cls;
    d.innerHTML = html;
    out.appendChild(d);
    screen.scrollTop = screen.scrollHeight;
  };
  const echo = cmd => print(`<span class="term-ps1">${ps1}</span> ${esc(cmd)}`, "term-cmd");

  const started = Date.now();
  const history = [];
  let hIdx = 0;

  const commands = {
    help: () => `<table class="term-help">${[
      ["whoami", "who's on the other end"],
      ["ls", "list files"],
      ["cat &lt;file&gt;", "print a file"],
      ["contact", "how to reach me"],
      ["history", "what you've typed"],
      ["clear", "wipe the screen  (ctrl+l)"],
      ["exit", "leave"],
    ].map(([c, d]) => `<tr><td class="accent">${c}</td><td>${d}</td></tr>`).join("")}</table>
      <p class="dim">tab completes · ↑↓ history</p>`,
    whoami: () => whoami || owner,
    ls: args => {
      if (args.some(a => a.startsWith("-") && a.includes("a")))
        return [".", "..", ".secrets", ...names].map(n => `<span class="${n.startsWith(".") ? "dim" : "accent"}">${esc(n)}</span>`).join("  ");
      return names.map(n => `<span class="accent">${esc(n)}</span>`).join("  ");
    },
    cat: args => {
      if (!args.length) return `<span class="dim">usage: cat &lt;file&gt; — try <span class="accent">ls</span></span>`;
      return args.map(a => {
        const f = a.replace(/^\.\//, "").replace(/^~\//, "");
        if (f === ".secrets") return `cat: .secrets: Permission denied`;
        return f in files ? `<div class="prose term-file">${files[f]}</div>` : `cat: ${esc(a)}: No such file or directory`;
      }).join("");
    },
    contact: () => commands.cat(["contact.txt"]),
    pwd: () => `/home/${owner}`,
    cd: args => args[0] && !["~", ".", `/home/${owner}`].includes(args[0]) ? `cd: ${esc(args[0])}: Permission denied` : "",
    echo: args => esc(args.join(" ")),
    date: () => new Date().toString(),
    uptime: () => `up ${Math.round((Date.now() - started) / 1000)}s, 1 user, load average: 0.00, 0.01, 0.05`,
    uname: args => args.includes("-a") ? `${host} 6.18.0-zola #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux` : host,
    hostname: () => host,
    id: () => `uid=1000(${visitor}) gid=1000(${visitor}) groups=1000(${visitor})`,
    sudo: () => `<span class="err">${visitor} is not in the sudoers file. This incident will be reported.</span>`,
    su: () => `<span class="err">su: Authentication failure</span>`,
    rm: () => `<span class="err">rm: refusing to remove anything here, nice try</span>`,
    history: () => history.map((h, i) => `<span class="dim">${String(i + 1).padStart(4)}</span>  ${esc(h)}`).join("<br>"),
    clear: () => { out.innerHTML = ""; return null; },
    exit: () => { setTimeout(() => (location.href = "/"), 700); return `logout<br><span class="dim">Connection to ${host} closed.</span>`; },
  };
  commands.logout = commands.exit;
  commands.ll = () => commands.ls(["-la"]);
  commands.man = () => commands.help();

  const run = raw => {
    const line = raw.trim();
    echo(raw);
    if (!line) return;
    history.push(line); hIdx = history.length;
    const [cmd, ...args] = line.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    const res = fn ? fn(args) : `<span class="err">${esc(cmd)}: command not found</span> <span class="dim">— try <span class="accent">help</span></span>`;
    if (res !== null && res !== "") print(res);
  };

  /* typing animation for scripted commands */
  const typeOut = (cmd, cb) => {
    let i = 0;
    input.value = "";
    const t = setInterval(() => {
      input.value = cmd.slice(0, ++i);
      if (i >= cmd.length) { clearInterval(t); setTimeout(() => { input.value = ""; run(cmd); cb && cb(); }, 220); }
    }, 55);
  };

  form.addEventListener("submit", e => { e.preventDefault(); run(input.value); input.value = ""; });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && history.length) { e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] ?? ""; }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
    else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.value.split(/\s+/);
      const last = parts.pop();
      const pool = parts.length ? names : Object.keys(commands);
      const hits = pool.filter(n => n.startsWith(last));
      if (hits.length === 1) input.value = [...parts, hits[0]].join(" ") + (parts.length ? "" : " ");
      else if (hits.length > 1) { echo(input.value); print(hits.map(h => `<span class="accent">${esc(h)}</span>`).join("  ")); }
    }
  });
  screen.addEventListener("click", () => { if (!getSelection().toString()) input.focus({ preventScroll: true }); });
  chips?.querySelectorAll("button").forEach(b => b.addEventListener("click", () => { run(b.dataset.cmd); input.focus({ preventScroll: true }); }));

  /* switch from static content to terminal */
  src.hidden = true;
  term.hidden = false;
  if (chips) chips.hidden = false;
  print(`<span class="dim">${host === "tty1" ? "" : host + " "}tty1 · last login: ${new Date(Date.now() - 864e5).toDateString()} from 10.0.0.1</span>`);
  print(`<span class="dim">type <span class="accent">help</span> to see what you can do.</span>`);
  setTimeout(() => typeOut("whoami"), 500);
})();
