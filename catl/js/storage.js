function loadStock() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STOCK));
    return [...DEFAULT_STOCK];
  }
  return JSON.parse(raw);
}

function saveStockData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("catl_coop_lastupdate", new Date().toISOString());
  document.getElementById("last-updated").textContent =
    "Mise à jour : " +
    new Date().toLocaleString("fr-BE", {
      day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    });
}
