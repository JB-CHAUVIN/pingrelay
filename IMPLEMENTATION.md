# Implémentation du système d'envoi automatique de messages WhatsApp

## 📋 Vue d'ensemble

Ce document décrit l'implémentation complète du système d'envoi automatique de messages WhatsApp pour PingRelay, basé sur l'ancien système legacy mais avec une architecture scalable pour supporter plusieurs clients.

## 🏗️ Architecture

### 1. Nouveau modèle de base de données

**`SentMessage`** (`web/models/SentMessage.ts`)
- Tracking de chaque message envoyé pour chaque programmation
- Champs :
  - `scheduleId` : Référence à la programmation
  - `messageIndex` : Index du message dans le template
  - `phoneId` : Téléphone utilisé pour l'envoi
  - `groupId` : ID du groupe WhatsApp
  - `status` : "pending" | "sent" | "failed"
  - `sentAt` : Date d'envoi
  - `wahaResponse` : Réponse complète de l'API WAHA (pour debug)
  - `error` : Message d'erreur en cas d'échec

### 2. Extensions de la librairie WAHA

**Fichier**: `web/libs/waha.ts`

**Nouvelles fonctions anti-blocking** :
- `getRandomDelay(min, max)` : Génère des délais aléatoires
- `getTypingDelayBasedOnMessageLength(message)` : Calcule un délai de frappe réaliste
- `sleep(milliseconds)` : Fonction utilitaire de pause

**Fonctions de messaging** :
- `sendSeen(phone, chatId)` : Envoie le statut "vu"
- `startTyping(phone, chatId)` : Démarre l'indicateur de frappe
- `stopTyping(phone, chatId)` : Arrête l'indicateur de frappe
- `sendTextMessage(phone, chatId, message)` : Envoie un message texte avec mesures anti-blocking
- `sendImage(phone, chatId, imageUrl)` : Envoie une image avec mesures anti-blocking
- `sendVideo(phone, chatId, videoUrl)` : Envoie une vidéo avec mesures anti-blocking
- `getChats(phone)` : Récupère la liste des conversations

**Séquence anti-blocking** :
1. Envoyer "vu" → attendre 1-2s
2. Démarrer frappe → attendre délai basé sur longueur message
3. Arrêter frappe → attendre 0.5-1.5s
4. Envoyer message
5. Délai entre groupes de messages : 5-20s

### 3. Route CRON : `/api/send-messages`

**Fichier**: `web/app/api/send-messages/route.ts`

**Sécurité** : Authentification via `Bearer ${CRON_SECRET}`

**Algorithme** :
1. Récupère tous les schedules avec status "pending" ou "running"
2. Pour chaque schedule :
   - Récupère le template associé
   - Pour chaque message du template :
     - Calcule la date d'exécution : `eventDate + sendOnDay + sendOnHour`
     - Si date <= maintenant ET message pas encore envoyé :
       - Trouve le groupe WhatsApp par son nom
       - Remplace les variables dans le message
       - Crée un record `SentMessage` avec status "pending"
       - Envoie le message (texte + image + vidéo si présents)
       - Met à jour `SentMessage` avec le résultat
       - Applique un délai anti-blocking (5-20s)
3. Met à jour le statut du schedule :
   - Premier message envoyé : "pending" → "running"
   - Tous les messages envoyés : "running" → "completed"

**Gestion des erreurs** :
- Logs détaillés à chaque étape
- Capture des erreurs WAHA dans le champ `error`
- Status "failed" si échec d'envoi

### 4. API de consultation

**Route**: `GET /api/schedules/[id]/sent-messages`

**Fichier**: `web/app/api/schedules/[id]/sent-messages/route.ts`

**Réponse** :
```json
{
  "schedule": {
    "_id": "...",
    "groupName": "Nom du groupe",
    "eventDate": "2025-01-15T10:00:00Z",
    "status": "running",
    "variables": [...]
  },
  "messages": [
    {
      "messageIndex": 0,
      "sendOnDay": "-7",
      "sendOnHour": "09:00",
      "messageTemplate": "Contenu du message",
      "phone": "+33612345678",
      "status": "sent",
      "sentAt": "2025-01-08T09:00:15Z",
      "wahaResponse": {...},
      "error": null,
      "groupId": "120363414805387645@g.us"
    }
  ],
  "stats": {
    "total": 10,
    "sent": 5,
    "failed": 0,
    "pending": 1,
    "not_sent": 4
  }
}
```

### 5. Interface utilisateur

#### Page de détails : `/dashboard/schedules/[id]`

**Fichier**: `web/app/dashboard/schedules/[id]/page.tsx`

**Fonctionnalités** :
- Affichage des informations de la programmation
- Statistiques d'envoi (total, envoyés, échoués, en cours, à venir)
- Liste détaillée de tous les messages programmés
- Mode auto-refresh (toutes les 30s)
- Mode debug pour voir les réponses WAHA

**Composants créés** :

1. **`SentMessagesStats.tsx`**
   - Affichage des 5 statistiques clés
   - Design avec badges colorés selon le statut
   - Pourcentage de progression

2. **`SentMessagesList.tsx`**
   - Liste des messages avec accordéon
   - Statut visuel pour chaque message
   - Affichage de la date d'exécution vs date d'envoi réelle
   - Mode debug avec réponse WAHA complète
   - Indicateurs pour les pièces jointes (images, vidéos)
   - Détection des messages en retard

3. **`ScheduleList.tsx`** (modifié)
   - Ajout du bouton "Voir détails" (icône œil)
   - Navigation vers la page de détails

