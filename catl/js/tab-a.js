function renderInflows() {
  let pending = 0;
  document.getElementById("inflows-body").innerHTML = activeInflows
    .map((f) => {
      const farm = getFarm(f.farmId);
      const confirmed = f.status === "confirme";
      if (!confirmed) pending++;
      const imported = importedIds.has(f.id);
      const statusBadge = confirmed
        ? `<span class="badge badge-success">Confirmé</span>`
        : `<span class="badge badge-warning">En attente</span>`;
      const btn = !confirmed
        ? `<button class="btn btn-outline btn-sm" disabled style="opacity:.5;cursor:not-allowed;">En attente</button>`
        : imported
          ? `<button class="btn btn-outline btn-sm" disabled style="opacity:.6;">✓ Importé</button>`
          : `<button class="btn btn-success btn-sm" onclick="importToStock(${f.id})">📥 Importer</button>`;
      return `<tr>
        <td><strong>${f.producer}</strong></td>
        <td style="font-size:.75rem;color:var(--text);">${farm.address}<br><span style="color:#aaa;font-size:.7rem;">${farm.lat.toFixed(4)}, ${farm.lng.toFixed(4)}</span></td>
        <td>${catBadge(f.category)}</td>
        <td style="font-size:.83rem;color:var(--text);">${f.products}</td>
        <td><strong>${fmt(f.volume)} kg</strong></td>
        <td>${fmt(f.value)} €</td>
        <td>${f.date}</td>
        <td>${statusBadge}</td>
        <td>${btn}</td>
      </tr>`;
    })
    .join("");
  document.getElementById("kpi-pending").textContent = pending;
  document.getElementById("alerts-a").innerHTML =
    pending > 0
      ? `<div class="alert-banner alert-warning">⚠️ ${pending} apport(s) en attente de confirmation producteur.</div>`
      : "";
}

function importToStock(flowId) {
  const flow = activeInflows.find((f) => f.id === flowId);
  if (!flow || importedIds.has(flowId)) return;
  const stocks = loadStock();
  stocks.push({
    id: getNextId(stocks),
    product: `${flow.products.split(",")[0].trim()}`,
    category: flow.category,
    quantity: Math.round(flow.volume * 0.6),
    unit: "kg",
    expiry: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
    farmId: flow.farmId,
    receivedDate: flow.date,
  });
  saveStockData(stocks);
  importedIds.add(flowId);
  renderInflows();
  updateImportHistory();
  updateTabBBadge(stocks);
  showToast(`✓ Apport de ${flow.producer} enregistré en stock !`);
}

function updateImportHistory() {
  if (importedIds.size === 0) return;
  document.getElementById("import-history").innerHTML = activeInflows
    .filter((f) => importedIds.has(f.id))
    .map((f) => {
      const farm = getFarm(f.farmId);
      return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f4f6f8;font-size:.875rem;">
        <span class="badge badge-success">✓ Importé</span>
        <strong>${f.producer}</strong>
        <span style="color:var(--text);">${f.products} · ${fmt(f.volume)} kg</span>
        <span style="color:var(--text);font-size:.72rem;">${farm.address}</span>
        <span style="margin-left:auto;color:var(--text);font-size:.78rem;">${f.date}</span>
      </div>`;
    })
    .join("");
}

async function fetchInflows() {
  try {
    const { data, error } = await supabaseClient
      .from("tournees_catl")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error || !data || data.length === 0) throw new Error("no data");
    const mapped = data.map((row, i) => {
      const tours = row.data_json?.tours || [];
      const totalVol = tours.reduce(
        (s, t) => s + t.stops.reduce((a, st) => a + (st.euro || 0), 0),
        0,
      );
      const products =
        tours.flatMap((t) => t.stops.map((st) => st.name)).filter(Boolean).slice(0, 3).join(", ") || "-";
      const farm = FARMS[i % FARMS.length];
      return {
        id: row.id,
        farmId: farm.id,
        producer: row.nom_producteur || "Producteur inconnu",
        products,
        category: "frais",
        volume: Math.round(totalVol * 0.4),
        value: Math.round(totalVol),
        date: row.created_at?.slice(0, 10) || "-",
        status: "confirme",
      };
    });
    const realNames = new Set(mapped.map((r) => r.producer));
    activeInflows = [...mapped, ...MOCK_INFLOWS.filter((m) => !realNames.has(m.producer))];
    document.getElementById("tab-a-badge").textContent = activeInflows.length;
    showToast(`✓ ${mapped.length} tournée(s) chargée(s) depuis Supabase`, "#3498db");
  } catch (e) {
    activeInflows = [...MOCK_INFLOWS];
    console.warn("Supabase unavailable, using mock data.", e.message);
  }
  renderInflows();
}

function refreshInflows() {
  fetchInflows();
}
