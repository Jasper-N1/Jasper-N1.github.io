(() => {
  const toggle = document.querySelector(".primary-menu-toggle");
  const links = document.getElementById("primary-menu");
  const pricing = document.getElementById("pricing");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  links.addEventListener("click", event => {
    const link = event.target.closest("a");
    if (!link) return;
    if (pricing && link.hash === "#pricing") pricing.open = true;
    setMenu(false);
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || toggle.getAttribute("aria-expanded") !== "true") return;
    setMenu(false);
    toggle.focus();
  });
  function showPricing() {
    if (pricing && location.hash === "#pricing") pricing.open = true;
  }
  addEventListener("hashchange", showPricing);
  showPricing();
})();
