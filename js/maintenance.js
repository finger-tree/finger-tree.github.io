(function () {
  var CALENDAR_URL = "../assets/calendar.json";
  var CATEGORIES_URL = "../assets/categories.json";

  var listEl = document.getElementById("maintenanceList");
  var loadingEl = document.getElementById("maintenanceLoading");
  var errorEl = document.getElementById("maintenanceError");

  function getUrl(path) {
    return new URL(path, document.baseURI || window.location.href).href;
  }

  function diffUnits(fromDate, toDate) {
    var ms = (toDate || new Date()) - fromDate;
    if (ms < 0) ms = 0;
    var totalSec = Math.floor(ms / 1000);
    var sec = totalSec % 60;
    var totalMin = Math.floor(totalSec / 60);
    var min = totalMin % 60;
    var totalHour = Math.floor(totalMin / 60);
    var hour = totalHour % 24;
    var totalDay = Math.floor(totalHour / 24);
    var year = Math.floor(totalDay / 365);
    var day = totalDay % 365;
    var month = Math.floor(day / 30);
    day = day % 30;
    return { year: year, month: month, day: day, hour: hour, min: min, sec: sec };
  }

  function formatCounter(u) {
    var pad = function (n) { return (n < 10 ? "0" : "") + n; };
    return pad(u.year) + "y " + pad(u.month) + "m " + pad(u.day) + "d " + pad(u.hour) + "h " + pad(u.min) + "m " + pad(u.sec) + "s";
  }

  function daysSince(date) {
    return ((new Date()) - date) / (24 * 60 * 60 * 1000);
  }

  function rowClassForDays(days) {
    if (days < 0) return "maintenance-item--green";
    if (days < 7) return "maintenance-item--green";
    if (days < 30) return "maintenance-item--yellow";
    return "maintenance-item--red";
  }

  function tickCounters() {
    var items = listEl.querySelectorAll(".maintenance-item[data-last-start]");
    items.forEach(function (li) {
      var lastStart = new Date(li.getAttribute("data-last-start"));
      var u = diffUnits(lastStart);
      var counterEl = li.querySelector(".maintenance-counter");
      if (counterEl) counterEl.textContent = formatCounter(u);
      var days = daysSince(lastStart);
      li.classList.remove("maintenance-item--green", "maintenance-item--yellow", "maintenance-item--red");
      li.classList.add(rowClassForDays(days));
    });
    var noneItems = listEl.querySelectorAll(".maintenance-item--none");
    noneItems.forEach(function (li) {
      li.classList.remove("maintenance-item--green", "maintenance-item--yellow", "maintenance-item--red");
      li.classList.add("maintenance-item--red");
    });
  }

  var tickInterval;

  function render(categories, events) {
    var eventStarts = (events || []).map(function (ev) {
      return {
        category: (ev.category || "").trim(),
        start: new Date(ev.start),
        title: ev.title || "",
      };
    });

    var lastByCategory = {};
    eventStarts.forEach(function (ev) {
      if (!ev.category) return;
      var key = ev.category.toLowerCase().replace(/\s+/g, "");
      var existing = lastByCategory[key];
      if (!existing || ev.start > existing.start) {
        lastByCategory[key] = { start: ev.start, title: ev.title, category: ev.category };
      }
    });

    loadingEl.classList.add("hidden");
    errorEl.classList.add("hidden");

    if (!categories || !categories.length) {
      listEl.innerHTML = "<li class=\"maintenance-empty\">No categories defined. Add <code>assets/categories.json</code> with a <code>categories</code> array.</li>";
      return;
    }

    if (tickInterval) clearInterval(tickInterval);

    listEl.innerHTML = categories.map(function (cat) {
      var key = (cat || "").toLowerCase().replace(/\s+/g, "");
      var last = lastByCategory[key];
      var displayName = typeof cat === "string" ? cat : (cat.name || cat.id || "—");
      if (last) {
        var lastStart = last.start;
        var u = diffUnits(lastStart);
        var days = daysSince(lastStart);
        var rowClass = rowClassForDays(days);
        return (
          "<li class=\"maintenance-item " + rowClass + "\" data-last-start=\"" + lastStart.toISOString() + "\">" +
          "<span class=\"maintenance-category\">" + escapeHtml(displayName) + "</span>" +
          "<span class=\"maintenance-counter\" aria-label=\"Time since last session\">" + escapeHtml(formatCounter(u)) + "</span>" +
          "<span class=\"maintenance-title\">" + escapeHtml(last.title) + "</span>" +
          "</li>"
        );
      }
      return (
        "<li class=\"maintenance-item maintenance-item--none maintenance-item--red\">" +
        "<span class=\"maintenance-category\">" + escapeHtml(displayName) + "</span>" +
        "<span class=\"maintenance-counter\">—</span>" +
        "</li>"
      );
    }).join("");

    tickInterval = setInterval(tickCounters, 1000);
    tickCounters();
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function showError(msg) {
    loadingEl.classList.add("hidden");
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
    listEl.innerHTML = "";
  }

  function runWith(calendar, categoriesData) {
    var categories = (categoriesData && (categoriesData.categories || categoriesData)) || [];
    var events = (calendar && calendar.events) || [];
    render(Array.isArray(categories) ? categories : [], events);
  }

  var inlineCalendar = (function () {
    var el = document.getElementById("inline-calendar-json");
    if (!el || !el.textContent) return null;
    try { return JSON.parse(el.textContent.trim()); } catch (e) { return null; }
  })();
  var inlineCategories = (function () {
    var el = document.getElementById("inline-categories-json");
    if (!el || !el.textContent) return null;
    try { return JSON.parse(el.textContent.trim()); } catch (e) { return null; }
  })();

  function tryFetch(url) {
    return fetch(getUrl(url), { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      });
  }

  Promise.all([
    tryFetch(CALENDAR_URL).catch(function () { return inlineCalendar; }),
    tryFetch(CATEGORIES_URL).catch(function () { return inlineCategories; }),
  ])
    .then(function (results) {
      var calendar = results[0];
      var categoriesData = results[1];
      if (!calendar && !inlineCalendar) {
        showError("Could not load calendar. Use a local server (e.g. npx serve .) or deploy.");
        return;
      }
      if (!categoriesData && !inlineCategories) {
        showError("Could not load categories. Use a local server or add inline data.");
        return;
      }
      runWith(calendar || inlineCalendar, categoriesData || inlineCategories);
    })
    .catch(function (err) {
      if (inlineCalendar && inlineCategories) {
        runWith(inlineCalendar, inlineCategories);
        return;
      }
      var msg = err.message || "Failed to load data.";
      if (window.location.protocol === "file:") {
        msg += " Use a local server (e.g. npx serve .) or deploy to GitHub Pages.";
      }
      showError(msg);
    });
})();
