(() => {
  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const THEME_KEY = "tk-theme";
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const toggle = document.querySelector("[data-theme-toggle]");

  const saveTheme = (value) => {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* storage unavailable: the choice lasts for this visit only */
    }
  };
  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
  const syncToggle = () => {
    if (!toggle) return;
    const dark = currentTheme() === "dark";
    toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  };

  toggle?.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    saveTheme(next);
    syncToggle();
  });
  darkQuery.addEventListener?.("change", syncToggle);
  new MutationObserver(syncToggle).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  syncToggle();

  /* ---------- Section indicator in the nav ---------- */
  const navLinks = [...document.querySelectorAll("[data-nav]")];
  const navTargets = navLinks.map((a) => document.querySelector(a.getAttribute("href")));
  let navFrame = 0;
  const updateNav = () => {
    navFrame = 0;
    const line = window.innerHeight * 0.45;
    let active = 0;
    navTargets.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top < line) active = i;
    });
    navLinks.forEach((a, i) => a.setAttribute("aria-current", i === active ? "true" : "false"));
  };
  window.addEventListener(
    "scroll",
    () => {
      if (!navFrame) navFrame = requestAnimationFrame(updateNav);
    },
    { passive: true }
  );
  updateNav();

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const label = btn.querySelector("[data-copy-label]");
    const icon = btn.querySelector("use");
    let timer;
    const show = (text, done) => {
      if (label) label.textContent = text;
      if (icon) icon.setAttribute("href", done ? "#i-check" : "#i-copy");
      btn.dataset.state = done ? "done" : "";
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (label) label.textContent = "Copy";
        if (icon) icon.setAttribute("href", "#i-copy");
        btn.dataset.state = "";
      }, 2200);
    };
    btn.addEventListener("click", () => {
      const text = btn.dataset.copy;
      const selectFallback = () => {
        const target = document.getElementById(btn.getAttribute("aria-controls"));
        if (target) {
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
        show("Selected", false);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => show("Copied", true), selectFallback);
      } else {
        selectFallback();
      }
    });
  });

  /* ---------- Philadelphia clock ---------- */
  const clock = document.querySelector("[data-clock]");
  if (clock) {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      minute: "2-digit",
    });
    const tick = () => {
      const now = new Date();
      clock.textContent = `${fmt.format(now)} ET`;
      clock.setAttribute("datetime", now.toISOString());
    };
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- Project videos: play only while visible ---------- */
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const videos = [...document.querySelectorAll("video[data-autoplay]")];
  if (videos.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting && !reduceMotion.matches) target.play().catch(() => {});
          else target.pause();
        });
      },
      { threshold: 0.35 }
    );
    videos.forEach((v) => io.observe(v));
  }

  /* ---------- Book a shoot ---------- */
  const form = document.querySelector("[data-book-form]");
  if (form) {
    const status = form.querySelector("[data-book-status]");
    const say = (text, tone = "") => {
      status.textContent = text;
      status.dataset.tone = tone;
    };
    form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const get = (k) => String(data.get(k) || "").trim();
      const name = get("name");
      const email = get("email");
      const type = get("type") || "Photo shoot";
      const where = get("where");
      const details = get("details");
      const rawDate = get("date");

      if (!name) {
        form.elements.name.setAttribute("aria-invalid", "true");
        form.elements.name.focus();
        return say("Add your name so I know who's asking.", "error");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.elements.email.setAttribute("aria-invalid", "true");
        form.elements.email.focus();
        return say("Add an email address I can reply to.", "error");
      }

      const date = rawDate
        ? new Date(`${rawDate}T12:00:00`).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })
        : "Flexible";
      const body = [
        "Hi Theodore,",
        "",
        `I'd like to book a photo shoot (${type}).`,
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Preferred date: ${date}`,
        `Location: ${where || "Open to ideas"}`,
        "",
        details,
      ].join("\n");
      const subject = `Photo shoot request: ${type}`;
      window.location.href = `mailto:theok1384@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      say("Your email app should open with this request filled in. If nothing opens, email theok1384@gmail.com directly.");
    });
  }

  /* ---------- Photography ---------- */
  const photos = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];
  const reel = document.querySelector("[data-reel]");
  const sheetWrap = document.querySelector("[data-sheet-wrap]");
  const sheet = document.querySelector("[data-sheet]");
  const sheetNote = document.querySelector("[data-sheet-note]");
  const tilts = [-2.2, 1.6, -1, 2.4, -1.8, 1.1];

  const el = (tag, props = {}, children = []) => {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "textContent") node.textContent = v;
      else if (k === "style") node.style.cssText = v;
      else if (k in node && typeof v !== "string") node[k] = v;
      else node.setAttribute(k, v);
    });
    children.forEach((c) => node.append(c));
    return node;
  };

  const describe = (p) => [p.caption, p.place].filter(Boolean).join(" · ");

  if (reel) {
    const track = el("div", { class: "reel-track" });
    if (photos.length) {
      // Two copies of the set so the drift loops without a seam.
      for (let copy = 0; copy < 2; copy++) {
        photos.forEach((p, i) => {
          const img = el("img", {
            src: p.thumb || p.src,
            alt: copy ? "" : p.alt || describe(p),
            width: String(p.width || 3),
            height: String(p.height || 2),
            loading: "lazy",
            decoding: "async",
          });
          const btn = el(
            "button",
            {
              class: "print",
              type: "button",
              style: `--tilt:${tilts[i % tilts.length]}deg`,
              "aria-label": `Open photo: ${describe(p) || "untitled"}`,
            },
            [img]
          );
          if (copy) {
            btn.tabIndex = -1;
            btn.setAttribute("aria-hidden", "true");
            btn.dataset.dupe = "";
          }
          btn.addEventListener("click", () => openLightbox(i));
          track.append(btn);
        });
      }
      track.style.setProperty("--reel-speed", `${Math.max(40, photos.length * 12)}s`);
    } else {
      for (let i = 0; i < 6; i++) {
        track.append(
          el("div", { class: "print print--blank", style: `--tilt:${tilts[i]}deg`, "aria-hidden": "true" }, [
            el("div", { class: "blank" }, [
              el("span", { class: "mono", textContent: `Frame ${String(i + 1).padStart(2, "0")}` }),
              el("span", { class: "mono", textContent: "Developing" }),
            ]),
          ])
        );
      }
    }
    reel.append(track);
  }

  if (sheet && photos.length) {
    photos.forEach((p, i) => {
      const n = i + 1;
      const cell = el(
        "button",
        { class: "frame-cell", type: "button", "aria-label": `Open photo ${n}: ${describe(p) || "untitled"}` },
        [
          el("span", { class: "shot-box" }, [
            el("img", { src: p.thumb || p.src, alt: "", loading: "lazy", decoding: "async" }),
          ]),
          el("span", { class: "frame-num", "aria-hidden": "true" }, [
            el("span", { textContent: String(n) }),
            el("span", { textContent: `▸ ${n}A` }),
          ]),
        ]
      );
      cell.addEventListener("click", () => openLightbox(i));
      sheet.append(cell);
    });
  } else {
    if (sheetWrap) sheetWrap.hidden = true;
    if (sheetNote) sheetNote.hidden = false;
  }

  /* ---------- Lightbox ---------- */
  const dialog = document.getElementById("lightbox");
  const lbImg = dialog?.querySelector("[data-lb-img]");
  const lbCap = dialog?.querySelector("[data-lb-cap]");
  const lbCount = dialog?.querySelector("[data-lb-count]");
  let index = 0;

  const show = (i) => {
    if (!photos.length || !lbImg) return;
    index = (i + photos.length) % photos.length;
    const p = photos[index];
    lbImg.src = p.src;
    lbImg.alt = p.alt || describe(p);
    lbCap.textContent = describe(p);
    lbCount.textContent = `${String(index + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    const next = photos[(index + 1) % photos.length];
    if (next) new Image().src = next.src;
  };

  function openLightbox(i) {
    if (!dialog) return;
    show(i);
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  if (dialog) {
    const close = () => (typeof dialog.close === "function" ? dialog.close() : dialog.removeAttribute("open"));
    dialog.querySelector("[data-lb-close]")?.addEventListener("click", close);
    dialog.querySelector("[data-lb-prev]")?.addEventListener("click", () => show(index - 1));
    dialog.querySelector("[data-lb-next]")?.addEventListener("click", () => show(index + 1));
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target.classList.contains("lb-stage")) close();
    });
    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(index + 1);
      if (e.key === "ArrowLeft") show(index - 1);
    });
    let startX = null;
    dialog.addEventListener("pointerdown", (e) => (startX = e.clientX));
    dialog.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    });
  }
})();
