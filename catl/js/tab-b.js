function renderStock() {
  const stocks = loadStock();
  const filtered = (
    currentFilter === "all" ? stocks : stocks.filter((s) => s.category === currentFilter)
  ).sort((a, b) => {
    if (a.product !== b.product) return a.product.localeCompare(b.product);
    return new Date(a.receivedDate || a.expiry) - new Date(b.receivedDate || b.expiry);
  });

  const oldestLotByProduct = {};
  filtered.forEach((s) => {
    if (!oldestLotByProduct[s.product]) oldestLotByProduct[s.product] = s.id;
  });

  const tbody = document.getElementById("stock-body");
  if (!tbody) return;

  tbody.innerHTML =
    filtered.length === 0
      ? `<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text);">Aucun produit dans cette catégorie.</td></tr>`
      : filtered
          .map((s) => {
            const days = daysUntilExpiry(s.expiry);
            const farm = getFarm(s.farmId);
            const lotNumber = filtered.filter(
              (x) =>
                x.product === s.product &&
                new Date(x.receivedDate || x.expiry) <= new Date(s.receivedDate || s.expiry),
            ).length;
            const fifoBadge =
              oldestLotByProduct[s.product] === s.id
                ? '<span class="badge badge-info">Lot 1 - FIFO</span>'
                : `<span class="badge badge-neutral">Lot ${lotNumber}</span>`;

            return `<tr>
              <td><span class="expiry-dot ${dotClass(days, s.category)}"></span><strong>${s.product}</strong></td>
              <td>${catBadge(s.category)}</td>
              <td><strong>${fmt(s.quantity)}</strong> ${s.unit}</td>
              <td>${expiryBadge(days, s.category)}<div style="font-size:.7rem;color:var(--text);margin-top:2px;">${s.expiry}</div></td>
              <td>${fifoBadge}</td>
              <td style="font-size:.8rem;"><span style="color:${farm.color};font-weight:700;">●</span> ${farm.name}</td>
              <td style="font-size:.72rem;color:var(--text);">${farm.address}<br><span style="color:#aaa;">${farm.lat.toFixed(4)}, ${farm.lng.toFixed(4)}</span></td>
              <td><button class="btn btn-outline btn-sm" onclick="deleteStock(${s.id})" style="color:var(--danger);border-color:var(--danger);">✕</button></td>
            </tr>`;
          })
          .join("");

  updateStockKPIs(stocks);
  if (stockMap) updateStockMapMarkers(stocks);
}

function updateStockKPIs(stocks) {
  const alerts = stocks.filter((s) => {
    const d = daysUntilExpiry(s.expiry);
    const t = CAT_THRESHOLDS[s.category] || { alert: 30 };
    return d >= 0 && d <= t.alert;
  }).length;
  document.getElementById("kpi-total-products").textContent = stocks.length;
  document.getElementById("kpi-expiry-alerts").textContent = alerts;
  document.getElementById("kpi-total-weight").textContent = fmt(
    stocks.reduce((a, s) => a + s.quantity, 0),
  );
  document.getElementById("kpi-stock-value").textContent = fmt(
    stocks.reduce((a, s) => a + s.quantity * (PRICE_ESTIMATE[s.category] || 1), 0),
  );
  const critical = stocks.filter((s) => {
    const d = daysUntilExpiry(s.expiry);
    const t = CAT_THRESHOLDS[s.category] || { critical: 7 };
    return d >= 0 && d <= t.critical;
  });
  document.getElementById("alerts-b").innerHTML =
    critical.length > 0
      ? `<div class="alert-banner alert-danger">🚨 ${critical.length} produit(s) expirent dans moins de 7 jours : ${critical.map((s) => s.product).join(", ")}.</div>`
      : "";
}

function updateTabBBadge(stocks) {
  const a = stocks.filter((s) => {
    const d = daysUntilExpiry(s.expiry);
    return d >= 0 && d <= 30;
  }).length;
  document.getElementById("tab-b-badge").textContent = a > 0 ? `⚠ ${a}` : stocks.length;
}

function filterStock(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderStock();
}

function deleteStock(id) {
  if (!confirm("Retirer ce produit du stock coopératif ?")) return;
  const stocks = loadStock().filter((s) => s.id !== id);
  saveStockData(stocks);
  renderStock();
  showToast("Produit retiré du stock.", "#e74c3c");
}

function openAddModal() {
  const sel = document.getElementById("m-farm");
  sel.innerHTML =
    '<option value="">- Choisir une ferme -</option>' +
    FARMS.map((f) => `<option value="${f.id}">${f.name} - ${f.address}</option>`).join("");
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  document.getElementById("m-expiry").value = d.toISOString().slice(0, 10);
  document.getElementById("m-farm-coords").textContent = "Sélectionnez une ferme pour voir ses coordonnées.";
  document.getElementById("add-modal").classList.add("open");
}

function closeAddModal() {
  document.getElementById("add-modal").classList.remove("open");
  ["m-product", "m-quantity"].forEach((id) => (document.getElementById(id).value = ""));
}

function fillFarmCoords() {
  const farm = FARMS.find((f) => f.id === document.getElementById("m-farm").value);
  document.getElementById("m-farm-coords").textContent = farm
    ? `📍 ${farm.address} · lat ${farm.lat}, lng ${farm.lng}`
    : "Sélectionnez une ferme pour voir ses coordonnées.";
}

function saveNewStock() {
  const product  = document.getElementById("m-product").value.trim();
  const quantity = parseFloat(document.getElementById("m-quantity").value);
  const expiry   = document.getElementById("m-expiry").value;
  const farmId   = document.getElementById("m-farm").value;
  if (!product || !quantity || !expiry || !farmId) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }
  const stocks = loadStock();
  stocks.push({
    id: getNextId(stocks),
    product,
    category: document.getElementById("m-category").value,
    quantity,
    unit: document.getElementById("m-unit").value,
    expiry,
    farmId,
  });
  saveStockData(stocks);
  renderStock();
  updateTabBBadge(stocks);
  closeAddModal();
  showToast(`✓ "${product}" ajouté au stock.`);
}
