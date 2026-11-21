# 🍳 Boutique Ustensile - Landing Page & Tableau de Bord en Temps Réel

Landing page moderne (bleu & blanc) pour boutique en ligne d'ustensiles de cuisine (Râpe & Découpe-Légumes Rotatif Multifonction 3-en-1) avec tableau de bord administrateur en temps réel.

## ✨ Fonctionnalités

### 🌐 Landing Page Client (`index.html`)
- **Design Moderne Bleu & Blanc :** Ergonomie soignée, effets de relief, animations fluides et typographie premium.
- **100% Mobile Responsive :** Adapté à tous les smartphones, tablettes et ordinateurs.
- **Hero Section :** Titre accrocheur, sous-titre, bouton CTA interactif menant au formulaire et mise en valeur du produit avec badges flottants.
- **Section 3 Lames en Inox :** Présentation détaillée des rouleaux interchangeables (trancheur, râpe épaisse, broyeur/râpe fine).
- **Tableau Comparatif :** Comparaison explicite entre râpe classique et Boutique Ustensile.
- **Section Tarifs & Packs :** 
  - Pack Solo (199 DH)
  - Pack Duo Populaire (349 DH - Livraison Gratuite)
  - Pack Famille (480 DH)
- **Formulaire de Commande Express en 1 Clic :** Pré-remplissage automatique, enregistrement de commande et finalisation sur WhatsApp.
- **Contact & Réseaux Sociaux :** Bouton flottant WhatsApp (+212 629-792377), réseaux sociaux (Facebook, Instagram, TikTok, YouTube).

### 📊 Tableau de Bord des Ventes (`dashboard.html`)
- **Synchronisation en direct (Temps Réel) :** Notification instantanée dès qu'une commande est passée sur le site via `BroadcastChannel` et `localStorage`.
- **Alerte Sonore :** Carillon caisse enregistreuse automatique lors d'une nouvelle vente.
- **Indicateurs KPI :** Chiffre d'Affaires total (DH), total des commandes, commandes en attente, commandes livrées.
- **Gestion des Commandes :** 
  - Bouton 1-clic pour appeler ou contacter le client sur WhatsApp avec message pré-rempli.
  - Sélecteur de statut modifiable en direct (*En attente, Confirmée, Expédiée, Livrée, Annulée*).
  - Recherche instantanée et filtrage par statut.
  - Export complet en fichier **CSV / Excel** avec encodage UTF-8.
  - Simulateur de commande pour tester le temps réel.

## 📁 Structure du Projet

```text
├── index.html          # Page d'accueil / Landing page client
├── style.css           # Feuille de style moderne (Bleu & Blanc)
├── script.js           # Logique interactive client (scroll, compte à rebours, commande)
├── dashboard.html      # Tableau de bord d'administration en temps réel
├── dashboard.css       # Style du tableau de bord
├── dashboard.js        # Gestion des commandes, KPI, alerte sonore, export CSV
├── images/
│   └── product.jpg     # Image haute définition de l'ustensile
└── README.md           # Documentation du projet
```

## 🚀 Utilisation Locale

1. Double-cliquez sur `index.html` pour ouvrir la boutique en ligne dans votre navigateur.
2. Ouvrez `dashboard.html` dans un second onglet pour observer les commandes arriver en direct !
