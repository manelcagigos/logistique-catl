function initStockMap() {
  if (stockMap) { updateStockMapMarkers(loadStock()); return; }
  stockMap = L.map("stock-map").setView([50.6, 5.56], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
  }).addTo(stockMap);
  updateStockMapMarkers(loadStock());
}

function updateStockMapMarkers(stocks) {
  stockMarkers.forEach((m) => m.remove());
  stockMarkers = [];
  FARMS.forEach((farm) => {
    const fs = stocks.filter((s) => s.farmId === farm.id);
    if (fs.length === 0) return;
    const totalKg = fs.reduce((a, s) => a + s.quantity, 0);
    const bycat = {};
    Object.keys(CAT_LABELS).forEach((c) => (bycat[c] = 0));
    fs.forEach((s) => { if (bycat[s.category] !== undefined) bycat[s.category] += s.quantity; });

    const popup = `<div style="min-width:200px;">
      <div style="font-weight:700;font-size:13px;color:${farm.color};margin-bottom:6px;">🏠 ${farm.name}</div>
      <div style="font-size:11px;color:#666;margin-bottom:4px;">${farm.address}</div>
      <div style="font-size:10px;color:#aaa;margin-bottom:8px;">📍 ${farm.lat.toFixed(4)}, ${farm.lng.toFixed(4)}</div>
      <div style="border-top:1px solid #eee;padding-top:8px;">
        ${Object.entries(bycat)
          .filter(([, v]) => v > 0)
          .map(([cat, qty]) =>
            `<div style="display:flex;justify-content:space-between;font-size:11px;padding:2px 0;">
              <span>${CAT_LABELS[cat]}</span>
              <strong style="color:${CAT_COLORS[cat]};">${fmt(qty)} kg</strong>
            </div>`,
          )
          .join("")}
      </div>
      <div style="border-top:1px solid #eee;padding-top:6px;margin-top:6px;font-size:11px;font-weight:700;">Total : ${fmt(totalKg)} kg · ${fs.length} référence(s)</div>
    </div>`;

    const icon = L.divIcon({
      html: `<div style="background:${farm.color};color:white;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.3);border:2px solid white;text-align:center;line-height:1.2;">${(totalKg / 1000).toFixed(1)}t</div>`,
      className: "",
      iconAnchor: [19, 19],
    });
    stockMarkers.push(L.marker([farm.lat, farm.lng], { icon }).addTo(stockMap).bindPopup(popup));
  });
}
