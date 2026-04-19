const STORAGE_KEY = "catl_coop_stocks_v4";

const SUPABASE_URL = "https://lxoqhmfpnodyfnavmhmn.supabase.co";
const SUPABASE_KEY = "sb_publishable_-LPq5CilDsNJcBuOKSG_hw_2nZUZrYg";

const FARMS = [
  { id: "f1", name: "Ferme des Quatre Vents", address: "Rue de la Ferme 12, 4430 Ans",           lat: 50.665, lng: 5.532, color: "#e74c3c" },
  { id: "f2", name: "HESBIO SARL",            address: "Chemin du Moulin 8, 4500 Huy",            lat: 50.52,  lng: 5.242, color: "#e67e22" },
  { id: "f3", name: "Épicerie Solidaire",      address: "Avenue des Tilleuls 8, 4020 Liège Est",  lat: 50.638, lng: 5.598, color: "#3498db" },
  { id: "f4", name: "Ferme du Moulin",         address: "Route de la Fraineuse 4, 4900 Spa",       lat: 50.49,  lng: 5.855, color: "#27ae60" },
  { id: "f5", name: "Les Jardins de Liège",    address: "Rue des Jardins 22, 4460 Grâce-Hollogne", lat: 50.603, lng: 5.432, color: "#8e44ad" },
];

const DAILY_NORMS = { cereales: 300, conserves: 230, frais: 400, laitiers: 250, viande: 150 };

const CAT_LABELS = {
  cereales: "🌾 Céréales & légumineuses",
  conserves: "🥫 Conserves & Condiments",
  frais: "🥕 Produits frais",
  laitiers: "🥛 Laitiers",
  viande: "🥩 Viande",
};

const CAT_COLORS = {
  cereales: "#e67e22",
  conserves: "#3498db",
  frais: "#27ae60",
  laitiers: "#9b59b6",
  viande: "#e74c3c",
};

const PRICE_ESTIMATE = { cereales: 0.9, conserves: 2.1, frais: 1.2, laitiers: 1.5, viande: 8.0 };

const CAT_THRESHOLDS = {
  cereales:  { alert: 90,  critical: 30 },
  conserves: { alert: 180, critical: 60 },
  frais:     { alert: 14,  critical: 5  },
  laitiers:  { alert: 30,  critical: 10 },
  viande:    { alert: 21,  critical: 7  },
};
