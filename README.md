# Simulateur Logistique CATL - Extension Coopérative

> Fork du projet original de Pierre-Alain Mory · Hackathon HELMo · Avril 2026

Ce dépôt est un fork du **Simulateur de Logistique en Circuit Court** de la CATL (Ceinture Aliment-Terre Liégeoise). Il conserve l'outil original intact et y ajoute un **tableau de bord coopératif** permettant de gérer les stocks alimentaires stratégiques et de simuler des scénarios de crise multi-zones.

## Ce qui a changé par rapport au fork original

### `index.html` - modification mineure

Un seul bouton a été ajouté dans l'en-tête de la page, à droite de la boîte de contact :

```html
<a href="coop.html" style="...">📦 Tableau de Bord Coopératif →</a>
```

Ce bouton permet aux gestionnaires de la coopérative d'accéder directement au tableau de bord sans modifier le flux de travail des producteurs.

### Nouveaux fichiers ajoutés

`coop.html` est le point d'entrée du tableau de bord coopératif. Le code JavaScript et CSS a été séparé en fichiers distincts pour plus de lisibilité :

```
catl/
├── index.html              ← Simulateur original (bouton ajouté dans le header)
├── coop.html               ← Tableau de bord coopératif (entrée HTML uniquement)
├── assets/
│   └── css/
│       └── coop.css        ← Tous les styles du tableau de bord
├── js/
│   ├── config.js           ← Constantes : FARMS, DAILY_NORMS, CAT_LABELS, clés Supabase
│   ├── data.js             ← DEFAULT_STOCK (29 produits), MOCK_INFLOWS
│   ├── state.js            ← Variables d'état globales
│   ├── utils.js            ← Fonctions utilitaires pures
│   ├── storage.js          ← Lecture/écriture localStorage
│   ├── supabase-client.js  ← Initialisation du client Supabase
│   ├── tabs.js             ← Navigation entre onglets
│   ├── tab-a.js            ← Onglet A : flux entrants
│   ├── tab-b.js            ← Onglet B : gestion des stocks et modal
│   ├── tab-c.js            ← Onglet C : simulateur de crise
│   ├── map-stock.js        ← Carte Leaflet de l'onglet B
│   ├── map-crisis.js       ← Carte Leaflet de l'onglet C
│   └── main.js             ← Initialisation et écouteurs d'événements
└── README.md
```

## Tableau de Bord Coopératif

Interface destinée aux **gestionnaires de la coopérative** (et non aux producteurs). Elle se compose de trois onglets.

### Onglet A - Flux Entrants

- Récupère en temps réel les tournées soumises par les producteurs via Supabase (`tournees_catl`)
- Se replie automatiquement sur des données de démonstration si Supabase est indisponible
- Affiche l'adresse et les coordonnées GPS de chaque ferme productrice
- Permet d'importer un apport confirmé directement dans le stock (Onglet B)
- Affiche l'historique des imports effectués

### Onglet B - Gestion des Stocks

- Inventaire complet du stock coopératif, persisté en `localStorage` (29 produits de démonstration)
- 5 catégories alimentaires : Céréales & légumineuses, Conserves & Condiments, Produits frais, Laitiers, Viande
- Chaque produit est rattaché à une ferme avec adresse et coordonnées GPS (lat/lng)
- Tri automatique FIFO par lot : les produits sont regroupés par nom et triés par date de réception, le lot le plus ancien est marqué "Lot 1 - FIFO"
- Seuils d'alerte péremption différenciés par catégorie (ex. 5 jours pour les frais, 60 jours pour les conserves)
- Ajout et suppression de produits via un formulaire modal
- Carte Leaflet sous le tableau montrant les stocks par ferme avec détail par catégorie au clic

### Onglet C - Simulateur de Résilience Multi-Zones

La simulation est basée sur les stocks réels de l'Onglet B répartis entre les 5 fermes.

Paramètres disponibles :
- Population à couvrir (curseur 500 à 50 000 personnes)
- Durée de la crise : 1 semaine / 2 semaines / 4 semaines / 2 mois
- Type de scénario : rupture standard / crise sévère (+30%) / crise extrême (+50%)
- Rayon de déplacement maximal : de 1 km (confinement strict, type COVID) à 25 km

Résultats produits :
- Autonomie globale en jours par catégorie alimentaire
- Identification du produit limitant (goulot d'étranglement)
- Analyse par zone (ferme) : autonomie par catégorie avec code couleur vert/orange/rouge
- Carte Leaflet de la région de Liège avec cercles de rayon représentant la zone de déplacement de chaque ferme, colorés selon le niveau de couverture
- Filtre par catégorie sur la carte pour visualiser les ruptures spécifiques

Le rayon de déplacement simule des scénarios de crise où les agriculteurs et citoyens ne peuvent pas se déplacer au-delà d'une certaine distance, comme lors du confinement COVID.

## Stack technique

| Élément | Technologie |
|---|---|
| Frontend | HTML / CSS / JavaScript vanilla |
| Cartographie | Leaflet.js 1.9.4 |
| Base de données | Supabase (même projet que l'outil original) |
| Persistance locale | localStorage (`catl_coop_stocks_v4`) |
| Hébergement | GitHub Pages (fichiers statiques) |

Aucun outil de build, aucun framework, aucune dépendance supplémentaire. Les fichiers fonctionnent directement dans un navigateur.

## Connexion Supabase

Les identifiants Supabase sont définis dans `js/config.js` :

```javascript
const SUPABASE_URL = 'https://lxoqhmfpnodyfnavmhmn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_...';
```

La table lue est `tournees_catl` — la même table dans laquelle les producteurs envoient leurs données via `index.html`. Aucune modification du schéma Supabase n'est nécessaire.

## Données de démonstration

Si Supabase ne retourne aucune donnée, `coop.html` charge automatiquement des données fictives réalistes (29 produits répartis sur 5 fermes autour de Liège, 5 apports producteurs) permettant une démonstration complète sans backend actif.

Pour réinitialiser les données de démonstration, changez la valeur de `STORAGE_KEY` dans `js/config.js` vers une nouvelle version (ex. `catl_coop_stocks_v5`), ce qui vide le cache localStorage du navigateur.

## Fermes de démonstration

5 fermes avec coordonnées GPS réelles autour de Liège :

| Ferme | Adresse | Direction |
|---|---|---|
| Ferme des Quatre Vents | Rue de la Ferme 12, 4430 Ans | Nord |
| HESBIO SARL | Chemin du Moulin 8, 4500 Huy | Sud-Ouest |
| Épicerie Solidaire | Avenue des Tilleuls 8, 4020 Liège Est | Est (ville) |
| Ferme du Moulin | Route de la Fraineuse 4, 4900 Spa | Sud-Est |
| Les Jardins de Liège | Rue des Jardins 22, 4460 Grâce-Hollogne | Ouest |

## Projet original

- **Auteur :** Pierre-Alain Mory
- **Dépôt source :** [github.com/pierrealainmory-hue/logistique-catl](https://github.com/pierrealainmory-hue/logistique-catl)
- **Démo originale :** [pierrealainmory-hue.github.io/logistique-catl](https://pierrealainmory-hue.github.io/logistique-catl)

## Challenge CATL - Hackathon HELMo 2026

Ce fork répond au challenge proposé par la **CATL** lors du hackathon HELMo d'avril 2026 :

> *"Quels outils numériques innovants peuvent permettre de piloter une coopérative de stockage alimentaire de manière efficace, prédictive et collaborative - en temps normal comme en situation de crise ?"*

Hackathon HELMo · Avril 2026
