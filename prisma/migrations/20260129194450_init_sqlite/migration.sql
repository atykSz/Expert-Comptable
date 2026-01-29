-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "password" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CLIENT',
    "cabinetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cabinet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "siren" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cabinetId" TEXT NOT NULL,
    "raisonSociale" TEXT NOT NULL,
    "formeJuridique" TEXT NOT NULL DEFAULT 'SARL',
    "siren" TEXT,
    "siret" TEXT,
    "codeNAF" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "exerciceDebut" INTEGER NOT NULL DEFAULT 1,
    "exerciceFin" INTEGER NOT NULL DEFAULT 12,
    "regimeFiscal" TEXT NOT NULL DEFAULT 'IS',
    "regimeTVA" TEXT NOT NULL DEFAULT 'REEL_NORMAL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_cabinetId_fkey" FOREIGN KEY ("cabinetId") REFERENCES "Cabinet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Previsionnel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "dateDebut" DATETIME NOT NULL,
    "nombreMois" INTEGER NOT NULL DEFAULT 36,
    "regimeFiscal" TEXT NOT NULL DEFAULT 'IS',
    "formatDocument" TEXT NOT NULL DEFAULT 'PCG_STANDARD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Previsionnel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Hypotheses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "tauxTVAVentes" REAL NOT NULL DEFAULT 20.0,
    "tauxTVAAchats" REAL NOT NULL DEFAULT 20.0,
    "delaiPaiementClients" INTEGER NOT NULL DEFAULT 30,
    "delaiPaiementFournisseurs" INTEGER NOT NULL DEFAULT 30,
    "tauxChargesSocialesPatronales" REAL NOT NULL DEFAULT 45.0,
    "tauxChargesSocialesSalariales" REAL NOT NULL DEFAULT 22.0,
    "tauxIS" REAL NOT NULL DEFAULT 25.0,
    "tauxIR" REAL,
    "dureeStockJours" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Hypotheses_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LigneCA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "comptePCG" TEXT NOT NULL DEFAULT '701000',
    "montantsMensuels" JSONB NOT NULL,
    "evolutionAn2" REAL NOT NULL DEFAULT 0,
    "evolutionAn3" REAL NOT NULL DEFAULT 0,
    "tauxTVA" REAL NOT NULL DEFAULT 20.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LigneCA_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LigneCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "comptePCG" TEXT NOT NULL,
    "typeCharge" TEXT NOT NULL DEFAULT 'FIXE',
    "montantsMensuels" JSONB NOT NULL,
    "evolutionAn2" REAL NOT NULL DEFAULT 0,
    "evolutionAn3" REAL NOT NULL DEFAULT 0,
    "tauxTVA" REAL,
    "deductibleTVA" BOOLEAN NOT NULL DEFAULT true,
    "recurrence" TEXT NOT NULL DEFAULT 'MENSUEL',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LigneCharge_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Investissement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "comptePCG" TEXT NOT NULL,
    "montantHT" REAL NOT NULL,
    "tauxTVA" REAL NOT NULL DEFAULT 20.0,
    "dateAcquisition" DATETIME NOT NULL,
    "dureeAmortissement" INTEGER NOT NULL,
    "modeAmortissement" TEXT NOT NULL DEFAULT 'LINEAIRE',
    "valeurResiduelle" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Investissement_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Financement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "montant" REAL NOT NULL,
    "dateDebut" DATETIME NOT NULL,
    "duree" INTEGER,
    "tauxInteret" REAL,
    "differe" INTEGER,
    "echeancier" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Financement_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Effectif" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "salaireBrutMensuel" REAL NOT NULL,
    "primes" REAL NOT NULL DEFAULT 0,
    "dateEmbauche" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "tauxChargesPatronales" REAL NOT NULL DEFAULT 45.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Effectif_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComptePCG" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "classe" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Ligne2035" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "previsionnelId" TEXT NOT NULL,
    "rubrique" TEXT NOT NULL,
    "numeroLigne" INTEGER NOT NULL,
    "libelle" TEXT NOT NULL,
    "montantsMensuels" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ligne2035_previsionnelId_fkey" FOREIGN KEY ("previsionnelId") REFERENCES "Previsionnel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Cabinet_siren_key" ON "Cabinet"("siren");

-- CreateIndex
CREATE UNIQUE INDEX "Hypotheses_previsionnelId_key" ON "Hypotheses"("previsionnelId");

-- CreateIndex
CREATE UNIQUE INDEX "ComptePCG_numero_key" ON "ComptePCG"("numero");
