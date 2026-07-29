/* ==========================================================================
   Bugling Merit Badge Practice — app.js
   Vanilla JavaScript, no frameworks, no build step.

   This file:
   1. Defines the 15 bugle calls in one data array (easy to edit).
   2. Renders the call cards and the printable sign-off sheet from that
      data array.
   3. Wires up checkboxes, a "Practice This Call" modal (sheet music image +
      audio recording), filters, search, expand/collapse, printing, and
      reset — all saved to localStorage.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. BUGLE CALL DATA
     Edit this array to change call names, descriptions, or audio file names.
     `id` must stay unique and is used as the localStorage key + audio file
     base name and the sheet music image file base name. For audio, an MP3
     (id + ".mp3") is used first if present; otherwise the app falls back to
     a WAV (id + ".wav"). For images, an SVG (id + ".svg") is used first if
     present; otherwise the app falls back to a PNG (id + ".png").
     ------------------------------------------------------------------------ */
  var BUGLE_CALLS = [
    {
      id: "first-call",
      number: 1,
      name: "First Call",
      purpose: "Warns that an assembly, formation, or scheduled activity will begin soon.",
      usage: "Played a few minutes before Assembly to give everyone a heads-up to finish what they are doing and get ready to gather."
    },
    {
      id: "reveille",
      number: 2,
      name: "Reveille",
      purpose: "Signals the beginning of the day and calls everyone to arise.",
      usage: "Traditionally the first call of the day at camp, letting everyone know it is time to wake up and start morning routines."
    },
    {
      id: "assembly",
      number: 3,
      name: "Assembly",
      purpose: "Calls everyone to gather at a designated location.",
      usage: "Played whenever the group needs to form up for announcements, flag ceremonies, or the start of a scheduled activity."
    },
    {
      id: "mess",
      number: 4,
      name: "Mess",
      purpose: "Announces that a meal is ready or that it is time to report for a meal.",
      usage: "Played shortly before or at meal times so Scouts know to head to the dining hall or cooking area."
    },
    {
      id: "drill",
      number: 5,
      name: "Drill",
      purpose: "Calls personnel to drill, instruction, or training.",
      usage: "Used to gather participants for scheduled instruction periods, merit badge sessions, or skills practice."
    },
    {
      id: "fatigue",
      number: 6,
      name: "Fatigue",
      purpose: "Calls personnel to work details or routine duties.",
      usage: "Played when it is time for camp chores, cleanup details, or other routine work assignments."
    },
    {
      id: "officers",
      number: 7,
      name: "Officers",
      purpose: "Calls officers or designated leaders to assemble.",
      usage: "Used to bring together troop leaders, staff, or other designated leaders for a meeting or briefing."
    },
    {
      id: "recall",
      number: 8,
      name: "Recall",
      purpose: "Signals the end of a drill, activity, or work detail and calls participants back.",
      usage: "Played to bring an activity to a close and call participants back to a central location."
    },
    {
      id: "church",
      number: 9,
      name: "Church",
      purpose: "Calls personnel to religious services.",
      usage: "Played before scheduled worship services so attendees know it is time to gather."
    },
    {
      id: "swimming",
      number: 10,
      name: "Swimming",
      purpose: "Announces an authorized swimming period.",
      usage: "Played at the start of a designated swim time to let everyone know the waterfront is open and supervised."
    },
    {
      id: "fire",
      number: 11,
      name: "Fire",
      purpose: "Signals a fire emergency and calls everyone to respond according to the emergency plan.",
      usage: "An emergency signal used to alert camp of a fire so everyone can follow the camp's emergency procedures."
    },
    {
      id: "retreat",
      number: 12,
      name: "Retreat",
      purpose: "Traditionally signals the end of the duty day and accompanies the lowering of the flag.",
      usage: "Played in the evening, often paired with a flag ceremony, to mark the close of the official day's activities."
    },
    {
      id: "to-the-colors",
      number: 13,
      name: "To the Colors",
      purpose: "Honors the United States flag when a band is not available, often during a flag ceremony.",
      usage: "Used in place of the National Anthem during flag ceremonies when no band or recording is available."
    },
    {
      id: "call-to-quarters",
      number: 14,
      name: "Call to Quarters",
      purpose: "Directs personnel to return to their quarters for the evening.",
      usage: "Played in the evening to let everyone know it is time to head back to tents or cabins and settle in for the night."
    },
    {
      id: "taps",
      number: 15,
      name: "Taps",
      purpose: "Signals lights out and is also used at military funerals and memorial ceremonies.",
      usage: "Played at the very end of the day to signal lights out, and is also used in memorial and funeral ceremonies to honor the fallen."
    }
  ];

  var STORAGE_KEY = "buglingMeritBadgeData_v1";

  /* ------------------------------------------------------------------------
     2. STATE + PERSISTENCE
     ------------------------------------------------------------------------ */

  function getDefaultState() {
    var callState = {};
    BUGLE_CALLS.forEach(function (call) {
      callState[call.id] = {
        played: false,
        explained: false,
        expanded: false
      };
    });
    return {
      scoutName: "",
      unitNumber: "",
      counselorName: "",
      dateStarted: "",
      calls: callState
    };
  }

  var state = loadState();

  function loadState() {
    var defaults = getDefaultState();
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return defaults;
      }
      var saved = JSON.parse(raw);
      // Merge saved data into defaults so new calls/fields added later
      // don't break older saved data.
      var merged = defaults;
      merged.scoutName = typeof saved.scoutName === "string" ? saved.scoutName : "";
      merged.unitNumber = typeof saved.unitNumber === "string" ? saved.unitNumber : "";
      merged.counselorName = typeof saved.counselorName === "string" ? saved.counselorName : "";
      merged.dateStarted = typeof saved.dateStarted === "string" ? saved.dateStarted : "";
      if (saved.calls) {
        BUGLE_CALLS.forEach(function (call) {
          var savedCall = saved.calls[call.id];
          if (savedCall) {
            merged.calls[call.id] = {
              played: !!savedCall.played,
              explained: !!savedCall.explained,
              expanded: !!savedCall.expanded
            };
          }
        });
      }
      return merged;
    } catch (err) {
      // If localStorage is unavailable or data is corrupted, fall back to
      // in-memory defaults so the app still works for this page view.
      console.warn("Bugling app: could not load saved data, using defaults.", err);
      return defaults;
    }
  }

  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      // Storage may be full or disabled (e.g. private browsing). The app
      // keeps working in-memory for the current page view either way.
      console.warn("Bugling app: could not save data to localStorage.", err);
    }
  }

  /* ------------------------------------------------------------------------
     3. DOM REFERENCES
     ------------------------------------------------------------------------ */

  var els = {
    scoutName: document.getElementById("scout-name"),
    unitNumber: document.getElementById("unit-number"),
    counselorName: document.getElementById("counselor-name"),
    dateStarted: document.getElementById("date-started"),
    progressFill: document.getElementById("progress-bar-fill"),
    progressTrack: document.getElementById("progress-bar-track"),
    progressText: document.getElementById("progress-text"),
    callsContainer: document.getElementById("calls-container"),
    noResultsMessage: document.getElementById("no-results-message"),
    searchInput: document.getElementById("search-input"),
    filterButtons: Array.prototype.slice.call(document.querySelectorAll(".filter-btn")),
    expandAllBtn: document.getElementById("expand-all-btn"),
    collapseAllBtn: document.getElementById("collapse-all-btn"),
    printBtn: document.getElementById("print-btn"),
    printSheet: document.getElementById("print-sheet"),
    printTableBody: document.getElementById("print-table-body"),
    printScoutName: document.getElementById("print-scout-name"),
    printUnitNumber: document.getElementById("print-unit-number"),
    printCounselorName: document.getElementById("print-counselor-name"),
    printDateStarted: document.getElementById("print-date-started"),
    printMusicBtn: document.getElementById("print-music-btn"),
    printMusicSheet: document.getElementById("print-music-sheet"),
    resetBtn: document.getElementById("reset-btn"),
    practiceModalOverlay: document.getElementById("practice-modal-overlay"),
    practiceModal: document.getElementById("practice-modal"),
    practiceModalTitle: document.getElementById("practice-modal-title"),
    practiceModalCallName: document.getElementById("practice-modal-call-name"),
    practiceModalClose: document.getElementById("practice-modal-close"),
    practiceModalSheetMusic: document.getElementById("practice-modal-sheet-music"),
    practiceModalAudio: document.getElementById("practice-modal-audio")
  };

  var currentFilter = "all";
  var currentSearch = "";
  var currentlyPlayingAudio = null;
  var practiceModalTriggerBtn = null;

  // Cache of which sheet music image format is available for each call, so
  // the print-music button can build its packet synchronously (see note
  // above buildPrintMusicSheet for why this matters on iOS).
  // Values: "svg", "png", "none", or undefined (not checked yet).
  var sheetMusicAvailability = {};

  /* ------------------------------------------------------------------------
     4. RENDERING
     ------------------------------------------------------------------------ */

  function callStatus(callId) {
    var c = state.calls[callId];
    if (c.played && c.explained) {
      return "completed";
    }
    if (c.played || c.explained) {
      return "in-progress";
    }
    return "not-started";
  }

  function statusLabel(status) {
    if (status === "completed") return "Completed";
    if (status === "in-progress") return "In Progress";
    return "Not Started";
  }

  function buildCallCard(call) {
    var c = state.calls[call.id];
    var article = document.createElement("article");
    article.className = "call-card";
    article.id = "card-" + call.id;
    article.dataset.callId = call.id;

    var detailsId = "details-" + call.id;

    article.innerHTML =
      '<div class="call-card-header">' +
        '<div class="call-title-group">' +
          '<span class="call-number-badge" aria-hidden="true">' + call.number + '</span>' +
          '<h3>' + escapeHtml(call.name) + '</h3>' +
        '</div>' +
        '<span class="completion-indicator" data-role="indicator"></span>' +
      '</div>' +
        '<div class="audio-block" data-role="audio"></div>' +
      '<button type="button" class="practice-btn" data-role="practice-btn">' +
        '<span aria-hidden="true">&#9835;</span> Practice This Call' +
      '</button>' +
      '<div class="checkbox-row">' +
        '<label class="checkbox-field">' +
          '<input type="checkbox" data-role="played" aria-describedby="' + call.id + '-name">' +
          ' Can play this call' +
        '</label>' +
        '<label class="checkbox-field">' +
          '<input type="checkbox" data-role="explained" aria-describedby="' + call.id + '-name">' +
          ' Can explain its purpose' +
        '</label>' +
      '</div>' +
      '<span id="' + call.id + '-name" class="visually-hidden">' + escapeHtml(call.name) + '</span>' +
      '<button type="button" class="card-toggle-btn" data-role="toggle" aria-expanded="false" aria-controls="' + detailsId + '">' +
        '<span class="chevron" aria-hidden="true">&#9656;</span> More details' +
      '</button>' +
      '<div class="call-card-details" id="' + detailsId + '" hidden>' +
        '<p class="call-usage-text"><strong>When it is used:</strong> ' + escapeHtml(call.usage) + '</p>' +
      '</div>';

    // Build the always-visible audio player right on the card
    buildAudioControl(call, article.querySelector('[data-role="audio"]'));

    // Practice button opens the sheet music + audio modal for this call
    var practiceBtn = article.querySelector('[data-role="practice-btn"]');
    practiceBtn.addEventListener("click", function () {
      openPracticeModal(call, practiceBtn);
    });

    // Wire checkboxes
    var playedInput = article.querySelector('[data-role="played"]');
    var explainedInput = article.querySelector('[data-role="explained"]');
    playedInput.checked = c.played;
    explainedInput.checked = c.explained;
    playedInput.addEventListener("change", function () {
      state.calls[call.id].played = playedInput.checked;
      saveState();
      updateCallCardStatus(call.id);
      updateProgress();
      updatePrintTable();
      applyFiltersAndSearch();
    });
    explainedInput.addEventListener("change", function () {
      state.calls[call.id].explained = explainedInput.checked;
      saveState();
      updateCallCardStatus(call.id);
      updateProgress();
      updatePrintTable();
      applyFiltersAndSearch();
    });

    // Wire expand/collapse toggle
    var toggleBtn = article.querySelector('[data-role="toggle"]');
    var detailsPanel = article.querySelector(".call-card-details");
    toggleBtn.addEventListener("click", function () {
      setCardExpanded(call.id, article, toggleBtn, detailsPanel, !c.expanded);
    });

    setCardExpanded(call.id, article, toggleBtn, detailsPanel, c.expanded);

    return article;
  }

  function setCardExpanded(callId, article, toggleBtn, detailsPanel, expand) {
    state.calls[callId].expanded = expand;
    saveState();
    if (expand) {
      detailsPanel.hidden = false;
      article.classList.add("expanded");
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.innerHTML = '<span class="chevron" aria-hidden="true">&#9656;</span> Hide details';
    } else {
      detailsPanel.hidden = true;
      article.classList.remove("expanded");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.innerHTML = '<span class="chevron" aria-hidden="true">&#9656;</span> More details';
    }
  }

  function buildAudioControl(call, container) {
    container.innerHTML = "";

    var mp3Src = "audio/" + call.id + ".mp3";
    var wavSrc = "audio/" + call.id + ".wav";
    var audio = document.createElement("audio");
    audio.controls = true;
    // "metadata" (instead of "none") makes the browser check the file right
    // away, so a missing recording is detected immediately when the
    // practice modal opens rather than only after pressing play.
    audio.preload = "metadata";
    audio.setAttribute("aria-label", call.name + " audio recording");

    var missingMsg = document.createElement("p");
    missingMsg.className = "audio-missing-msg";
    missingMsg.textContent = "Audio recording not yet available.";
    missingMsg.hidden = true;

    // The browser tries each <source> in order and uses the first one that
    // loads, so listing MP3 before WAV means MP3 is preferred when both
    // exist, with WAV used automatically as a fallback.
    var mp3Source = document.createElement("source");
    mp3Source.src = mp3Src;
    mp3Source.type = "audio/mpeg";
    audio.appendChild(mp3Source);

    var wavSource = document.createElement("source");
    wavSource.src = wavSrc;
    wavSource.type = "audio/wav";
    audio.appendChild(wavSource);

    // If none of the sources are available (404, or files don't exist when
    // opened directly from disk), the browser fires an "error" event on the
    // <audio> element. We catch that and show a friendly message instead of
    // a broken player.
    audio.addEventListener("error", showMissingAudio, true);

    function showMissingAudio() {
      audio.hidden = true;
      missingMsg.hidden = false;
    }

    // Ensure only one recording plays at a time.
    audio.addEventListener("play", function () {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
        currentlyPlayingAudio.pause();
      }
      currentlyPlayingAudio = audio;
    });

    container.appendChild(audio);
    container.appendChild(missingMsg);
  }

  function buildSheetMusicDisplay(call, container) {
    container.innerHTML = "";

    var svgSrc = "images/" + call.id + ".svg";
    var pngSrc = "images/" + call.id + ".png";

    var img = document.createElement("img");
    img.className = "practice-sheet-music-img";
    img.alt = call.name + " sheet music";
    img.hidden = true;

    var missingMsg = document.createElement("p");
    missingMsg.className = "sheet-music-missing-msg";
    missingMsg.textContent = "Sheet music not yet available.";
    missingMsg.hidden = true;

    // Prefer an SVG version of the sheet music if one exists. If the SVG
    // is missing, fall back to trying the PNG before giving up and showing
    // a friendly "not yet available" message instead of a broken image.
    var triedPngFallback = false;
    img.addEventListener("error", function () {
      if (!triedPngFallback) {
        triedPngFallback = true;
        img.src = pngSrc;
        return;
      }
      img.hidden = true;
      missingMsg.hidden = false;
    });
    img.addEventListener("load", function () {
      img.hidden = false;
    });
    img.src = svgSrc;

    container.appendChild(img);
    container.appendChild(missingMsg);
  }

  function updateCallCardStatus(callId) {
    var article = document.getElementById("card-" + callId);
    if (!article) return;
    var status = callStatus(callId);
    var indicator = article.querySelector('[data-role="indicator"]');
    indicator.textContent = statusLabel(status);
    indicator.className = "completion-indicator status-" + status;
    article.dataset.status = status;
  }

  function renderAllCards() {
    els.callsContainer.innerHTML = "";
    BUGLE_CALLS.forEach(function (call) {
      var card = buildCallCard(call);
      els.callsContainer.appendChild(card);
      updateCallCardStatus(call.id);
    });
  }

  /* ------------------------------------------------------------------------
     5. PROGRESS DASHBOARD
     ------------------------------------------------------------------------ */

  function updateProgress() {
    var completedCount = 0;
    BUGLE_CALLS.forEach(function (call) {
      if (callStatus(call.id) === "completed") {
        completedCount++;
      }
    });
    var total = BUGLE_CALLS.length;
    var percent = Math.round((completedCount / total) * 100);
    els.progressFill.style.width = percent + "%";
    els.progressTrack.setAttribute("aria-valuenow", String(completedCount));
    els.progressText.textContent =
      completedCount + " of " + total + " calls completed (" + percent + "%)";
  }

  /* ------------------------------------------------------------------------
     6. FILTERS + SEARCH
     ------------------------------------------------------------------------ */

  function applyFiltersAndSearch() {
    var search = currentSearch.trim().toLowerCase();
    var visibleCount = 0;

    BUGLE_CALLS.forEach(function (call) {
      var article = document.getElementById("card-" + call.id);
      if (!article) return;

      var status = callStatus(call.id);
      var matchesFilter = currentFilter === "all" || currentFilter === status;
      var matchesSearch = search === "" || call.name.toLowerCase().indexOf(search) !== -1;
      var visible = matchesFilter && matchesSearch;

      article.classList.toggle("is-hidden", !visible);
      if (visible) {
        visibleCount++;
      }
    });

    els.noResultsMessage.hidden = visibleCount !== 0;
  }

  /* ------------------------------------------------------------------------
     7. PRACTICE MODAL (sheet music + audio recording for one call)
     ------------------------------------------------------------------------ */

  function getFocusableModalElements() {
    return Array.prototype.slice.call(
      els.practiceModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function onPracticeModalKeydown(event) {
    if (event.key === "Escape") {
      closePracticeModal();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    // Simple focus trap so keyboard users can't tab out of the open modal.
    var focusable = getFocusableModalElements();
    if (focusable.length === 0) {
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openPracticeModal(call, triggerBtn) {
    practiceModalTriggerBtn = triggerBtn || null;
    els.practiceModalCallName.textContent = call.name;
    buildSheetMusicDisplay(call, els.practiceModalSheetMusic);
    buildAudioControl(call, els.practiceModalAudio);

    els.practiceModalOverlay.hidden = false;
    document.body.classList.add("modal-open");
    document.addEventListener("keydown", onPracticeModalKeydown);
    els.practiceModalClose.focus();
  }

  function closePracticeModal() {
    // Stop any recording that might still be playing before hiding it.
    var audio = els.practiceModalAudio.querySelector("audio");
    if (audio) {
      audio.pause();
    }
    els.practiceModalOverlay.hidden = true;
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", onPracticeModalKeydown);
    if (practiceModalTriggerBtn) {
      practiceModalTriggerBtn.focus();
      practiceModalTriggerBtn = null;
    }
  }

  function initPracticeModal() {
    els.practiceModalClose.addEventListener("click", closePracticeModal);
    // Clicking the dimmed backdrop (but not the dialog itself) closes it.
    els.practiceModalOverlay.addEventListener("click", function (event) {
      if (event.target === els.practiceModalOverlay) {
        closePracticeModal();
      }
    });
  }

  /* ------------------------------------------------------------------------
     7b. iOS NON-SAFARI BROWSER DETECTION
     ------------------------------------------------------------------------ */

  // On iOS/iPadOS, every browser (Edge, Chrome, Firefox, etc.) is required
  // by Apple to run on the same WebKit engine as Safari, but only Safari
  // itself is given access to the native print dialog. In Edge, Chrome, and
  // similar apps on iOS, window.print() is silently a no-op — there is no
  // error, the dialog just never appears. This is a platform limitation,
  // not something a web page can fix directly, so instead we detect it and
  // tell the Scout/leader how to print anyway (via the browser's Share
  // sheet, which routes to iOS's real print system outside of WebKit).
  function isIOSNonSafariBrowser() {
    var ua = window.navigator.userAgent || "";
    var isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      // iPadOS 13+ reports as "Macintosh" but, unlike a real Mac, supports touch.
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    if (!isIOS) {
      return false;
    }
    // Other iOS browsers still include "Safari" in their UA string, but also
    // include their own token, which is what we key off of here.
    return /EdgiOS|CriOS|FxiOS|OPiOS|Brave|DuckDuckGo|GSA/.test(ua);
  }

  // Relabels both print buttons (rather than leaving them saying "Print"
  // when window.print() won't work) so it's clear a PDF download will
  // happen instead of a print dialog opening.
  function relabelPrintButtonsIfPdfFallback() {
    if (!isIOSNonSafariBrowser()) {
      return;
    }
    var explanation =
      "This browser on iOS/iPadOS can't open the print dialog directly " +
      "(an Apple limitation for all non-Safari browsers), so this " +
      "downloads a PDF instead.";
    els.printBtn.textContent = "Download Sign-Off Sheet (PDF)";
    els.printBtn.title = explanation;
    els.printMusicBtn.title = explanation;
    els.printMusicBtn.setAttribute(
      "aria-label",
      "Download sheet music PDF for the calls currently shown"
    );
  }

  /* ------------------------------------------------------------------------
     7c. PDF GENERATION FALLBACK (for browsers where window.print() is a
     no-op, i.e. non-Safari browsers on iOS/iPadOS — see above)
     ------------------------------------------------------------------------ */

  var JSPDF_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
  var jsPdfLoadPromise = null;

  // Lazily loads the jsPDF library from a CDN, only when a PDF actually
  // needs to be generated (desktop/Safari users who can use window.print()
  // never pay this cost). Returns a Promise that resolves once
  // window.jspdf.jsPDF is available.
  function loadJsPdfLibrary() {
    if (window.jspdf && window.jspdf.jsPDF) {
      return Promise.resolve();
    }
    if (jsPdfLoadPromise) {
      return jsPdfLoadPromise;
    }
    jsPdfLoadPromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = JSPDF_SCRIPT_URL;
      script.addEventListener("load", function () {
        resolve();
      });
      script.addEventListener("error", function () {
        jsPdfLoadPromise = null; // allow retrying on a later click
        reject(new Error("Could not load the PDF library."));
      });
      document.head.appendChild(script);
    });
    return jsPdfLoadPromise;
  }

  // Rasterizes an on-disk image (SVG or PNG) to a PNG data URL via a hidden
  // canvas, so it can be embedded with jsPDF's addImage (which needs a
  // raster format, not SVG). Resolves to null if the image can't be loaded.
  function loadImageAsPngDataUrl(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.addEventListener("load", function () {
        try {
          var canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || 800;
          canvas.height = img.naturalHeight || 600;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({
            dataUrl: canvas.toDataURL("image/png"),
            width: canvas.width,
            height: canvas.height
          });
        } catch (err) {
          resolve(null); // e.g. canvas security error
        }
      });
      img.addEventListener("error", function () {
        resolve(null);
      });
      img.src = src;
    });
  }

  // Turns "Scout" text into a safe-ish file name fragment.
  function pdfFileNamePart(text) {
    var cleaned = (text || "").trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    return cleaned ? "-" + cleaned.toLowerCase() : "";
  }

  // Builds the sign-off sheet as a jsPDF document (text/lines only — no
  // images needed), mirroring the on-screen/print-CSS layout.
  function buildSignOffPdfDoc() {
    var JsPDF = window.jspdf.jsPDF;
    var doc = new JsPDF({ unit: "in", format: "letter" });
    var pageWidth = 8.5;
    var marginX = 0.6;
    var contentWidth = pageWidth - marginX * 2;
    var y = 0.7;

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Bugling Merit Badge \u2014 Bugle Calls Sign-Off Sheet", pageWidth / 2, y, { align: "center" });
    y += 0.4;

    doc.setFontSize(11);
    var infoRows = [
      ["Scout Name", state.scoutName || "\u2014"],
      ["Unit Number", state.unitNumber || "\u2014"],
      ["Counselor Name", state.counselorName || "\u2014"],
      ["Date Started", state.dateStarted || "\u2014"]
    ];
    infoRows.forEach(function (row) {
      doc.setFont("times", "bold");
      doc.text(row[0] + ":", marginX, y);
      doc.setFont("times", "normal");
      doc.text(row[1], marginX + 1.7, y);
      y += 0.05;
      doc.line(marginX, y, marginX + contentWidth, y);
      y += 0.24;
    });
    y += 0.15;

    // Calls table: Bugle Call | Played | Explained | Counselor Initials
    var colWidths = [3.5, 1.0, 1.1, 1.7];
    var colX = [marginX];
    for (var i = 0; i < colWidths.length; i++) {
      colX.push(colX[i] + colWidths[i]);
    }
    var rowHeight = 0.28;

    function drawTableRow(cells, isHeader) {
      doc.setFont("times", isHeader ? "bold" : "normal");
      doc.setFontSize(isHeader ? 10 : 10);
      var textY = y + rowHeight * 0.68;
      cells.forEach(function (cellText, colIndex) {
        var align = colIndex === 0 ? "left" : "center";
        var textX = align === "left" ? colX[colIndex] + 0.08 : (colX[colIndex] + colX[colIndex + 1]) / 2;
        doc.text(String(cellText), textX, textY, { align: align });
      });
      y += rowHeight;
      doc.line(marginX, y, marginX + contentWidth, y);
    }

    var tableTop = y;
    doc.line(marginX, y, marginX + contentWidth, y);
    drawTableRow(["Bugle Call", "Played", "Explained", "Counselor Initials"], true);
    BUGLE_CALLS.forEach(function (call) {
      var c = state.calls[call.id];
      drawTableRow([
        call.number + ". " + call.name,
        c.played ? "Yes" : "",
        c.explained ? "Yes" : "",
        ""
      ], false);
    });
    var tableBottom = y;
    // Vertical grid lines around the table.
    colX.forEach(function (x) {
      doc.line(x, tableTop, x, tableBottom);
    });
    y += 0.3;

    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Counselor Notes", marginX, y);
    y += 0.2;
    for (var lineIdx = 0; lineIdx < 3; lineIdx++) {
      y += 0.22;
      doc.line(marginX, y, marginX + contentWidth, y);
    }
    y += 0.5;

    doc.setFont("times", "normal");
    doc.setFontSize(10);
    var sigWidth = (contentWidth - 0.4) / 2;
    doc.line(marginX, y, marginX + sigWidth, y);
    doc.line(marginX + sigWidth + 0.4, y, marginX + sigWidth + 0.4 + sigWidth, y);
    y += 0.16;
    doc.text("Counselor Signature", marginX, y);
    doc.text("Completion Date", marginX + sigWidth + 0.4, y);

    return doc;
  }

  // Builds the sheet music packet as a jsPDF document: one page per call,
  // with its name/purpose text plus its rasterized sheet music image
  // (images map is call.id -> {dataUrl, width, height} | null, preloaded
  // via loadImageAsPngDataUrl before this is called).
  function buildSheetMusicPdfDoc(calls, images) {
    var JsPDF = window.jspdf.jsPDF;
    var doc = new JsPDF({ unit: "in", format: "letter" });
    var pageWidth = 8.5;
    var pageHeight = 11;
    var marginX = 0.6;
    var marginTop = 0.7;
    var marginBottom = 0.6;
    var contentWidth = pageWidth - marginX * 2;
    var maxImgHeight = 4.2; // matches .print-music-img max-height in styles.css

    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("Bugling Merit Badge \u2014 Sheet Music Packet", pageWidth / 2, marginTop, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(
      calls.length + " of " + BUGLE_CALLS.length +
        " calls included, based on the filter and search that were active when you printed.",
      pageWidth / 2,
      marginTop + 0.3,
      { align: "center", maxWidth: contentWidth }
    );

    // Flows calls one after another on the same page (like the on-screen
    // print packet), only starting a new page when the next call's block
    // wouldn't fit in the remaining space — rather than forcing one call
    // per page.
    var y = marginTop + 0.65;

    calls.forEach(function (call) {
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      var purposeLines = doc.splitTextToSize(call.purpose, contentWidth);
      var purposeHeight = purposeLines.length * 0.18;
      var titleHeight = 0.3;

      var imgInfo = images[call.id];
      var imgWidth = contentWidth;
      var imgHeight;
      if (imgInfo) {
        imgHeight = (imgWidth * imgInfo.height) / imgInfo.width;
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = (imgHeight * imgInfo.width) / imgInfo.height;
        }
      } else {
        imgHeight = 0.2; // just the "not yet available" message line
      }

      var blockHeight = titleHeight + purposeHeight + 0.15 + imgHeight + 0.45;

      // Only force a page break if this block doesn't fit AND we're not
      // already at the top of a fresh page (avoids an infinite loop for a
      // single oversized block, which will just overflow the page instead).
      if (y + blockHeight > pageHeight - marginBottom && y > marginTop + 0.1) {
        doc.addPage();
        y = marginTop;
      }

      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text(call.number + ". " + call.name, marginX, y);
      y += titleHeight;

      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      doc.text(purposeLines, marginX, y);
      y += purposeHeight + 0.15;

      if (imgInfo) {
        var xIn = marginX + (contentWidth - imgWidth) / 2;
        doc.addImage(imgInfo.dataUrl, "PNG", xIn, y, imgWidth, imgHeight);
      } else {
        doc.setFont("times", "italic");
        doc.text("Sheet music not yet available for this call.", marginX, y);
      }
      y += imgHeight;

      // Divider line between calls, matching the on-screen packet's
      // border-bottom on each .print-music-item.
      y += 0.15;
      doc.setDrawColor(0);
      doc.line(marginX, y, marginX + contentWidth, y);
      y += 0.3;
    });

    return doc;
  }

  // Shows a busy state on a print/download button while a PDF is being
  // generated, since (unlike window.print()) this involves a network
  // fetch for the library plus image loading and can take a moment.
  function setButtonBusy(btn, isBusy, busyLabel) {
    if (isBusy) {
      btn.dataset.originalLabel = btn.textContent;
      btn.dataset.originalDisabled = btn.disabled ? "true" : "false";
      if (busyLabel) {
        btn.textContent = busyLabel;
      }
      btn.disabled = true;
    } else {
      if (btn.dataset.originalLabel !== undefined) {
        btn.textContent = btn.dataset.originalLabel;
        delete btn.dataset.originalLabel;
      }
      btn.disabled = false;
      delete btn.dataset.originalDisabled;
    }
  }

  function showPdfErrorAlert() {
    window.alert(
      "Sorry, the PDF could not be generated (check your internet " +
      "connection, since this needs to briefly download a small PDF " +
      "library). Please try again, or open this page in Safari and use " +
      "its normal print/Save as PDF option instead."
    );
  }

  function downloadSignOffPdf() {
    setButtonBusy(els.printBtn, true, "Preparing PDF\u2026");
    loadJsPdfLibrary().then(function () {
      var doc = buildSignOffPdfDoc();
      doc.save("bugling-sign-off-sheet" + pdfFileNamePart(state.scoutName) + ".pdf");
    }).catch(function (err) {
      console.warn("Bugling app: could not generate sign-off PDF.", err);
      showPdfErrorAlert();
    }).then(function () {
      setButtonBusy(els.printBtn, false);
    });
  }

  function downloadSheetMusicPdf(calls) {
    setButtonBusy(els.printMusicBtn, true);
    loadJsPdfLibrary().then(function () {
      return Promise.all(calls.map(function (call) {
        var availability = sheetMusicAvailability[call.id];
        if (availability !== "svg" && availability !== "png") {
          return { id: call.id, info: null };
        }
        return loadImageAsPngDataUrl("images/" + call.id + "." + availability).then(function (info) {
          return { id: call.id, info: info };
        });
      }));
    }).then(function (results) {
      var images = {};
      results.forEach(function (result) {
        images[result.id] = result.info;
      });
      var doc = buildSheetMusicPdfDoc(calls, images);
      doc.save("bugling-sheet-music-packet.pdf");
    }).catch(function (err) {
      console.warn("Bugling app: could not generate sheet music PDF.", err);
      showPdfErrorAlert();
    }).then(function () {
      setButtonBusy(els.printMusicBtn, false);
    });
  }

  /* ------------------------------------------------------------------------
     8. PRINTABLE SIGN-OFF SHEET
     ------------------------------------------------------------------------ */

  function checkSymbol(isChecked) {
    return isChecked ? "\u2611" : "\u2610"; // ☑ or ☐
  }

  function updatePrintTable() {
    els.printTableBody.innerHTML = "";

    BUGLE_CALLS.forEach(function (call) {
      var c = state.calls[call.id];

      var printRow = document.createElement("tr");
      printRow.innerHTML =
        "<td>" + call.number + ". " + escapeHtml(call.name) + "</td>" +
        "<td>" + checkSymbol(c.played) + "</td>" +
        "<td>" + checkSymbol(c.explained) + "</td>" +
        "<td></td>";
      els.printTableBody.appendChild(printRow);
    });
  }

  function updatePrintHeaderInfo() {
    els.printScoutName.textContent = state.scoutName || "\u2014";
    els.printUnitNumber.textContent = state.unitNumber || "\u2014";
    els.printCounselorName.textContent = state.counselorName || "\u2014";
    els.printDateStarted.textContent = state.dateStarted || "\u2014";
  }

  /* ------------------------------------------------------------------------
     9. SCOUT INFO FORM
     ------------------------------------------------------------------------ */

  function initScoutInfoForm() {
    els.scoutName.value = state.scoutName;
    els.unitNumber.value = state.unitNumber;
    els.counselorName.value = state.counselorName;
    els.dateStarted.value = state.dateStarted;

    els.scoutName.addEventListener("input", function () {
      state.scoutName = els.scoutName.value;
      saveState();
      updatePrintHeaderInfo();
    });
    els.unitNumber.addEventListener("input", function () {
      state.unitNumber = els.unitNumber.value;
      saveState();
      updatePrintHeaderInfo();
    });
    els.counselorName.addEventListener("input", function () {
      state.counselorName = els.counselorName.value;
      saveState();
      updatePrintHeaderInfo();
    });
    els.dateStarted.addEventListener("change", function () {
      state.dateStarted = els.dateStarted.value;
      saveState();
      updatePrintHeaderInfo();
    });
  }

  /* ------------------------------------------------------------------------
     11. EVENT WIRING (filters, search, expand/collapse, print, reset)
     ------------------------------------------------------------------------ */

  function initFilterButtons() {
    els.filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        els.filterButtons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        currentFilter = btn.dataset.filter;
        applyFiltersAndSearch();
      });
    });
  }

  function initSearch() {
    els.searchInput.addEventListener("input", function () {
      currentSearch = els.searchInput.value;
      applyFiltersAndSearch();
    });
  }

  function initExpandCollapseAll() {
    els.expandAllBtn.addEventListener("click", function () {
      BUGLE_CALLS.forEach(function (call) {
        var article = document.getElementById("card-" + call.id);
        var toggleBtn = article.querySelector('[data-role="toggle"]');
        var detailsPanel = article.querySelector(".call-card-details");
        setCardExpanded(call.id, article, toggleBtn, detailsPanel, true);
      });
    });
    els.collapseAllBtn.addEventListener("click", function () {
      BUGLE_CALLS.forEach(function (call) {
        var article = document.getElementById("card-" + call.id);
        var toggleBtn = article.querySelector('[data-role="toggle"]');
        var detailsPanel = article.querySelector(".call-card-details");
        setCardExpanded(call.id, article, toggleBtn, detailsPanel, false);
      });
    });
  }

  function initPrintButton() {
    els.printBtn.addEventListener("click", function () {
      updatePrintHeaderInfo();
      // On iOS non-Safari browsers, window.print() silently does nothing
      // (see isIOSNonSafariBrowser above), so download a PDF instead.
      if (isIOSNonSafariBrowser()) {
        downloadSignOffPdf();
        return;
      }
      els.printMusicSheet.classList.remove("print-active");
      els.printSheet.classList.add("print-active");
      window.print();
      els.printSheet.classList.remove("print-active");
    });
  }

  /* ------------------------------------------------------------------------
     8b. PRINTABLE SHEET MUSIC PACKET (currently filtered/searched calls)
     ------------------------------------------------------------------------ */

  // Quietly checks, in the background, which sheet music image format
  // (SVG, PNG, or none) exists for every call, and caches the result in
  // sheetMusicAvailability. This runs once during startup so that by the
  // time a Scout taps "Print Sheet Music", the answer is already known and
  // the print packet can be built synchronously.
  //
  // This matters because iOS (Safari/Edge/Chrome all use WebKit on iOS)
  // only allows window.print() to open the print dialog when it is called
  // *synchronously* inside the click event handler. Waiting on an image
  // Promise before calling window.print() works fine on desktop browsers,
  // but silently fails to open the print dialog on iPhone/iPad.
  function preloadSheetMusicAvailability() {
    BUGLE_CALLS.forEach(function (call) {
      if (sheetMusicAvailability[call.id]) {
        return; // already known
      }
      var probe = new Image();
      var triedPngFallback = false;
      probe.addEventListener("load", function () {
        sheetMusicAvailability[call.id] = triedPngFallback ? "png" : "svg";
      });
      probe.addEventListener("error", function () {
        if (!triedPngFallback) {
          triedPngFallback = true;
          probe.src = "images/" + call.id + ".png";
          return;
        }
        sheetMusicAvailability[call.id] = "none";
      });
      probe.src = "images/" + call.id + ".svg";
    });
  }

  // Builds the hidden print-only sheet music packet for the given calls.
  // This is synchronous by design (see preloadSheetMusicAvailability above)
  // so it can run in the same click handler that calls window.print().
  function buildPrintMusicSheet(calls) {
    var container = els.printMusicSheet;
    container.innerHTML = "";

    var heading = document.createElement("h1");
    heading.textContent = "Bugling Merit Badge — Sheet Music Packet";
    container.appendChild(heading);

    var subheading = document.createElement("p");
    subheading.className = "print-music-subheading";
    subheading.textContent =
      calls.length + " of " + BUGLE_CALLS.length +
      " calls included, based on the filter and search that were active when you printed.";
    container.appendChild(subheading);

    calls.forEach(function (call) {
      var item = document.createElement("div");
      item.className = "print-music-item";

      var title = document.createElement("h2");
      title.textContent = call.number + ". " + call.name;
      item.appendChild(title);

      var purpose = document.createElement("p");
      purpose.className = "print-music-purpose";
      purpose.textContent = call.purpose;
      item.appendChild(purpose);

      var availability = sheetMusicAvailability[call.id];

      if (availability === "svg" || availability === "png") {
        var img = document.createElement("img");
        img.className = "print-music-img";
        img.alt = call.name + " sheet music";
        img.src = "images/" + call.id + "." + availability;
        item.appendChild(img);
      } else {
        // Covers both the confirmed "none" case and the rare case where
        // the background check hasn't finished yet — showing this message
        // is safer than risking a broken image in the print dialog.
        var missingMsg = document.createElement("p");
        missingMsg.className = "print-music-missing";
        missingMsg.textContent = "Sheet music not yet available for this call.";
        item.appendChild(missingMsg);
      }

      container.appendChild(item);
    });
  }

  function initPrintMusicButton() {
    els.printMusicBtn.addEventListener("click", function () {
      // Only include calls that are currently visible under the active
      // filter and search, matching what the Scout sees on screen.
      var visibleCalls = BUGLE_CALLS.filter(function (call) {
        var article = document.getElementById("card-" + call.id);
        return article && !article.classList.contains("is-hidden");
      });

      if (visibleCalls.length === 0) {
        window.alert(
          "No bugle calls match your current filter and search, so there is " +
          "nothing to print. Adjust the filter or search first."
        );
        return;
      }

      // Everything below must run synchronously (no waiting on Promises)
      // so that window.print() stays inside this click event's user
      // gesture — required for the print dialog to open on iOS Safari.
      // On iOS non-Safari browsers, window.print() is a no-op regardless,
      // so skip straight to the PDF download fallback there.
      if (isIOSNonSafariBrowser()) {
        downloadSheetMusicPdf(visibleCalls);
        return;
      }

      buildPrintMusicSheet(visibleCalls);
      els.printSheet.classList.remove("print-active");
      els.printMusicSheet.classList.add("print-active");
      window.print();
      els.printMusicSheet.classList.remove("print-active");
    });
  }

  function initResetButton() {
    els.resetBtn.addEventListener("click", function () {
      var confirmed = window.confirm(
        "This will permanently clear all saved Scout information and " +
        "checkboxes stored in this browser. This action cannot be undone. " +
        "Are you sure you want to reset all progress?"
      );
      if (!confirmed) {
        return;
      }
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch (err) {
        console.warn("Bugling app: could not clear localStorage.", err);
      }
      state = getDefaultState();
      renderEverything();
    });
  }

  /* ------------------------------------------------------------------------
     12. UTILITIES
     ------------------------------------------------------------------------ */

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ------------------------------------------------------------------------
     13. INIT
     ------------------------------------------------------------------------ */

  function renderEverything() {
    initScoutInfoForm();
    renderAllCards();
    updateProgress();
    applyFiltersAndSearch();
    updatePrintTable();
    updatePrintHeaderInfo();
  }

  function init() {
    initFilterButtons();
    initSearch();
    initExpandCollapseAll();
    initPracticeModal();
    initPrintButton();
    initPrintMusicButton();
    initResetButton();
    relabelPrintButtonsIfPdfFallback();
    preloadSheetMusicAvailability();
    renderEverything();
  }

  // Run once the DOM is ready.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
