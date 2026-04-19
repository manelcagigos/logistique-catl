function daysUntilExpiry(d) {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(d) - t) / 86400000);
}

function computeUsableQuantity(item, duration) {
  const daysLeft = daysUntilExpiry(item.expiry);
  if (daysLeft <= 0) return 0;
  const ratio = Math.min(1, daysLeft / duration);
  return item.quantity * ratio;
}

function expiryBadge(days, category) {
  const t = CAT_THRESHOLDS[category] || { alert: 30, critical: 7 };
  if (days < 0)           return `<span class="badge badge-danger">Périmé</span>`;
  if (days <= t.critical) return `<span class="badge badge-danger">Critique - ${days}j</span>`;
  if (days <= t.alert)    return `<span class="badge badge-warning">Alerte - ${days}j</span>`;
  return `<span class="badge badge-success">${days} jours</span>`;
}

function dotClass(days, category) {
  const t = CAT_THRESHOLDS[category] || { alert: 30, critical: 7 };
  if (days <= t.critical) return "expiry-crit";
  if (days <= t.alert)    return "expiry-warn";
  return "expiry-ok";
}

function catBadge(cat) {
  const icons = { cereales: "🌾", conserves: "🥫", frais: "🥕", laitiers: "🥛", viande: "🥩" };
  return `<span class="badge badge-neutral">${icons[cat] || ""} ${cat}</span>`;
}

function fmt(n) {
  return Math.round(n).toLocaleString("fr-BE");
}

function showToast(msg, color) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = color || "#27ae60";
  t.classList.add("visible");
  setTimeout(() => t.classList.remove("visible"), 3000);
}

function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, r = (x) => (x * Math.PI) / 180;
  const dLat = r(lat2 - lat1), dLng = r(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCrisisClass(days, duration) {
  return days >= duration ? "ok" : days >= duration * 0.5 ? "warn" : "crit";
}

function getFarm(id) {
  return FARMS.find((f) => f.id === id) || FARMS[0];
}

function getNextId(items) {
  return items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}
