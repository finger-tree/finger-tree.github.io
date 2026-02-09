(function () {
  const scriptUrl = new URL(document.currentScript.src);
  const basePath = scriptUrl.pathname.replace(/\/js\/[^/]+$/, "");

  const CALENDAR_URL = basePath + "../assets/calendar.json";
  const CATEGORIES_URL = basePath + "../assets/categories.json";

  const listEl = document.getElementById("maintenanceList");
  const loadingEl = document.getElementById("maintenanceLoading");
  const errorEl = document.getElementById("maintenanceError");

  function diffUnits(targetDate, now = new Date()) {
    if (!(targetDate instanceof Date) || isNaN(targetDate.getTime())) {
      console.warn("Invalid targetDate:", targetDate);
      return {
        sign: "T-",
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        min: 0,
        sec: 0
      };
    }

    const ms = targetDate.getTime() - now.getTime();
    const isFutureOrNow = ms >= 0;
    const absMs = Math.abs(ms);

    const totalSeconds = Math.floor(absMs / 1000);
    const sec = totalSeconds % 60;

    const totalMinutes = Math.floor(totalSeconds / 60);
    const min = totalMinutes % 60;

    const totalHours = Math.floor(totalMinutes / 60);
    const hour = totalHours % 24;

    const totalDays = Math.floor(totalHours / 24);

    const year = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const month = Math.floor(remainingDays / 30);
    const day = remainingDays % 30;

    return {
      sign: isFutureOrNow ? "T-" : "T+",
      year,
      month,
      day,
      hour,
      min,
      sec
    };
  }

  function formatCounter(diff, options = {}) {
    const {
        padSingleDigit = true
    } = options;

    const pad = (num) => padSingleDigit ? num.toString().padStart(2, '0') : num.toString();

    const parts = [
        `${pad(diff.year)}y`,
        `${pad(diff.month)}m`,
        `${pad(diff.day)}d`,
        `${pad(diff.hour)}h`,
        `${pad(diff.min)}m`,
        `${pad(diff.sec)}s`
    ];

    return `${diff.sign} ${parts.join(' ')}`.trim();
}
   

  function daysSince(date) {
    return (Math.abs(date - new Date())) / (24 * 60 * 60 * 1000);
  }

  function rowClassForDays(days) {
    if (days < 7) return "maintenance-item--green";
    if (days < 30) return "maintenance-item--yellow";
    return "maintenance-item--red";
  }

  function tickCounters() {
    const now = new Date();
    const items = listEl.querySelectorAll(".maintenance-item[data-last-start]");

    items.forEach((li) => {
      const raw = li.getAttribute("data-last-start");
      const lastStart = new Date(raw);
      if (isNaN(lastStart.getTime())) return;

      const u = diffUnits(lastStart, now);
      const formatted = formatCounter(u);

      const counterEl = li.querySelector(".maintenance-counter");
      if (counterEl) {
        counterEl.textContent = formatted;
      }

      const days = daysSince(lastStart);
      li.classList.remove("maintenance-item--green", "maintenance-item--yellow", "maintenance-item--red");
      li.classList.add(rowClassForDays(days));
    });

    // Items without any session
    const noneItems = listEl.querySelectorAll(".maintenance-item--none");
    noneItems.forEach((li) => {
      li.classList.remove("maintenance-item--green", "maintenance-item--yellow", "maintenance-item--red");
      li.classList.add("maintenance-item--red");
    });
  }

  let tickInterval;

  function render(categories, events) {
    const eventStarts = (events || []).map((ev) => ({
      category: (ev.category || "").trim(),
      start: new Date(ev.start),
      title: ev.title || "",
    }));

    const lastByCategory = {};
    eventStarts.forEach((ev) => {
      if (!ev.category) return;
      const key = ev.category.toLowerCase().replace(/\s+/g, "");
      const existing = lastByCategory[key];
      if (!existing || ev.start > existing.start) {
        lastByCategory[key] = { start: ev.start, title: ev.title, category: ev.category };
      }
    });

    loadingEl.classList.add("hidden");
    errorEl.classList.add("hidden");

    if (!categories || !categories.length) {
      listEl.innerHTML = `<li class="maintenance-empty">No categories defined in categories.json</li>`;
      return;
    }

    if (tickInterval) clearInterval(tickInterval);

    listEl.innerHTML = categories.map((cat) => {
      const key = (typeof cat === "string" ? cat : (cat.name || cat.id || "—"))
        .toLowerCase()
        .replace(/\s+/g, "");
      const last = lastByCategory[key];
      const displayName = typeof cat === "string" ? cat : (cat.name || cat.id || "—");
      const hasLast = !!last;
      const lastStart = hasLast ? last.start : null;
      const rowClass = hasLast ? rowClassForDays(daysSince(lastStart)) : "maintenance-item--red";
      const dataAttr = hasLast ? `data-last-start="${lastStart.toISOString()}"` : "";
      const counterContent = hasLast ? "" : "—";

      return `
        <li class="maintenance-item ${rowClass} ${!hasLast ? 'maintenance-item--none' : ''}" ${dataAttr}>
          <span class="maintenance-category">${escapeHtml(displayName)}</span>
          <span class="maintenance-counter" aria-label="Time since last session"></span>
        </li>
      `;
    }).join("");

    tickInterval = setInterval(tickCounters, 1000);
    tickCounters();
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function showError(msg) {
    loadingEl.classList.add("hidden");
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
    listEl.innerHTML = "";
  }

  function tryFetch(url) {
    return fetch(url, { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      });
  }

  Promise.all([
    tryFetch(CALENDAR_URL),
    tryFetch(CATEGORIES_URL),
  ])
    .then(([calendar, categoriesData]) => {
      const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
      const events = calendar.events || [];
      render(categories, events);
    })
    .catch((err) => {
      let msg = "Failed to load data: " + (err.message || "Unknown error");
      if (window.location.protocol === "file:") {
        msg += "\n\nNote: For local development, run a simple server (e.g. `npx serve`, `python -m http.server`, or VS Code Live Server). Direct file:// protocol often blocks fetch requests.";
      }
      showError(msg);
    });
})();