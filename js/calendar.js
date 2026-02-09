(function () {
  const monthTitle = document.getElementById("monthTitle");
  const calendarTimeHours = document.getElementById("calendarTimeHours");
  const calendarTimeBody = document.getElementById("calendarTimeBody");
  const calendarLoading = document.getElementById("calendarLoading");
  const calendarError = document.getElementById("calendarError");
  const calendarTooltip = document.getElementById("calendarTooltip");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  let allEvents = [];
  let currentView = new Date();

  function parseCalendarJSON(json) {
    if (!json || !json.events) return [];
    return json.events.map(function (ev) {
      return {
        title: ev.title || "",
        description: ev.description || "",
        category: ev.category || "",
        start: new Date(ev.start),
        end: new Date(ev.end),
      };
    });
  }


  function getActivityClass(ev) {
    var category = (ev.category || "").toLowerCase();

    if (category.includes("mathematics")) return "calendar-event-bar--reading";
    if (category.includes("support")) return "calendar-event-bar--support";
    if (category.includes("crisis")) return "calendar-event-bar--crisis";
    if (category.includes("programming")) return "calendar-event-bar--practical";
    if (category.includes("job")) return "calendar-event-bar--job";
    if (category.includes("running")) return "calendar-event-bar--running";

    return "";
  }


  function dateKey(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function eventsByDate(events, year, month) {
    const byDate = {};
    events.forEach(function (ev) {
      const start = ev.start;
      if (start.getFullYear() !== year || start.getMonth() !== month) return;
      const key = dateKey(start);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(ev);
    });
    return byDate;
  }

  function minutesFromMidnight(d) {
    return d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  }

  function formatTime(d) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  function containsLatex(text) {
    if (!text) return false;
    return /\$[^$]+\$/.test(text);
  }

  function renderTimeGrid(year, month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    monthTitle.textContent = monthNames[month] + " " + year;

    var hoursHtml = "";
    for (var h = 0; h < 24; h++) {
      var label = String(h).padStart(2, "0") + ":00";
      hoursHtml += '<div class="calendar-time-hour-label">' + escapeHtml(label) + "</div>";
    }
    calendarTimeHours.innerHTML = hoursHtml;

    var last = new Date(year, month + 1, 0);
    var daysInMonth = last.getDate();
    var byDate = eventsByDate(allEvents, year, month);

    var bodyHtml = "";
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(year, month, day);
      var key = dateKey(d);
      var dayEvents = byDate[key] || [];
      var dayLabel = dayNames[d.getDay()] + " " + day;
      bodyHtml += '<div class="calendar-time-row">';
      bodyHtml += '<div class="calendar-time-daylabel">' + escapeHtml(dayLabel) + "</div>";
      bodyHtml += '<div class="calendar-time-daystrip">';
      for (var h = 0; h < 24; h++) {
        bodyHtml += '<div class="calendar-time-hour-slot"></div>';
      }
      dayEvents.forEach(function (ev) {
        var startMins = minutesFromMidnight(ev.start);
        var endMins = ev.end ? minutesFromMidnight(ev.end) : startMins + 60;
        var leftPct = (startMins / 1440) * 100;
        var widthPct = Math.max(((endMins - startMins) / 1440) * 100, 2);
        var titleHtml = escapeHtml(ev.title);
        var details = "Start: " + formatTime(ev.start) + "\nEnd: " + (ev.end ? formatTime(ev.end) : "") + "\nTitle: " + ev.title + "\nDescription: " + (ev.description || "—") + "\nCategory: " + (ev.category || "—");
        var barClass = "calendar-event-bar " + (getActivityClass(ev) || "");
        bodyHtml += '<div class="' + barClass.trim() + '" style="left:' + leftPct + "%;width:" + widthPct + '%;" data-details="' + details.replace(/"/g, "&quot;") + '" title="' + escapeHtml(ev.title) + '">';
        bodyHtml += '<span class="calendar-event-bar-title">' + titleHtml + "</span>";
        bodyHtml += "</div>";
      });
      bodyHtml += "</div></div>";
    }
    calendarTimeBody.innerHTML = bodyHtml;

    calendarTimeBody.querySelectorAll(".calendar-event-bar").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var details = el.getAttribute("data-details");
        if (!details) return;

        var lines = details.split("\n");
        var html = [];

        lines.forEach(function (line) {
          // Detect Description line
          if (line.startsWith("Description:")) {
            var desc = line.replace("Description:", "").trim();

            if (containsLatex(desc)) {
              // LaTeX mode (do NOT escape)
              html.push("<div><b>Description:</b> " + desc + "</div>");
            } else {
              // Normal text mode (escape)
              html.push("<div><b>Description:</b> " + escapeHtml(desc) + "</div>");
            }

          } else {
            // Normal lines
            html.push("<div>" + escapeHtml(line) + "</div>");
          }
        });

        calendarTooltip.innerHTML = html.join("");
        calendarTooltip.classList.remove("hidden");
        calendarTooltip.style.transform = "none";

        // Positioning logic
        var rect = el.getBoundingClientRect();
        var ttRect = calendarTooltip.getBoundingClientRect();
        var left = rect.left;
        var top = rect.top - ttRect.height - 8;
        if (top < 8) top = rect.bottom + 8;
        if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
        if (left < 8) left = 8;
        calendarTooltip.style.left = left + "px";
        calendarTooltip.style.top = top + "px";

        // 🔥 Trigger MathJax render only if needed
        if (window.renderKatex && containsLatex(details)) {
          renderKatex(calendarTooltip);
        }

      });

    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function applyView() {
    var y = currentView.getFullYear();
    var m = currentView.getMonth();
    renderTimeGrid(y, m);
  }

  prevBtn.addEventListener("click", function () {
    currentView.setMonth(currentView.getMonth() - 1);
    applyView();
  });
  nextBtn.addEventListener("click", function () {
    currentView.setMonth(currentView.getMonth() + 1);
    applyView();
  });

  function useCalendarJSON(json) {
    allEvents = parseCalendarJSON(json);
    calendarLoading.classList.add("hidden");
    calendarError.classList.add("hidden");
    applyView();
  }

  function showLoadError(msg) {
    calendarLoading.classList.add("hidden");
    calendarError.textContent = msg;
    calendarError.classList.remove("hidden");
  }

  const scriptUrl = new URL(document.currentScript.src);
  const basePath = scriptUrl.pathname.replace(/\/js\/[^/]+$/, "");
  const jsonUrl = basePath + "../assets/calendar.json";
  // ---- ONLY external JSON loading ----
  fetch(jsonUrl, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("Failed to load calendar: " + r.status);
      return r.json();
    })
    .then(function (json) {
      useCalendarJSON(json);
    })
    .catch(function (err) {
      showLoadError(err.message || "Could not load calendar.json");
    });

})();