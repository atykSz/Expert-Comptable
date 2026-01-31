# Expert-Comptable

Application SaaS de prévisionnel financier pour les professions libérales en France.

## 🚀 Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 16.1 | Framework React avec App Router |
| React | 19 | UI Framework |
| TypeScript | 5 | Typage statique |
| Prisma | 6 | ORM base de données |
| Supabase | - | Auth + PostgreSQL |
| Tailwind CSS | 4 | Styling |
| Sentry | - | Monitoring erreurs |
| Zod | 4 | Validation de données |

## 📦 Installation

```bash
# Cloner le repo
git clone <repo-url>
cd expert-comptable

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Renseigner DATABASE_URL, SUPABASE_URL, etc.

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Lancer le serveur de développement
npm run dev
```

## 🔧 Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm test` | Exécuter les tests |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec couverture |
| `npm run lint` | Linter ESLint |

## 📁 Structure

```
src/
├── app/                    # App Router (pages + API routes)
│   ├── api/               # Routes API
│   ├── dashboard/         # Tableau de bord
│   ├── previsionnel/      # Gestion prévisionnels
│   └── ...
├── components/            # Composants React
│   ├── ui/               # Composants UI réutilisables
│   ├── dashboard/        # Composants dashboard
│   ├── forms/            # Formulaires 2035
│   └── rapport/          # Génération PDF
├── lib/                   # Utilitaires
│   ├── calculations/     # Calculs financiers
│   ├── validations/      # Schémas Zod
│   └── prisma.ts         # Client Prisma
└── generated/            # Types Prisma générés
```

## 🎨 Composants UI

La librairie de composants inclut :

- **Button, Input, Select, Modal, Card** - Éléments de base
- **Table** - Tableaux avec variants (striped, bordered)
- **Alert** - Messages système (info, success, warning, error)
- **Tabs** - Navigation par onglets
- **Dropdown** - Menus déroulants
- **Skeleton** - Placeholders de chargement
- **Toast** - Notifications

```tsx
import { Button, Alert, Tabs, Table } from '@/components/ui'
```

## 🧪 Tests

Tests unitaires avec Jest sur les calculs financiers critiques :

```bash
npm test
# ✓ 15 tests passent
```

## 📊 Fonctionnalités

- 📈 **Prévisionnel financier** sur 3 ans
- 📋 **Déclaration 2035** (BNC)
- 💰 **Compte de résultat** et bilan
- 📊 **Graphiques** (Recharts)
- 📄 **Export PDF** et Excel
- 🔐 **Authentification** Supabase
- 🚨 **Monitoring** Sentry

## 🔒 Sécurité

- Authentification Supabase avec JWT
- Validation Zod sur toutes les API
- Headers de sécurité (CSP, HSTS)
- Rate limiting

## 📝 Variables d'Environnement

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

## 🚀 Déploiement

L'application est configurée pour un déploiement sur Render (voir `render.yaml`).

```bash
npm run build
npm start
```

## 📄 Licence

Projet privé - Tous droits réservés.