4. **`ScheduleStatusBadge.tsx`** (modifié)
   - Labels traduits en français :
     - "Non démarré" (pending)
     - "En cours" (running)
     - "Terminé" (completed)
     - "Échoué" (failed)

## 🚀 Installation

### 1. Installer les dépendances

```bash
cd web
npm install moment
npm install --save-dev @types/moment
```

### 2. Variables d'environnement

Assurez-vous que ces variables sont configurées dans `.env` :

```env
# MongoDB
MONGODB_URI=mongodb://...

# WAHA
WAHA_BASE_URL=https://your-waha-instance.com
WAHA_API_KEY=your-api-key

# CRON
CRON_SECRET=your-secret-token-for-cron
```

### 3. Configuration du CRON

Configurez un CRON job pour appeler l'endpoint toutes les minutes :

```bash
* * * * * curl -X POST https://your-domain.com/api/send-messages \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

Ou utilisez un service comme :
- **Vercel Cron** (recommandé pour Next.js sur Vercel)
- **cron-job.org**
- **EasyCron**
- **GitHub Actions** avec schedule

### Exemple Vercel Cron (vercel.json) :

```json
{
  "crons": [
    {
      "path": "/api/send-messages",
      "schedule": "* * * * *"
    }
  ]
}
```

## 📖 Utilisation

### 1. Créer une programmation

1. Aller sur `/dashboard/schedules`
2. Cliquer sur "Créer une programmation"
3. Remplir :
   - Nom du groupe WhatsApp (doit correspondre exactement au nom sur WhatsApp)
   - Sélectionner un modèle de messages
   - Date de l'événement
   - Variables (optionnel)

### 2. Suivre l'envoi des messages

1. Cliquer sur l'icône "œil" dans la liste des programmations
2. Consulter les statistiques en temps réel
3. Voir la liste détaillée des messages
4. Activer le mode debug pour voir les logs WAHA

### 3. Statuts des programmations

- **Non démarré** (pending) : Aucun message envoyé
- **En cours** (running) : Au moins un message envoyé, d'autres à venir
- **Terminé** (completed) : Tous les messages ont été envoyés
- **Échoué** (failed) : Erreur critique

### 4. Statuts des messages

- **À venir** : Pas encore l'heure d'envoi
- **En cours** : En train d'être envoyé
- **Envoyé** : Envoi réussi
- **Échoué** : Erreur d'envoi (voir détails dans le message d'erreur)

## 🔧 Débogage

### Mode debug

Activer le mode debug dans la page de détails pour voir :
- Réponse complète de l'API WAHA
- Group ID WhatsApp
- Message ID dans la base de données

### Logs CRON

Les logs du CRON sont préfixés par `[CRON]` :
- `[CRON] Starting message sending process`
- `[CRON] Found X active schedules`
- `[CRON] Processing schedule X - Group Name`
- `[CRON] Message X/Y - Execution: ... - Now: ...`
- `[CRON] Sending message X to group Y`
- `[CRON] Successfully sent message X`

### Vérifications en cas de problème

1. **Les messages ne s'envoient pas** :
   - Vérifier que le CRON fonctionne
   - Vérifier que le téléphone est connecté (status "connected")
   - Vérifier que le nom du groupe correspond exactement
   - Consulter les logs de la route `/api/send-messages`

2. **Statut "En retard"** :
   - Le message aurait dû être envoyé mais ne l'a pas été
   - Vérifier les logs pour voir la raison
   - Peut être dû à un téléphone déconnecté ou un groupe introuvable

3. **Erreurs d'envoi** :
   - Consulter le champ `error` dans le détail du message
   - Vérifier la réponse WAHA en mode debug

## 🎯 Différences avec le système legacy

| Aspect | Legacy | Nouveau |
|--------|--------|---------|
| Stockage état | Fichier JSON local | Table MongoDB `SentMessage` |
| Multi-clients | Non (1 seul client) | Oui (isolation par user) |
| Interface | Aucune | Interface complète avec stats |
| Debug | Logs console uniquement | Mode debug + logs structurés |
| Variables | Google Sheets | Variables dans la BDD |
| Gestion erreurs | Basique | Détaillée avec retry potential |

## 🔐 Sécurité

- Route CRON protégée par `Bearer token`
- Vérification des permissions utilisateur sur toutes les routes
- Isolation des données par utilisateur
- Pas d'exposition des clés API WAHA côté client

## 📊 Performance

- **Débit** : ~5-10 messages/minute (avec anti-blocking)
- **Délais** :
  - Entre messages : 5-20 secondes aléatoires
  - Frappe simulée : Basée sur longueur du message
  - Images : 2-4s avant + 3-6s frappe + 1-2s après
  - Vidéos : 3-6s avant + 5-10s frappe + 1-3s après

## 🚧 Améliorations futures possibles

1. **Retry automatique** : Réessayer les messages échoués
2. **Webhooks WAHA** : Recevoir des notifications en temps réel
3. **Templates de variables** : Prévisualisation avant envoi
4. **Statistiques globales** : Dashboard avec toutes les programmations
5. **Notifications** : Alertes email quand une programmation est terminée
6. **Rate limiting** : Limiter le nombre de messages par heure
7. **Planification intelligente** : Éviter les heures de pointe WhatsApp

## 📝 Notes importantes

- Toujours tester avec un groupe de test avant la production
- Le nom du groupe WhatsApp doit correspondre **exactement** (sensible à la casse)
- Les téléphones doivent rester connectés pour envoyer des messages
- WhatsApp peut bloquer en cas d'envoi trop massif malgré les mesures anti-blocking
- Les délais anti-blocking augmentent significativement le temps total d'envoi
