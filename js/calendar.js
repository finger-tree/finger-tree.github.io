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

  var ACTIVITY_TYPES = {
    meeting: { label: "Meeting", class: "calendar-event-bar--meeting" },
    deadline: { label: "Deadline", class: "calendar-event-bar--deadline" },
    workshop: { label: "Workshop", class: "calendar-event-bar--workshop" },
    holiday: { label: "Holiday", class: "calendar-event-bar--holiday" },
    "1:1": { label: "1:1", class: "calendar-event-bar--1on1" },
    default: { label: "Event", class: "" },
  };
  function getActivityClass(ev) {
    var key = (ev.category || "").toLowerCase().replace(/\s+/g, "");
    if (key === "1:1" || key === "1on1") return ACTIVITY_TYPES["1:1"].class;
    return (ACTIVITY_TYPES[key] || ACTIVITY_TYPES.default).class;
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
        bodyHtml += '<div class="' + barClass.trim() + '" style="left:' + leftPct + "%;width:" + widthPct + '%;" data-details="' + escapeHtml(details).replace(/"/g, "&quot;") + '" title="' + escapeHtml(ev.title) + '">';
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
        calendarTooltip.innerHTML = details.split("\n").map(function (s) { return escapeHtml(s); }).join("<br>");
        calendarTooltip.classList.remove("hidden");
        calendarTooltip.style.transform = "none";
        var rect = el.getBoundingClientRect();
        var ttRect = calendarTooltip.getBoundingClientRect();
        var left = rect.left;
        var top = rect.top - ttRect.height - 8;
        if (top < 8) top = rect.bottom + 8;
        if (left + ttRect.width > window.innerWidth - 8) left = window.innerWidth - ttRect.width - 8;
        if (left < 8) left = 8;
        calendarTooltip.style.left = left + "px";
        calendarTooltip.style.top = top + "px";
      });
      el.addEventListener("mouseleave", function () {
        calendarTooltip.classList.add("hidden");
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

  // ---- ONLY external JSON loading ----
  fetch("../assets/calendar.json", { cache: "no-cache" })
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