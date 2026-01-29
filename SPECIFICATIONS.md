# Spécifications SAAS Expert-Comptable
## Prévisionnel Comptable - MVP

---

## 1. Vue d'Ensemble du Projet

### 1.1 Objectif
Développer un SAAS d'expertise comptable aux normes françaises, conforme au Plan Comptable Général (PCG) et aux exigences du Fichier des Écritures Comptables (FEC). La MVP se concentre sur le module de **prévisionnel comptable**.

### 1.2 Public Cible
- Experts-comptables
- Cabinets d'expertise comptable
- TPE/PME françaises
- Créateurs d'entreprise

### 1.3 Positionnement Concurrentiel
S'inspirer des leaders du marché (Cegid Loop, Sage Génération Experts, Pennylane) tout en proposant une solution moderne, intuitive et accessible.

---

## 2. Spécifications Fonctionnelles MVP

### 2.1 Module Prévisionnel Comptable

Le prévisionnel comptable comprend les tableaux financiers suivants :

#### 2.1.1 Compte de Résultat Prévisionnel
**Objectif** : Récapituler produits et charges sur 3 à 5 ans

**Structure des Produits** :
- Chiffre d'affaires prévisionnel
  - Ventes de marchandises
  - Production vendue (biens)
  - Production vendue (services)
- Subventions d'exploitation
- Autres produits d'exploitation
- Produits financiers
- Produits exceptionnels

**Structure des Charges** :
- Achats de marchandises
- Achats de matières premières
- Variation de stocks
- Services extérieurs
  - Sous-traitance
  - Location
  - Entretien et réparations
  - Assurances
  - Documentation
  - Honoraires
  - Publicité
  - Transports
  - Déplacements
  - Frais postaux et télécommunications
  - Services bancaires
- Impôts et taxes
- Charges de personnel
  - Salaires et traitements
  - Charges sociales
