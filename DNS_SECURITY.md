# Guide de Sécurisation DNS et E-mail

Ce document détaille les enregistrements DNS à configurer chez votre **registrar** (OVH, GoDaddy, Gandi, Namecheap, Cloudflare, etc.) pour corriger les vulnérabilités identifiées dans l'audit de sécurité.

> ⚠️ **Important :** La propagation DNS peut prendre de 1h à 48h.

## 1. Serveurs de Noms (Nameservers)
**Problème :** Aucun nameserver configuré ou visible.
**Action :** Vérifiez dans l'interface de gestion de votre domaine que vous avez bien au moins **2 serveurs DNS** configurés (ex: `ns1.votre-hebergeur.com`, `ns2.votre-hebergeur.com`).
Si vous utilisez Cloudflare, Vercel ou AWS, utilisez les nameservers qu'ils vous fournissent.

## 2. DNSSEC (Domain Name System Security Extensions)
**Problème :** Désactivé. Risque d'empoisonnement du cache DNS.
**Action :**
1. Connectez-vous à votre registrar.
2. Cherchez l'option **"Activer DNSSEC"** (souvent un simple bouton ou une case à cocher).
3. Si vous gérez votre propre serveur DNS, vous devez générer les clés et publier l'enregistrement `DS`.

## 3. SPF (Sender Policy Framework)
**Problème :** Manquant. Permet l'usurpation d'identité (spoofing).
**Action :** Ajoutez un enregistrement **TXT** à la racine (`@`).

**Valeur recommandée (si vous utilisez Google Workspace) :**
```text
v=spf1 include:_spf.google.com ~all
```

**Valeur recommandée (si vous utilisez Microsoft 365) :**
```text
v=spf1 include:spf.protection.outlook.com ~all
```

**Valeur restrictive (aucune émission d'e-mail prévue) :**
```text
v=spf1 -all
```

> **Note :** Si vous utilisez un outil d'envoi d'e-mails transactionnels (SendGrid, Mailgun, Resend), ajoutez leur `include:` spécifique. Ex: `v=spf1 include:sendgrid.net ~all`.

## 4. DMARC (Domain-based Message Authentication, Reporting, and Conformance)
**Problème :** Manquant. Pas de politique de rejet des e-mails frauduleux.
**Action :** Ajoutez un enregistrement **TXT** avec le nom `_dmarc`.

**Valeur recommandée (Mode Surveillance - étape 1) :**
```text
v=DMARC1; p=none; rua=mailto:admin@votre-domaine.com
```

**Valeur recommandée (Mode Strict - étape 2, après validation) :**
```text
v=DMARC1; p=quarantine; rua=mailto:admin@votre-domaine.com; ruf=mailto:admin@votre-domaine.com
```
*Remplacez `admin@votre-domaine.com` par votre adresse e-mail réelle.*

## 5. CAA (Certification Authority Authorization)
**Problème :** Manquant. N'importe qui peut émettre un certificat SSL pour votre domaine.
**Action :** Ajoutez des enregistrements **CAA** pour autoriser uniquement Let's Encrypt (ou votre autorité de certification).

**Pour Let's Encrypt (utilisé par défaut par Vercel, Netlify, etc.) :**
| Type | Nom | Valeur |
|------|-----|--------|
| CAA  | @   | `0 issue "letsencrypt.org"` |
| CAA  | @   | `0 issuewild "letsencrypt.org"` |

## Résumé des enregistrements à ajouter

| Type | Nom (Host) | Valeur (Exemple) |
|------|------------|------------------|
| **TXT** | `@` | `v=spf1 include:_spf.google.com ~all` |
| **TXT** | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@example.com` |
| **CAA** | `@` | `0 issue "letsencrypt.org"` |
