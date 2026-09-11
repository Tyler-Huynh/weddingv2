(function () {
  const ACCESS_CODE = "112118";
  const STORAGE_KEY = "siteUnlocked";

  function initGate() {
    const gate = document.getElementById("accessGate");
    const siteContent = document.getElementById("siteContent");
    const accessInput = document.getElementById("accessCode");
    const accessButton = document.getElementById("accessSubmit");
    const accessError = document.getElementById("accessError");

    if (!gate || !siteContent || !accessInput || !accessButton || !accessError) return;

    function unlockSite() {
      sessionStorage.setItem(STORAGE_KEY, "true");
      gate.style.display = "none";
      siteContent.hidden = false;
      accessError.hidden = true;
      accessInput.value = "";
    }

    function showGate() {
      gate.style.display = "flex";
      siteContent.hidden = true;
      accessInput.value = "";
      accessInput.focus();
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

    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      unlockSite();
    } else {
      showGate();
    }
  }

  document.addEventListener("DOMContentLoaded", initGate);
})();