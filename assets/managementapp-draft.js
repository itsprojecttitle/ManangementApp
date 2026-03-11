(function () {
  if (!window.OMNI_DRAFT_MODE) return;

  const state = {
    zone: "nav",
    navIndex: 0,
    mainIndex: 0,
    feed: [],
    refreshQueued: 0,
    titleSpinnerTimer: 0,
    asciiTimer: 0,
    asciiFrame: 0,
  };

  function isVisible(el) {
    return !!(el && el.isConnected && el.getClientRects().length);
  }

  function isEditableTarget(el) {
    if (!el) return false;
    if (el.isContentEditable) return true;
    return !!el.closest("input, textarea, select, [contenteditable='true']");
  }

  function hasBlockingOverlay() {
    const selectors = [
      ".confirm-overlay.active",
      ".prompt-overlay.active",
      ".notice-overlay.active",
      ".mission-editor-overlay.active",
      ".intel-overlay.active",
      ".doc-overlay.active",
      ".reminder-overlay.active",
      ".exercise-overlay.active",
      ".lock-overlay.active",
    ];
    return selectors.some((selector) => document.querySelector(selector));
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\[[0-9]+\]\s*/g, "")
      .replace(/^\/{2,}\s*/, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function commandText(value) {
    return cleanText(value)
      .replace(/&/g, " and ")
      .replace(/\+/g, " plus ")
      .replace(/[<>]/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function originalLabel(el) {
    if (!el) return "";
    if (el.dataset && el.dataset.draftOriginal) return el.dataset.draftOriginal;
    return cleanText(el.textContent || el.value || el.placeholder || "");
  }

  function navCommandFor(label) {
    const target = commandText(label);
    return target ? `open ${target}` : "open route";
  }

  function buttonCommandFor(label) {
    const target = commandText(label);
    if (!target) return "run action";
    if (target === "x" || target === "close") return "close panel";
    if (target === "cancel") return "cancel";
    if (target === "unlock") return "unlock session";
    if (target === "run") return "run command";
    if (target === "clear") return "clear output";
    if (target === "search") return "exec search";
    if (target === "save") return "save changes";
    if (target === "add") return "create record";
    if (target === "reset") return "reset state";
    if (target.startsWith("back")) return "cd ..";
    if (target.startsWith("open ")) return target;
    if (target.startsWith("use ")) return `mode ${target.slice(4)}`.trim();
    if (target.startsWith("turn ")) return `runtime ${target.slice(5)}`.trim();
    if (target.startsWith("refresh ")) return target;
    if (target.startsWith("import ")) return target;
    if (target.startsWith("export ")) return target;
    if (target.startsWith("share ")) return `share ${target.slice(6)}`.trim();
    if (target.startsWith("sync ")) return target;
    if (target.startsWith("test ")) return target;
    if (target.startsWith("enable ")) return target;
    if (target.startsWith("load ")) return target;
    if (target.startsWith("play ")) return target;
    if (target.startsWith("preload ")) return target;
    if (target.startsWith("face id")) return "enable biometric unlock";
    if (target === "plus" || target === "") return "create record";
    return `run ${target}`;
  }

  function headingCommandFor(label, depth) {
    const target = commandText(label);
    if (!target) return depth === 2 ? "status" : "section";
    return `${depth === 2 ? "status" : "section"} ${target}`;
  }

  function paragraphPromptFor(el) {
    if (el.closest(".settings-help")) return "note";
    if (el.closest(".routine-ex-note")) return "info";
    return "out";
  }

  function blockLabelFor(el) {
    if (!el) return "section";
    const heading = el.querySelector("h2, h3, h1, strong, .sync-center-list-title, .mission-highlight-key");
    if (heading && cleanText(heading.textContent)) return cleanText(heading.textContent);
    const count = el.querySelector("h1");
    if (count && cleanText(count.textContent)) return cleanText(count.textContent);
    return cleanText(el.textContent).split(" ").slice(0, 8).join(" ") || "section";
  }

  function blockCommandFor(el) {
    const label = blockLabelFor(el);
    const target = commandText(label);
    if (!target) return "cat section.log";
    if (el.classList.contains("op-card")) return `cat metrics/${target}.log`;
    if (el.classList.contains("settings-card")) return `cat settings/${target}.conf`;
    if (el.classList.contains("routine-box")) return `cat routines/${target}.plan`;
    if (el.classList.contains("submission-area")) return `cat forms/${target}.input`;
    if (el.classList.contains("mission-highlight-card")) return `printf "${target}"`;
    if (el.classList.contains("sync-center-row")) return `tail ${target}.log`;
    if (el.classList.contains("sync-center-stat")) return `watch ${target}`;
    return `cat ${target}.log`;
  }

  function navButtons() {
    return Array.from(document.querySelectorAll("aside .nav-btn")).filter(isVisible);
  }

  function currentViewPanel() {
    return Array.from(document.querySelectorAll(".view-panel")).find((panel) => {
      if (!isVisible(panel)) return false;
      const style = window.getComputedStyle(panel);
      return style.display !== "none" && style.visibility !== "hidden";
    }) || null;
  }

  function mainTargets() {
    const panel = currentViewPanel();
    if (!panel) return [];
    return Array.from(panel.querySelectorAll("button, [onclick], a[href]"))
      .filter((el) => !el.closest("aside"))
      .filter((el) => !el.closest(".add-popup-panel[style*='display:none']"))
      .filter((el) => !el.disabled)
      .filter(isVisible);
  }

  function cleanLabel(el) {
    const raw = el
      ? (el.getAttribute("data-draft-label")
        || el.getAttribute("aria-label")
        || originalLabel(el)
        || "")
      : "";
    return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 72) || "UNNAMED";
  }

  function currentPromptCommand() {
    if (state.zone === "nav") {
      const buttons = navButtons();
      const target = buttons[clampIndex(state.navIndex, buttons.length)];
      return target?.dataset?.draftCommand || "open dashboard";
    }
    const targets = mainTargets();
    const target = targets[clampIndex(state.mainIndex, targets.length)];
    return target?.dataset?.draftCommand || "run action";
  }

  function activeNavLabel() {
    const active = document.querySelector("aside .nav-btn.active");
    return cleanLabel(active);
  }

  function pushFeed(message) {
    state.feed.push(String(message || "").trim());
    state.feed = state.feed.filter(Boolean).slice(-6);
    renderHud();
  }

  function clampIndex(index, total) {
    if (!total) return 0;
    return ((index % total) + total) % total;
  }

  function syncNavIndexFromActive() {
    const buttons = navButtons();
    const active = buttons.findIndex((btn) => btn.classList.contains("active"));
    state.navIndex = active >= 0 ? active : 0;
  }

  function applySelection() {
    const buttons = navButtons();
    buttons.forEach((btn) => btn.classList.remove("draft-nav-cursor"));
    document.querySelectorAll(".draft-main-cursor").forEach((el) => el.classList.remove("draft-main-cursor"));

    if (state.zone === "nav" && buttons.length) {
      state.navIndex = clampIndex(state.navIndex, buttons.length);
      const target = buttons[state.navIndex];
      target.classList.add("draft-nav-cursor");
      target.scrollIntoView({ block: "nearest" });
    }

    if (state.zone === "main") {
      const targets = mainTargets();
      if (!targets.length) {
        state.zone = "nav";
        renderHud();
        return applySelection();
      }
      state.mainIndex = clampIndex(state.mainIndex, targets.length);
      const target = targets[state.mainIndex];
      target.classList.add("draft-main-cursor");
      target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    renderHud();
  }

  function moveSelection(delta) {
    if (state.zone === "nav") {
      const buttons = navButtons();
      if (!buttons.length) return;
      state.navIndex = clampIndex(state.navIndex + delta, buttons.length);
      applySelection();
      return;
    }

    const targets = mainTargets();
    if (!targets.length) {
      state.zone = "nav";
      applySelection();
      return;
    }
    state.mainIndex = clampIndex(state.mainIndex + delta, targets.length);
    applySelection();
  }

  function setZone(zone) {
    if (zone === "main" && !mainTargets().length) {
      pushFeed("no main targets in view");
      state.zone = "nav";
      applySelection();
      return;
    }
    state.zone = zone === "main" ? "main" : "nav";
    applySelection();
  }

  function clickCurrentTarget() {
    if (state.zone === "nav") {
      const buttons = navButtons();
      if (!buttons.length) return;
      const target = buttons[clampIndex(state.navIndex, buttons.length)];
      pushFeed(currentPromptCommand());
      target.click();
      window.setTimeout(() => {
        syncNavIndexFromActive();
        state.zone = "main";
        state.mainIndex = 0;
        queueRefresh();
      }, 30);
      return;
    }

    const targets = mainTargets();
    if (!targets.length) return;
    const target = targets[clampIndex(state.mainIndex, targets.length)];
    pushFeed(currentPromptCommand());
    target.click();
    window.setTimeout(() => {
      queueRefresh();
    }, 30);
  }

  function relabelNavButtons() {
    navButtons().forEach((btn, index) => {
      if (!btn.dataset.draftOriginal) btn.dataset.draftOriginal = cleanText(btn.textContent);
      const command = navCommandFor(btn.dataset.draftOriginal);
      btn.dataset.draftLabel = cleanText(btn.dataset.draftOriginal).toUpperCase();
      btn.dataset.draftCommand = command;
      btn.dataset.draftLine = String(index + 1).padStart(2, "0");
      btn.innerHTML = [
        `<span class="draft-nav-line">${btn.dataset.draftLine}</span>`,
        `<span class="draft-nav-command">${command}</span>`,
      ].join("");
    });
  }

  function relabelActionButtons(root) {
    Array.from(root.querySelectorAll("button, .submit-btn, .confirm-btn, .back-btn, .add-plus-btn"))
      .filter((btn) => !btn.closest("aside"))
      .forEach((btn) => {
        if (!btn.dataset.draftOriginal) btn.dataset.draftOriginal = cleanText(btn.textContent) || btn.getAttribute("aria-label") || "+";
        const command = buttonCommandFor(btn.dataset.draftOriginal);
        btn.dataset.draftCommand = command;
        btn.dataset.draftLabel = cleanText(btn.dataset.draftOriginal).toUpperCase() || "ACTION";
        btn.innerHTML = [
          '<span class="draft-command-prefix">&gt;</span>',
          `<span class="draft-command-text">${command}</span>`,
        ].join("");
      });
  }

  function relabelHeadings(root) {
    Array.from(root.querySelectorAll(".view-panel > h2, .settings-card > h3, .routine-title, .sync-center-list-title"))
      .forEach((heading) => {
        if (!heading.dataset.draftOriginal) heading.dataset.draftOriginal = cleanText(heading.textContent);
        const depth = heading.tagName === "H2" ? 2 : 3;
        const command = headingCommandFor(heading.dataset.draftOriginal, depth);
        heading.dataset.draftCommand = command;
        heading.classList.add("draft-terminal-heading");
        heading.innerHTML = [
          `<span class="draft-heading-prefix">${depth === 2 ? "$" : ">"}</span>`,
          `<span class="draft-heading-command">${command}</span>`,
        ].join("");
      });
  }

  function relabelParagraphs(root) {
    Array.from(root.querySelectorAll(".view-panel p, .settings-help, .routine-ex-note, .mission-profile-highlights .mission-highlight-key, .mission-profile-highlights .mission-highlight-value, label, .hvi-meta"))
      .forEach((el) => {
        if (!cleanText(el.textContent)) return;
        if (!el.dataset.draftOriginal) el.dataset.draftOriginal = cleanText(el.textContent);
        el.classList.add("draft-terminal-copy");
        el.dataset.draftPrompt = paragraphPromptFor(el);
      });
  }

  function relabelTextInputs(root) {
    Array.from(root.querySelectorAll("input, textarea, select"))
      .forEach((el) => {
        el.classList.add("draft-terminal-input");
      });
  }

  function tagBlocks(root) {
    Array.from(root.querySelectorAll(".settings-card, .op-card, .hvi-card, .routine-box, .notify-history-box, .submission-area, .sync-center-row, .sync-center-stat, .mission-highlight-card"))
      .forEach((el, index) => {
        el.classList.add("draft-terminal-block");
        el.dataset.draftBlockIndex = String(index + 1).padStart(2, "0");
        el.dataset.draftBlockLabel = blockLabelFor(el);
        el.dataset.draftBlockCommand = blockCommandFor(el);
      });
  }

  function updateSessionBanner() {
    const main = document.querySelector("main");
    const active = document.querySelector("aside .nav-btn.active");
    if (!main) return;
    const activeCommand = active?.dataset?.draftCommand || "open dashboard";
    main.dataset.draftSessionCommand = `channel/local :: ${activeCommand} :: signal/stable`;
  }

  function overlayText(buffer, row, col, text) {
    if (!Array.isArray(buffer) || !buffer[row]) return;
    const chars = String(text || "").split("");
    chars.forEach((char, index) => {
      const targetCol = col + index;
      if (targetCol >= 0 && targetCol < buffer[row].length) {
        buffer[row][targetCol] = char;
      }
    });
  }

  function buildAsciiFrame(frame) {
    const width = 88;
    const height = 18;
    const buffer = Array.from({ length: height }, () => Array.from({ length: width }, () => " "));
    const banner = [
      "PPPP  RRRR   OOO   JJJJ  EEEEE  CCCC  TTTTT TTTTT IIIII TTTTT L     EEEEE",
      "P   P R   R O   O    J   E     C       T     T     I     T   L     E    ",
      "PPPP  RRRR  O   O    J   EEE   C       T     T     I     T   L     EEE  ",
      "P     R R   O   O J  J   E     C       T     T     I     T   L     E    ",
      "P     R  RR  OOO   JJ    EEEEE  CCCC   T     T   IIIII   T   LLLLL EEEEE",
    ];
    const startCol = Math.max(1, Math.floor((width - banner[0].length) / 2));
    const startRow = 5;
    const scanCol = (frame * 3) % width;
    const noiseCol = (frame * 5 + 11) % width;

    banner.forEach((line, rowIndex) => {
      line.split("").forEach((char, colIndex) => {
        if (char === " ") return;
        const col = startCol + colIndex;
        let nextChar = char;
        if (Math.abs(col - scanCol) <= 1) nextChar = "#";
        else if (Math.abs(col - noiseCol) === 0 && rowIndex % 2 === 0) nextChar = ":";
        if (buffer[startRow + rowIndex] && typeof buffer[startRow + rowIndex][col] !== "undefined") {
          buffer[startRow + rowIndex][col] = nextChar;
        }
      });
    });

    const pulse = ["|", "/", "-", "\\"][frame % 4];
    overlayText(buffer, 0, 2, "PROJECTTITLE :: mainframe terminal");
    overlayText(buffer, 1, 2, `render mode: projecttitle-banner  |  scan ${String(scanCol).padStart(2, "0")}  |  ${pulse}`);
    overlayText(buffer, 3, 2, ".---------------------------------------------------------------.");
    overlayText(buffer, 11, 2, "'---------------------------------------------------------------'");
    overlayText(buffer, height - 2, 2, "arrows move  |  enter run  |  right enter pane  |  left route list");
    overlayText(buffer, height - 1, 2, `frame ${String(frame).padStart(4, "0")}  |  local draft  |  signal stable`);
    return buffer.map((row) => row.join("")).join("\n");
  }

  function renderAsciiViewport() {
    const scene = document.getElementById("draft-ascii-scene");
    if (!scene) return;
    scene.textContent = buildAsciiFrame(state.asciiFrame);
    state.asciiFrame += 1;
  }

  function injectAsciiViewport() {
    const main = document.querySelector("main");
    if (!main || document.getElementById("draft-ascii-shell")) return;
    const shell = document.createElement("section");
    shell.id = "draft-ascii-shell";
    shell.className = "draft-terminal-block";
    shell.dataset.draftBlockIndex = "00";
    shell.dataset.draftBlockCommand = "./projecttitle --render ascii-cube";
    shell.innerHTML = [
      '<div class="draft-ascii-head">$ ./projecttitle --render ascii-cube</div>',
      '<pre id="draft-ascii-scene" aria-hidden="true"></pre>',
      '<div class="draft-ascii-meta">wireframe preview inspired by terminal ascii demos</div>',
    ].join("");
    main.prepend(shell);
  }

  function startAsciiViewport() {
    injectAsciiViewport();
    renderAsciiViewport();
    if (state.asciiTimer) return;
    state.asciiTimer = window.setInterval(renderAsciiViewport, 90);
  }

  function startTitleSpinner() {
    const titleEl = document.getElementById("app-title");
    const tabEl = document.querySelector(".draft-tab-label");
    if (!titleEl || state.titleSpinnerTimer) return;
    const frames = ["|", "/", "-", "\\"];
    let index = 0;
    const render = () => {
      const frame = frames[index % frames.length];
      titleEl.textContent = `[${frame}] PROJECTTITLE [${frames[(index + 2) % frames.length]}]`;
      if (tabEl) tabEl.textContent = `Terminal  ${frame}  samuel@projecttitle`;
      index += 1;
    };
    render();
    state.titleSpinnerTimer = window.setInterval(render, 140);
  }

  function refreshPresentation(root = document) {
    relabelNavButtons();
    relabelActionButtons(root);
    relabelHeadings(root);
    relabelParagraphs(root);
    relabelTextInputs(root);
    tagBlocks(root);
    const systemStatus = document.querySelector(".system-status");
    if (systemStatus) {
      systemStatus.textContent = "CHANNEL: LOCAL  |  SIGNAL: STABLE  |  INPUT: ARROWS + ENTER";
    }
    updateSessionBanner();
    document.title = "PROJECTTITLE Draft Terminal";
  }

  function queueRefresh() {
    if (state.refreshQueued) return;
    state.refreshQueued = window.requestAnimationFrame(() => {
      state.refreshQueued = 0;
      refreshPresentation(document);
      applySelection();
    });
  }

  function renderHud() {
    const hud = document.getElementById("draft-terminal-hud");
    if (!hud) return;
    const prompt = currentPromptCommand();
    const targetCount = state.zone === "nav" ? navButtons().length : mainTargets().length;
    hud.innerHTML = [
      '<div class="draft-shell-summary">',
      `  <span class="draft-shell-chip">view ${activeNavLabel().toLowerCase()}</span>`,
      `  <span class="draft-shell-chip">zone ${state.zone}</span>`,
      `  <span class="draft-shell-chip">targets ${targetCount}</span>`,
      '</div>',
      '<ul id="draft-terminal-feed" class="draft-shell-feed">',
      (state.feed.length
        ? state.feed.slice().reverse().map((message) => `<li><span class="draft-feed-prefix">log</span><span class="draft-feed-text">${message}</span></li>`).join("")
        : "<li><span class=\"draft-feed-prefix\">log</span><span class=\"draft-feed-text\">draft terminal online</span></li>"),
      '</ul>',
      '<div class="draft-shell-prompt">',
      '  <span class="draft-shell-host">samuel@projecttitle</span>',
      '  <span class="draft-shell-path">~</span>',
      '  <span class="draft-shell-symbol">%</span>',
      `  <span class="draft-shell-command">${prompt}</span>`,
      '  <span class="draft-shell-cursor" aria-hidden="true"></span>',
      '</div>',
    ].join("");
  }

  function injectHud() {
    if (document.getElementById("draft-terminal-hud")) return;
    const hud = document.createElement("section");
    hud.id = "draft-terminal-hud";
    hud.setAttribute("aria-live", "polite");
    document.body.appendChild(hud);
  }

  function injectHeaderChrome() {
    const header = document.querySelector("header");
    if (!header || header.querySelector(".draft-titlebar")) return;
    const chrome = document.createElement("div");
    chrome.className = "draft-titlebar";
    chrome.innerHTML = [
      '<div class="draft-traffic" aria-hidden="true">',
      '  <span class="draft-dot draft-dot-red"></span>',
      '  <span class="draft-dot draft-dot-yellow"></span>',
      '  <span class="draft-dot draft-dot-green"></span>',
      '</div>',
      '<div class="draft-tab-label">ALIEN TERMINAL // PROJECTTITLE</div>',
    ].join("");
    header.prepend(chrome);
  }

  function patchSwitchView() {
    if (typeof window.switchView !== "function" || window.switchView.__draftWrapped) return;
    const original = window.switchView;
    const wrapped = function wrappedSwitchView() {
      const result = original.apply(this, arguments);
      window.setTimeout(() => {
        syncNavIndexFromActive();
        state.zone = "main";
        state.mainIndex = 0;
        queueRefresh();
      }, 30);
      return result;
    };
    wrapped.__draftWrapped = true;
    window.switchView = wrapped;
  }

  function onKeydown(event) {
    if (!window.OMNI_DRAFT_MODE) return;
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isEditableTarget(event.target) || isEditableTarget(document.activeElement)) return;
    if (hasBlockingOverlay()) return;

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setZone("nav");
      pushFeed("zone nav");
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setZone("main");
      pushFeed("zone main");
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      clickCurrentTarget();
    }
  }

  function onPointerSelection(event) {
    const navButton = event.target.closest("aside .nav-btn");
    if (navButton) {
      const buttons = navButtons();
      const idx = buttons.indexOf(navButton);
      if (idx >= 0) {
        state.zone = "nav";
        state.navIndex = idx;
        applySelection();
      }
      return;
    }

    const panel = currentViewPanel();
    if (!panel || !panel.contains(event.target)) return;
    const targets = mainTargets();
    const target = event.target.closest("button, [onclick], a[href]");
    const idx = targets.indexOf(target);
    if (idx >= 0) {
      state.zone = "main";
      state.mainIndex = idx;
      applySelection();
    }
  }

  function init() {
    document.body.classList.add("omni-draft-terminal");
    injectHeaderChrome();
    injectHud();
    startAsciiViewport();
    patchSwitchView();
    refreshPresentation(document);
    startTitleSpinner();
    syncNavIndexFromActive();
    applySelection();
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onPointerSelection, true);
    pushFeed("draft terminal online");
    window.setTimeout(queueRefresh, 250);
    window.setTimeout(queueRefresh, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
