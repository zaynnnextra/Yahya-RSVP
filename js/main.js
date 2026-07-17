(function () {
  "use strict";

  var CONFIG = window.YAHYA_CONFIG || {};
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ─── Envelope intro ─────────────────────────────────────────────────
  var overlay = document.getElementById("envelope-overlay");
  var envelope = document.getElementById("envelope");
  var seal = document.getElementById("seal");
  var invitation = document.getElementById("invitation");
  var opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    envelope.classList.add("open");
    var delay = reducedMotion ? 150 : 1150;
    setTimeout(function () {
      invitation.hidden = false;
      spawnSparkles();
      observeReveals();
      initParallax();
      overlay.classList.add("fade-out");
      setTimeout(function () { overlay.remove(); }, 900);
    }, delay);
  }

  seal.addEventListener("click", openEnvelope);
  overlay.addEventListener("click", openEnvelope);
  // Auto-open so nobody gets stuck on the envelope.
  setTimeout(openEnvelope, reducedMotion ? 1500 : 9000);

  // ─── Sparkles ───────────────────────────────────────────────────────
  var SPARKLE_CHARS = ["✦", "✧", "✶", "·"];

  function spawnSparkles() {
    document.querySelectorAll(".sparkle-field").forEach(function (field) {
      var count = parseInt(field.dataset.sparkles || "10", 10);
      for (var i = 0; i < count; i++) {
        var s = document.createElement("span");
        s.className = "sparkle";
        s.textContent = SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)];
        s.style.left = (Math.random() * 96 + 2) + "%";
        s.style.top = (Math.random() * 92 + 4) + "%";
        s.style.fontSize = (Math.random() * 12 + 8) + "px";
        s.style.animationDelay = (Math.random() * 4).toFixed(2) + "s";
        s.style.animationDuration = (Math.random() * 2 + 2.2).toFixed(2) + "s";
        field.appendChild(s);
      }
    });
  }

  // ─── Subtle parallax on hero art ────────────────────────────────────
  function initParallax() {
    if (reducedMotion) return;
    var items = [].slice.call(document.querySelectorAll(".parallax"));
    if (!items.length) return;
    var ticking = false;
    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      items.forEach(function (el) {
        var depth = parseFloat(el.dataset.depth || "0.1");
        el.style.setProperty("--px", (-y * depth).toFixed(1) + "px");
      });
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // ─── Scroll reveals ─────────────────────────────────────────────────
  function observeReveals() {
    var reveals = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("revealed"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ─── Countdown ──────────────────────────────────────────────────────
  var countdownEl = document.getElementById("countdown");
  if (countdownEl && CONFIG.EVENT && CONFIG.EVENT.dateISO) {
    var partyDate = new Date(CONFIG.EVENT.dateISO);
    var days = Math.ceil((partyDate - new Date()) / 86400000);
    if (days > 1) countdownEl.textContent = days + " days until the celebration";
    else if (days === 1) countdownEl.textContent = "The celebration is tomorrow!";
    else if (days === 0) countdownEl.textContent = "The celebration is today! 🎉";
    else countdownEl.remove();
  }

  // ─── Add to Calendar (.ics download) ────────────────────────────────
  var calendarBtn = document.getElementById("calendar-btn");
  if (calendarBtn && CONFIG.EVENT) {
    calendarBtn.addEventListener("click", function () {
      var ev = CONFIG.EVENT;
      var ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Yahya RSVP//EN",
        "BEGIN:VEVENT",
        "UID:yahya-1st-birthday@yahya-rsvp",
        "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z"),
        "DTSTART:" + ev.start,
        "DTEND:" + ev.end,
        "SUMMARY:" + ev.title,
        "LOCATION:" + ev.location.replace(/,/g, "\\,"),
        "DESCRIPTION:" + ev.description.replace(/,/g, "\\,"),
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");
      var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "yahyas-1st-birthday.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
  }

  // ─── Video: hide the section until the MP4 file exists ─────────────
  var video = document.getElementById("invite-video");
  var videoSection = document.getElementById("video-section");
  if (video && videoSection) {
    var hideIfBroken = function () {
      // NETWORK_NO_SOURCE (3) also covers a 404 that happened before this
      // script attached its listeners.
      if (video.error || video.networkState === 3) videoSection.hidden = true;
    };
    video.addEventListener("error", hideIfBroken, true);
    var source = video.querySelector("source");
    if (source) source.addEventListener("error", hideIfBroken);
    hideIfBroken();
    window.addEventListener("load", function () { setTimeout(hideIfBroken, 400); });
  }

  // ─── RSVP form ──────────────────────────────────────────────────────
  var form = document.getElementById("rsvp-form");
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("rsvp-submit");
  var doneEl = document.getElementById("rsvp-done");
  var doneBody = document.getElementById("done-body");
  var countsRow = document.getElementById("counts-row");

  // Steppers
  document.querySelectorAll(".step-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = document.getElementById("rsvp-" + btn.dataset.target);
      var next = (parseInt(input.value, 10) || 0) + parseInt(btn.dataset.step, 10);
      input.value = Math.min(20, Math.max(0, next));
    });
  });

  // Hide the headcount when declining
  document.querySelectorAll('input[name="attending"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      countsRow.classList.toggle("hidden-soft", radio.value.indexOf("Declines") !== -1 && radio.checked);
    });
  });

  function setStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.classList.toggle("ok", !!ok);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var name = document.getElementById("rsvp-name").value.trim();
    var attending = form.querySelector('input[name="attending"]:checked');
    if (!name) return setStatus("Please tell us your name ✍️");
    if (!attending) return setStatus("Please choose whether you can attend 👑");

    if (!CONFIG.RSVP_ENDPOINT) {
      return setStatus("RSVPs open soon — please check back or message us directly!");
    }

    var declining = attending.value.indexOf("Declines") !== -1;
    var payload = new URLSearchParams({
      name: name,
      attending: attending.value,
      adults: declining ? "0" : document.getElementById("rsvp-adults").value,
      kids: declining ? "0" : document.getElementById("rsvp-kids").value,
      message: document.getElementById("rsvp-message").value.trim(),
    });

    submitBtn.disabled = true;
    setStatus("Sending your royal reply…", true);

    fetch(CONFIG.RSVP_ENDPOINT, { method: "POST", body: payload })
      .then(function (res) { return res.json().catch(function () { return { ok: true }; }); })
      .then(function (data) {
        if (data && data.ok === false) throw new Error(data.error || "submit failed");
        form.hidden = true;
        doneBody.textContent = declining
          ? "We're sorry you'll miss it, " + name + " — thank you for letting us know! 💙"
          : "We can't wait to celebrate with you, " + name + "! 🎉";
        doneEl.hidden = false;
      })
      .catch(function () {
        submitBtn.disabled = false;
        setStatus("Something went wrong — please try again in a moment.");
      });
  });
})();
