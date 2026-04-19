function init() {
  const lu = localStorage.getItem("catl_coop_lastupdate");
  if (lu)
    document.getElementById("last-updated").textContent =
      "Mise à jour : " +
      new Date(lu).toLocaleString("fr-BE", {
        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
      });
  fetchInflows();
  updateTabBBadge(loadStock());
}

document.getElementById("add-modal").addEventListener("click", function (e) {
  if (e.target === this) closeAddModal();
});

init();
