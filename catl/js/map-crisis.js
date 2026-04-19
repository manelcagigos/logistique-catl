function initCrisisMap() {
  if (crisisMap) return;
  document.getElementById("crisis-results").classList.add("visible");
  setTimeout(() => { if (crisisMap) crisisMap.invalidateSize(); }, 100);
  crisisMap = L.map("crisis-map").setView([50.58, 5.56], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(crisisMap);
  L.marker([50.632, 5.579], {
    icon: L.divIcon({
      html: `<div style="background:#2c3e50;color:white;border-radius:4px;padding:3px 8px;font-size:10px;font-weight:700;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,.3);">🏙️ Liège</div>`,
      className: "",
      iconAnchor: [30, 12],
    }),
  }).addTo(crisisMap);
}

function updateCrisisMapZones(farmResults, radius, duration, categoryFilter = "all") {
  if (!crisisMap) return;
  crisisLayers.forEach((l) => l.remove());
  crisisLayers = [];
  const sc = { ok: "#27ae60", warn: "#f39c12", crit: "#e74c3c" };

  farmResults.forEach((r) => {
    const daysForMap =
      categoryFilter === "all" ? r.minDays : (r.cats[categoryFilter]?.days ?? r.minDays);
    if (categoryFilter != "all" && daysForMap == 0) return;
    const status = getCrisisClass(daysForMap, duration);
    const col = sc[status];

    const circle = L.circle([r.farm.lat, r.farm.lng], {
      color: col,
      fillColor: col,
      fillOpacity: 0.2,
      radius: radius * 1000,
      weight: 2,
    }).addTo(crisisMap);

    const popupLine =
      categoryFilter === "all"
        ? `Autonomie min : <strong>${r.minDays >= 9999 ? "∞" : r.minDays} jours</strong><br>`
        : `Autonomie min : <strong>${daysForMap >= 9999 ? "∞" : daysForMap} jours</strong><br>
           Stock ferme : <strong>${fmt(r.cats[categoryFilter].raw)} kg</strong><br/>Besoin/jour : <strong>${r.cats[categoryFilter].dailyNeed.toFixed(1)} kg</strong><br>`;

    const gaps =
      categoryFilter === "all"
        ? Object.entries(r.cats).filter(([, v]) => v.days < duration).map(([cat]) => CAT_LABELS[cat])
        : daysForMap < duration ? [CAT_LABELS[categoryFilter]] : [];

    circle.bindPopup(`<strong style="color:${r.farm.color};">${r.farm.name}</strong><br>
      <em style="font-size:11px;">${r.farm.address}</em><br>
      <span style="font-size:10px;color:#888;">📍 ${r.farm.lat.toFixed(4)}, ${r.farm.lng.toFixed(4)}</span><br><br>
      ${popupLine}
      ${categoryFilter === "all"
        ? gaps.length > 0
          ? `<span style="color:#e74c3c;">⚠️ Ruptures : ${gaps.join(", ")}</span>`
          : '<span style="color:#27ae60;">✅ Toutes catégories couvertes</span>'
        : ""
      }`);

    crisisLayers.push(circle);
    crisisLayers.push(
      L.marker([r.farm.lat, r.farm.lng], {
        icon: L.divIcon({
          html: `<div style="background:#333333;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid white;">${daysForMap >= 9999 ? "∞" : daysForMap}j</div>`,
          className: "",
          iconAnchor: [16, 16],
        }),
      }).addTo(crisisMap),
    );
  });
  crisisMap.invalidateSize();
}
