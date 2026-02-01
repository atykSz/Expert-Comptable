# Guide de Sécurisation DNS et E-mail (Vercel & Render)

Ce guide est adapté à votre infrastructure hébergée sur **Vercel** (Frontend) et **Render** (Backend/Autre).

## 1. Serveurs de Noms (Nameservers) - LE PLUS IMPORTANT
Puisque vous utilisez **Vercel** pour le frontend, il est **fortement recommandé** d'utiliser les serveurs DNS de Vercel pour gérer votre domaine. Cela active automatiquement HTTPS et simplifie la configuration.

**Action :** Allez chez votre registraire (là où vous avez acheté le domaine) et changez les nameservers par :
*   `ns1.vercel-dns.com`
*   `ns2.vercel-dns.com`

> **Si Vercel gère votre DNS :**
> - **CAA** est géré automatiquement (Vercel autorise Let's Encrypt).
> - **DNSSEC** peut être activé dans le tableau de bord Vercel (Domains > Settings).
> - **Render** devra être pointé via des enregistrements `A` ou `CNAME` dans l'interface Vercel.

---

## 2. Configuration E-mail (SPF & DMARC)
Rappel : Vercel et Render **n'envoient pas d'e-mails** pour vous (sauf si vous utilisez Vercel Email qui est limité). Vous utilisez probablement Google Workspace, Outlook, ou un service comme **Resend** ou **SendGrid**.

**Action :** Ajoutez ces enregistrements dans l'interface DNS de Vercel (ou de votre registraire si vous ne migrez pas les nameservers).

### A. SPF (Qui a le droit d'envoyer ?)
Ajoutez un enregistrement **TXT** pour `@` :
*   **Si vous utilisez Google Workspace :** `v=spf1 include:_spf.google.com ~all`
*   **Si vous utilisez Resend (recommandé avec Vercel) :** `v=spf1 include:resend.com ~all`
*   **Si vous utilisez les deux :** `v=spf1 include:_spf.google.com include:resend.com ~all`

### B. DMARC (Politique de sécurité)
Ajoutez un enregistrement **TXT** pour `_dmarc` :
*   `v=DMARC1; p=none; rua=mailto:admin@votre-domaine.com` (Mode test)

---

## 3. Lier Render (Backend)
Si votre backend est sur Render, vous devez le lier à un sous-domaine (ex: `api.votre-domaine.com`).

**Action dans Vercel DNS (ou votre registraire) :**
1.  Créez un enregistrement **CNAME**.
2.  **Nom :** `api` (ou `backend`)
3.  **Valeur :** `votre-service-name.onrender.com` (fourni pa Render).

---

## Résumé Checklist

| Enregistrement | Type | Hôte (Name) | Valeur / Cible | Note |
|---|---|---|---|---|
| **Nameservers** | NS | `@` | `ns1.vercel-dns.com` (et ns2) | À faire chez le registraire |
| **Frontend** | A | `@` | `76.76.21.21` (IP Vercel) | Automatique si NS Vercel |
| **Backend** | CNAME | `api` | `xxx.onrender.com` | Pour pointer vers Render |
| **SPF** | TXT | `@` | `v=spf1 include:... ~all` | Anti-Spoofing E-mail |
| **DMARC** | TXT | `_dmarc` | `v=DMARC1; p=none...` | Politique E-mail |
| **DNSSEC** | Option | - | **ACTIVER** | Dans Vercel (Settings) ou Registraire |

> **Note sur CAA :** Si vous utilisez les NS Vercel, l'enregistrement CAA est ajouté automatiquement pour Let's Encrypt. Si vous gérez le DNS ailleurs, vous devez l'ajouter manuellement (voir section précédente).
