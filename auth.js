(function () {
  const ACCESS_CODE = "112118";
  const STORAGE_KEY = "siteUnlocked";
  const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

  function initGate() {
    const gate = document.getElementById("accessGate");
    const siteContent = document.getElementById("siteContent");
    const accessInput = document.getElementById("accessCode");
    const accessButton = document.getElementById("accessSubmit");
    const accessError = document.getElementById("accessError");

    if (!gate || !siteContent || !accessInput || !accessButton || !accessError) return;

    let idleTimer = null;

    function isUnlocked() {
      const expiresAt = parseInt(sessionStorage.getItem(STORAGE_KEY), 10);
      return !isNaN(expiresAt) && Date.now() < expiresAt;
    }

    function extendSession() {
      sessionStorage.setItem(STORAGE_KEY, String(Date.now() + TIMEOUT_MS));
    }

    function unlockSite() {
      extendSession();
      gate.style.display = "none";
      siteContent.hidden = false;
      accessError.hidden = true;
      accessInput.value = "";
      startActivityWatch();
    }

    function showGate() {
      sessionStorage.removeItem(STORAGE_KEY);
      if (idleTimer) clearTimeout(idleTimer);
      gate.style.display = "flex";
      siteContent.hidden = true;
      accessInput.value = "";
      accessInput.focus();
    }

    function scheduleLock() {
      if (idleTimer) clearTimeout(idleTimer);
      const expiresAt = parseInt(sessionStorage.getItem(STORAGE_KEY), 10);
      const msLeft = (isNaN(expiresAt) ? 0 : expiresAt) - Date.now();
      if (msLeft <= 0) {
        showGate();
        return;
      }
      idleTimer = setTimeout(function () {
        if (!isUnlocked()) {
          showGate();
        } else {
          scheduleLock();
        }
      }, msLeft);
    }

    function startActivityWatch() {
      ["mousemove", "mousedown", "keydown", "scroll", "touchstart"].forEach(function (evt) {
        document.addEventListener(evt, function () {
          if (isUnlocked()) extendSession();
        }, { passive: true });
      });
      scheduleLock();
    }

    function tryUnlock() {
      if (accessInput.value === ACCESS_CODE) {
        unlockSite();
      } else {
        accessError.hidden = false;
        accessInput.focus();
        accessInput.select();
      }
    }

    accessButton.addEventListener("click", tryUnlock);

    accessInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        tryUnlock();
      }
    });

    if (isUnlocked()) {
      unlockSite();
    } else {
      showGate();
    }
  }

  document.addEventListener("DOMContentLoaded", initGate);
})();