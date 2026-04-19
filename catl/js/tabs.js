function switchTab(tab) {
  ["a", "b", "c"].forEach((t) => {
    document.getElementById(`panel-${t}`).classList.toggle("active", t === tab);
    document.getElementById(`tab-btn-${t}`).classList.toggle("active", t === tab);
  });
  if (tab === "b") { renderStock(); setTimeout(initStockMap, 200); }
  if (tab === "c") { setTimeout(initCrisisMap, 200); }
}
