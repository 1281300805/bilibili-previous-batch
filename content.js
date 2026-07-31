(() => {
  "use strict";

  const HISTORY_LIMIT = 10;
  const CLICK_COOLDOWN_MS = 650;
  const PREVIOUS_BUTTON_ID = "bhr-previous-batch";
  const ARCHIVE_CONTAINER_ID = "bhr-archive-container";
  const READY_CLASS = "bhr-controls-ready";

  const history = [];
  let archiveContainer = null;
  let liveContainer = null;
  let liveContainerDisplay = "";
  let refreshLockedUntil = 0;
  let unlockTimer = 0;

  function isRefreshButton(element) {
    const button = element?.closest?.("button");
    if (!button || button.id === PREVIOUS_BUTTON_ID) {
      return false;
    }

    const text = (button.textContent || "").replace(/\s+/g, "");
    return (
      text.includes("换一换") &&
      (button.matches(".roll-btn") ||
        button.closest(".feed-roll-btn") ||
        button.matches("button.primary-btn"))
    );
  }

  function findRefreshButton() {
    const candidates = document.querySelectorAll(
      ".feed-roll-btn button, button.roll-btn, button.primary-btn"
    );

    return Array.from(candidates).find((button) => isRefreshButton(button)) || null;
  }

  function findLiveContainer(refreshButton = findRefreshButton()) {
    const aside = refreshButton?.closest(".recommended-container_floor-aside");
    if (aside) {
      return (
        Array.from(aside.children).find(
          (child) =>
            child instanceof HTMLElement &&
            child.classList.contains("container") &&
            child.id !== ARCHIVE_CONTAINER_ID
        ) || null
      );
    }

    return (
      document.querySelector(".recommended-container_floor-aside > .container") ||
      document.querySelector("main .feed2 .container")
    );
  }

  function cleanSnapshot(container) {
    const snapshot = container.cloneNode(true);
    snapshot.removeAttribute("id");
    snapshot.classList.remove("bhr-archive-view");
    snapshot.querySelectorAll(`#${PREVIOUS_BUTTON_ID}, #${ARCHIVE_CONTAINER_ID}`).forEach(
      (element) => element.remove()
    );
    snapshot.querySelectorAll("script").forEach((script) => script.remove());
    return snapshot;
  }

  function snapshotKey(container) {
    return Array.from(
      container.querySelectorAll('a[href*="/video/"], a[href*="/bangumi/play/"]')
    )
      .slice(0, 12)
      .map((link) => link.getAttribute("href"))
      .join("|");
  }

  function pushCurrentBatch() {
    const current = findLiveContainer();
    if (!current) {
      return;
    }

    const snapshot = cleanSnapshot(current);
    const key = snapshotKey(snapshot);
    const latestKey = history.length ? history[history.length - 1].key : "";

    if (key && key === latestKey) {
      return;
    }

    history.push({ key, node: snapshot });
    if (history.length > HISTORY_LIMIT) {
      history.shift();
    }
    updatePreviousButton();
  }

  function exitArchiveView() {
    if (archiveContainer) {
      archiveContainer.remove();
      archiveContainer = null;
    }

    if (liveContainer?.isConnected) {
      liveContainer.style.display = liveContainerDisplay;
    }
    liveContainer = null;
    liveContainerDisplay = "";
  }

  function restorePreviousBatch() {
    if (!history.length) {
      return;
    }

    const refreshButton = findRefreshButton();
    const currentLiveContainer = findLiveContainer(refreshButton);
    const aside = refreshButton?.closest(".recommended-container_floor-aside");
    const entry = history.pop();

    if (!currentLiveContainer || !aside || !entry) {
      if (entry) {
        history.push(entry);
      }
      updatePreviousButton();
      return;
    }

    exitArchiveView();

    liveContainer = currentLiveContainer;
    liveContainerDisplay = liveContainer.style.display;
    liveContainer.style.display = "none";

    archiveContainer = entry.node.cloneNode(true);
    archiveContainer.id = ARCHIVE_CONTAINER_ID;
    archiveContainer.classList.add("bhr-archive-view");
    aside.insertBefore(archiveContainer, liveContainer);

    updatePreviousButton();
  }

  function setRefreshButtonLocked(button, locked) {
    button.classList.toggle("bhr-refresh-locked", locked);
    button.setAttribute("aria-disabled", locked ? "true" : "false");
  }

  function handleRefreshClick(event) {
    if (!isRefreshButton(event.target)) {
      return;
    }

    const button = event.target.closest("button");
    const now = Date.now();

    if (now < refreshLockedUntil) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    refreshLockedUntil = now + CLICK_COOLDOWN_MS;
    setRefreshButtonLocked(button, true);
    clearTimeout(unlockTimer);
    unlockTimer = window.setTimeout(() => {
      if (button.isConnected) {
        setRefreshButtonLocked(button, false);
      }
    }, CLICK_COOLDOWN_MS);

    if (archiveContainer) {
      exitArchiveView();
    } else {
      pushCurrentBatch();
    }
  }

  function updatePreviousButton() {
    const button = document.getElementById(PREVIOUS_BUTTON_ID);
    if (!button) {
      return;
    }

    button.disabled = history.length === 0;
    button.setAttribute("aria-disabled", history.length === 0 ? "true" : "false");
    button.title = history.length
      ? `返回上一批推荐（还可返回 ${history.length} 批）`
      : "还没有可返回的推荐批次";

    const count = button.querySelector(".bhr-history-count");
    if (count) {
      const nextCount = history.length ? String(history.length) : "";
      if (count.textContent !== nextCount) {
        count.textContent = nextCount;
      }
      count.hidden = history.length === 0;
    }
  }

  function ensurePreviousButton() {
    const refreshButton = findRefreshButton();
    const controls = refreshButton?.closest(".feed-roll-btn");
    if (!refreshButton || !controls) {
      return;
    }

    controls.classList.add(READY_CLASS);

    let previousButton = document.getElementById(PREVIOUS_BUTTON_ID);
    if (!previousButton) {
      previousButton = document.createElement("button");
      previousButton.id = PREVIOUS_BUTTON_ID;
      previousButton.className = "primary-btn roll-btn bhr-previous-button";
      previousButton.type = "button";
      previousButton.setAttribute("aria-label", "上一批推荐");
      previousButton.innerHTML = `
        <span class="bhr-arrow" aria-hidden="true">↶</span>
        <span class="bhr-label">上一批</span>
        <span class="bhr-history-count" hidden></span>
      `;
      previousButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        restorePreviousBatch();
      });
      controls.appendChild(previousButton);
    }

    updatePreviousButton();
  }

  document.addEventListener("click", handleRefreshClick, true);

  const observer = new MutationObserver(() => {
    ensurePreviousButton();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  ensurePreviousButton();
})();