- Dotations aux amortissements
- Charges financières (intérêts d'emprunts)
- Charges exceptionnelles
- Impôt sur les sociétés / Impôt sur le revenu

**Indicateurs calculés** :
- Marge commerciale
- Marge sur production
- Valeur ajoutée
- Excédent Brut d'Exploitation (EBE)
- Résultat d'exploitation
- Résultat courant avant impôts
- Résultat net

#### 2.1.2 Bilan Prévisionnel
**Objectif** : Photographie patrimoniale à chaque clôture d'exercice

**Actif** :
- *Actif immobilisé*
  - Immobilisations incorporelles (fonds de commerce, brevets, logiciels)
  - Immobilisations corporelles (terrains, constructions, matériel, véhicules)
  - Immobilisations financières
  - Amortissements cumulés (en déduction)
  
- *Actif circulant*
  - Stocks et en-cours
  - Créances clients et comptes rattachés
  - Autres créances
  - Disponibilités (banque, caisse)
  - Charges constatées d'avance

**Passif** :
- *Capitaux propres*
  - Capital social
  - Réserves
  - Report à nouveau
  - Résultat de l'exercice
  
- *Dettes financières*
  - Emprunts et dettes auprès des établissements de crédit
  - Emprunts et dettes financières diverses
  - Avances conditionnées
  
- *Dettes d'exploitation*
  - Dettes fournisseurs et comptes rattachés
  - Dettes fiscales et sociales
  - Autres dettes
  - Produits constatés d'avance

#### 2.1.3 Plan de Financement
**Objectif** : Anticiper besoins et ressources financières sur 3 ans

**Besoins** :
- Frais d'établissement
- Investissements incorporels
- Investissements corporels
- Investissements financiers
- Besoin en fonds de roulement (BFR)
- Remboursement d'emprunts
- Distributions de dividendes

**Ressources** :
- Apport en capital
- Apports en comptes courants d'associés
- Subventions
- Emprunts bancaires
- Autres emprunts
- Capacité d'autofinancement (CAF)
- Cessions d'actifs

**Équilibre** : Ressources - Besoins = Variation de trésorerie

#### 2.1.4 Besoin en Fonds de Roulement (BFR)
**Objectif** : Calculer le décalage de trésorerie lié à l'exploitation

**Composantes** :
- Stocks moyens (valorisation en jours de CA ou achats)
- Créances clients (délai moyen de règlement en jours)
- Dettes fournisseurs (délai moyen de paiement en jours)
- TVA déductible / collectée

**Formule** :
```
BFR = Stocks + Créances clients - Dettes fournisseurs
```

**Calcul du BFR initial** :
```
BFR initial = Stocks de départ TTC + Frais généraux d'avance + Crédit TVA sur investissements
```

#### 2.1.5 Plan de Trésorerie Mensuel
**Objectif** : Suivre les flux de trésorerie mois par mois (12-36 mois)

**Encaissements** :
- Chiffre d'affaires encaissé (tenant compte des délais de paiement)
- Apports en capital
- Emprunts reçus
- Subventions encaissées
- Autres encaissements

**Décaissements** :
- Achats décaissés (tenant compte des délais fournisseurs)
- Charges externes
- Salaires
- Charges sociales (décalage URSSAF)
- TVA à décaisser
- Impôts et taxes
- Investissements
- Remboursements d'emprunts (capital + intérêts)
- Dividendes versés

**Solde** :
- Trésorerie début de mois
- Encaissements - Décaissements
- Trésorerie fin de mois

---

## 3. Spécifications Techniques

### 3.1 Architecture
- **Frontend** : Next.js 14+ (React) avec TypeScript
- **Backend** : API Routes Next.js ou Node.js/Express
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : NextAuth.js (Auth.js)
- **Stockage fichiers** : AWS S3 ou équivalent
- **Déploiement** : Vercel / AWS

### 3.2 Modèle de Données Principal

#### Entités Principales
```
Utilisateur
├── id, email, mot de passe, nom, prénom
├── rôle (admin, expert-comptable, collaborateur, client)
└── cabinet_id

Cabinet
├── id, nom, SIREN, adresse
├── logo, paramètres
└── abonnement

Client (Entreprise cliente)
├── id, cabinet_id
├── raison_sociale, forme_juridique
├── SIREN, SIRET, code_NAF
├── adresse, contacts
├── exercice_comptable (date début/fin)
└── régime_fiscal (IS, IR, micro)

Prévisionnel
├── id, client_id
├── titre, description
├── date_création, date_modification
├── statut (brouillon, validé, archivé)
├── période_début, période_fin (années)
└── nombre_mois (12, 24, 36...)

Hypothèses
├── id, prévisionnel_id
├── taux_TVA_ventes, taux_TVA_achats
├── délai_paiement_clients (jours)
├── délai_paiement_fournisseurs (jours)
├── taux_charges_sociales
├── taux_IS
└── paramètres_amortissements

Ligne_CA (Chiffre d'Affaires)
├── id, prévisionnel_id
├── libellé, catégorie
├── type (ventes, services, production)
├── montants_mensuels[] ou montant_annuel
├── évolution_annuelle (%)
└── taux_TVA

Ligne_Charge
├── id, prévisionnel_id
├── compte_PCG, libellé
├── type (fixe, variable)
├── montants_mensuels[] ou montant_annuel
├── évolution_annuelle (%)
├── taux_TVA
└── récurrence (mensuel, trimestriel, annuel)

Investissement
├── id, prévisionnel_id
├── libellé, catégorie
├── montant_HT, TVA
├── date_acquisition
├── durée_amortissement
├── mode_amortissement (linéaire, dégressif)
└── valeur_résiduelle

Financement
├── id, prévisionnel_id
├── type (capital, compte_courant, emprunt, subvention)
├── montant, date
├── durée (mois), taux_intérêt
├── différé (mois)
└── tableau_amortissement[]

Effectif
├── id, prévisionnel_id
├── poste, type_contrat
├── salaire_brut_mensuel
├── date_embauche, date_fin
├── charges_patronales (%)
└── avantages
```

### 3.3 Conformité Réglementaire

#### Plan Comptable Général (PCG)
- Nomenclature des comptes conforme aux classes 1 à 7
- Possibilité de personnaliser les sous-comptes
- Référentiel PCG 2024 intégré

#### Classes de comptes PCG
```
Classe 1 - Comptes de capitaux
Classe 2 - Comptes d'immobilisations
Classe 3 - Comptes de stocks
Classe 4 - Comptes de tiers
Classe 5 - Comptes financiers
Classe 6 - Comptes de charges
Classe 7 - Comptes de produits
```

#### Formats d'Export
- **PDF** : Prévisionnels formatés pour banques/investisseurs
- **Excel** : Tableaux modifiables avec formules
- **FEC** : Format normalisé pour contrôle fiscal (si écritures réelles)

---

## 4. Fonctionnalités de l'Interface

### 4.1 Dashboard Prévisionnel
- Vue synthétique des indicateurs clés
- Graphiques interactifs (CA, résultat, trésorerie)
- Alertes (trésorerie négative, BFR critique)
- Comparaison scénarios (optimiste/réaliste/pessimiste)

### 4.2 Saisie des Données
- Formulaires guidés par étapes
- Import de données existantes (Excel, CSV)
- Modèles prédéfinis par secteur d'activité
- Auto-complétion des comptes PCG
- Calculs automatiques et interdépendants

### 4.3 Visualisation
- Tableaux interactifs paginés
- Graphiques Chart.js / Recharts
  - Évolution du CA
  - Structure des charges
  - Courbe de trésorerie
  - Seuil de rentabilité
- Mode comparaison (N vs N-1, scénarios)

### 4.4 Export et Partage
- Export PDF formaté (logo cabinet, mise en page pro)
- Export Excel multi-feuilles
- Lien de partage sécurisé (lecture seule)
- Historique des versions

---

## 5. Exigences Non-Fonctionnelles

### 5.1 Performance
- Temps de chargement < 2 secondes
- Calculs instantanés côté client
- Optimisation des requêtes base de données

### 5.2 Sécurité
- Authentification sécurisée (2FA optionnel)
- Chiffrement des données au repos et en transit
- Conformité RGPD
- Journalisation des accès

### 5.3 Disponibilité
- SLA 99.5%
- Sauvegardes quotidiennes
- Procédures de reprise d'activité

### 5.4 Accessibilité
- Interface responsive (desktop, tablette)
- Compatibilité navigateurs récents
- Respect WCAG 2.1 niveau AA

---

## 6. Roadmap MVP

### Phase 1 : Fondations (2 semaines)
- [ ] Setup projet Next.js + TypeScript
- [ ] Configuration base de données PostgreSQL
- [ ] Modèle de données Prisma
- [ ] Authentification NextAuth.js
- [ ] Design system / composants UI de base

### Phase 2 : Module Compte de Résultat (2 semaines)
- [ ] Saisie du chiffre d'affaires
- [ ] Saisie des charges
- [ ] Calculs automatiques des SIG
- [ ] Affichage tableau compte de résultat
- [ ] Graphiques associés

### Phase 3 : Module Bilan Prévisionnel (2 semaines)
- [ ] Gestion des investissements et amortissements
- [ ] Tableau amortissements
- [ ] Génération automatique du bilan
- [ ] Équilibre actif/passif

### Phase 4 : Module Plan de Financement (1 semaine)
- [ ] Saisie des financements
- [ ] Tableaux d'amortissement des emprunts
- [ ] Calcul CAF
- [ ] Équilibre besoins/ressources

### Phase 5 : Module Trésorerie et BFR (2 semaines)
- [ ] Paramétrage des hypothèses (délais paiement)
- [ ] Calcul automatique BFR
- [ ] Plan de trésorerie mensuel
- [ ] Alertes trésorerie négative

### Phase 6 : Exports et Finalisation (1 semaine)
- [ ] Export PDF professionnel
- [ ] Export Excel
- [ ] Dashboard synthétique
- [ ] Tests et correctifs

**Durée totale estimée MVP : 10 semaines**

---

## 7. Évolutions Post-MVP

### Court terme
- Gestion multi-prévisionnels (scénarios)
- Modèles sectoriels pré-remplis
- Import automatisé de données bancaires

### Moyen terme
- Module comptabilité réelle
- Synchronisation FEC
- Déclarations fiscales (TVA, IS)

### Long terme
- Module paie
- Rapprochement bancaire automatique
- Intelligence artificielle (prédictions, anomalies)
- Application mobile

---

## 8. Critères d'Acceptation MVP

### Fonctionnels
- [ ] Création et gestion d'un prévisionnel complet
- [ ] Tous les tableaux financiers calculés correctement
- [ ] Exports PDF/Excel fonctionnels
- [ ] Conformité PCG

### Techniques
- [ ] Pas d'erreur critique en production
- [ ] Tests couvrant les calculs financiers
- [ ] Documentation technique à jour

### Utilisateur
- [ ] Parcours utilisateur fluide
- [ ] Temps de prise en main < 30 minutes
- [ ] Qualité graphique professionnelle
