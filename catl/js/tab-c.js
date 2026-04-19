function updatePopDisplay() {
  document.getElementById("pop-val").textContent = fmt(
    parseInt(document.getElementById("population").value),
  );
}

function updateRadiusDisplay() {
  selectedRadius = parseInt(document.getElementById("crisis-radius").value);
  document.getElementById("radius-val").textContent = selectedRadius;
}

function setDuration(days, btn) {
  selectedDuration = days;
  document.querySelectorAll(".dur-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("duration-display").textContent =
    { 7: "7 jours", 14: "14 jours", 28: "28 jours", 60: "60 jours" }[days] || `${days} jours`;
}

function updateCrisisDesc() {
  document.getElementById("crisis-type-desc").textContent =
    {
      standard: "Consommation normale maintenue.",
      severe:   "Consommation élevée, pression accrue de 30% sur les stocks.",
      extreme:  "Consommation d'urgence, pression accrue de 50% sur les stocks.",
    }[document.getElementById("crisis-type").value] || "";
}

function setCrisisCategoryFilter(cat, btn) {
  selectedCrisisCategory = cat;
  document.querySelectorAll(".crisis-cat-btn").forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  if (lastCrisisRun) renderCrisisZoneViews(lastCrisisRun);
}

function renderCrisisZoneViews(run) {
  const { farmResults, radius, duration } = run;

  document.getElementById("zone-results-grid").innerHTML = farmResults
    .map((r) => {
      const status = getCrisisClass(r.minDays, duration);

      const details =
        selectedCrisisCategory === "all"
          ? Object.entries(r.cats)
              .map(([cat, v]) => {
                const cls = getCrisisClass(v.days, duration);
                return `<div class="zone-cat-row"><span>${CAT_LABELS[cat]}</span><span class="val ${cls}">
  ${v.days >= 9999 ? "∞" : v.days}j
  <span style="font-size:10px;color:#888;">
    (${fmt(v.raw)} kg)
  </span>
</span></div>`;
              })
              .join("")
          : (() => {
              const cat = selectedCrisisCategory;
              const v = r.cats[cat];
              const cls = getCrisisClass(v.days, duration);
              return `<div class="zone-cat-row"><span>${CAT_LABELS[cat]}</span><span class="val ${cls}">
  ${v.days >= 9999 ? "∞" : v.days}j
  <span style="font-size:10px;color:#888;">
    (${fmt(v.raw)} kg)
  </span>
</span></div>
              <div style="margin-top:8px;font-size:.75rem;color:var(--text);">
                Stock ferme : <strong>${fmt(v.raw)} kg</strong><br/>Besoin/jour : <strong>${v.dailyNeed.toFixed(1)} kg</strong>
              </div>`;
            })();

      const autonomyDays = r.minDays;

      return `
        <div class="zone-result-card ${status}">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="width:10px;height:10px;border-radius:50%;background:${r.farm.color};display:inline-block;flex-shrink:0;"></span>
            <div class="zone-result-name">${r.farm.name}</div>
          </div>
          <div style="font-size:.72rem;color:var(--text);margin-bottom:8px;">${r.farm.address}</div>
          ${details}
        </div>`;
    })
    .join("");

  updateCrisisMapZones(farmResults, radius, duration, selectedCrisisCategory);
}

function runCrisisSimulation() {
  const population = parseInt(document.getElementById("population").value);
  const duration   = selectedDuration;
  const radius     = parseInt(document.getElementById("crisis-radius").value);
  const mult =
    { standard: 1.0, severe: 1.3, extreme: 1.5 }[
      document.getElementById("crisis-type").value
    ] || 1.0;
  const stocks     = loadStock();
  const popPerFarm = population / FARMS.length;

  const stock = {};
  FARMS.forEach((f) => {
    stock[f.id] = {};
    Object.keys(DAILY_NORMS).forEach((c) => (stock[f.id][c] = 0));
  });
  stocks.forEach((s) => {
    const usableQty = computeUsableQuantity(s, duration);
    if (stock[s.farmId]?.[s.category] !== undefined) {
      stock[s.farmId][s.category] += usableQty;
    }
  });

  const farmResults = FARMS.map((farm) => {
    const cats = {};
    Object.keys(DAILY_NORMS).forEach((cat) => {
      const dailyKg = ((DAILY_NORMS[cat] * popPerFarm) / 1000) * mult;
      const days = dailyKg > 0 ? Math.floor(stock[farm.id][cat] / dailyKg) : 9999;
      cats[cat] = { days, raw: stock[farm.id][cat], effective: stock[farm.id][cat], dailyNeed: dailyKg };
    });
    const minDays = Math.min(...Object.values(cats).map((c) => c.days));
    const status  = minDays >= duration ? "ok" : minDays >= duration * 0.5 ? "warn" : "crit";
    return { farm, cats, minDays, status };
  });

  const global = {};
  Object.keys(DAILY_NORMS).forEach((cat) => {
    const totalStock = FARMS.reduce((s, f) => s + stock[f.id][cat], 0);
    const dailyKg    = ((DAILY_NORMS[cat] * population) / 1000) * mult;
    const days       = dailyKg > 0 ? Math.floor(totalStock / dailyKg) : 9999;
    global[cat] = { totalStock, dailyKg, days };
  });
  const bottleneck = Object.entries(global).reduce(
    (m, [k, v]) => (v.days < m[1].days ? [k, v] : m),
    Object.entries(global)[0],
  );

  document.getElementById("autonomy-grid").innerHTML = Object.entries(global)
    .map(([cat, v]) => {
      const cls = v.days >= duration ? "ok" : v.days >= duration * 0.5 ? "warn" : "crit";
      const pct = Math.min(100, Math.round((v.days / duration) * 100));
      return `<div class="autonomy-card" style="border-top:3px solid ${CAT_COLORS[cat]};">
        <div class="autonomy-label">${CAT_LABELS[cat]}</div>
        <div class="autonomy-days ${cls}">${v.days >= 9999 ? "∞" : v.days}</div>
        <div class="autonomy-sub">jours d'autonomie globale</div>
        <div style="margin-top:10px;height:5px;background:#eef2f7;border-radius:3px;">
          <div style="height:5px;border-radius:3px;background:${CAT_COLORS[cat]};width:${pct}%;"></div>
        </div>
        <div style="font-size:.72rem;color:var(--text);margin-top:5px;">${fmt(v.totalStock)} kg · ${v.dailyKg.toFixed(1)} kg/j</div>
      </div>`;
    })
    .join("");

  document.getElementById("bottleneck-product").textContent =
    `${CAT_LABELS[bottleneck[0]]} - ${bottleneck[1].days >= 9999 ? "∞" : bottleneck[1].days} jours`;
  document.getElementById("bottleneck-desc").textContent =
    `Stock global : ${fmt(bottleneck[1].totalStock)} kg. Besoin journalier (${fmt(population)} pers.) : ${bottleneck[1].dailyKg.toFixed(1)} kg/j.`;
  document.getElementById("sim-summary").textContent =
    `${fmt(population)} personnes · ${duration} jours · Rayon ${radius} km`;
  document.getElementById("radius-label").textContent = radius;

  lastCrisisRun = { farmResults, radius, duration };
  renderCrisisZoneViews(lastCrisisRun);
  document.getElementById("crisis-results").classList.add("visible");
  setTimeout(
    () => document.getElementById("crisis-results").scrollIntoView({ behavior: "smooth", block: "start" }),
    100,
  );
}
