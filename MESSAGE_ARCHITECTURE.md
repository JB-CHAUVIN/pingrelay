# Architecture des Messages avec Relations et Snapshots

## 🎯 Objectif

Avoir une architecture avec :
1. **Relations propres** : ID vers le message (foreign key)
2. **Snapshots immuables** : Copie du contenu au moment de l'envoi
3. **Backward compatibility** : Support des anciens templates avec messages embeddés

## 📊 Modèles de données

### 1. Modèle `Message` (nouveau)

```typescript
{
  _id: ObjectId
  templateId: ObjectId → Template
  phoneId: ObjectId → Phone
  sendOnDay: string         // -30 to +30, or 0
  sendOnHour: string        // HH:mm
  messageTemplate: string   // Message content
  image?: string            // Image URL
  video?: string            // Video URL
  order: number             // Order in sequence
  createdAt: Date
  updatedAt: Date
}
```

**Avantages** :
- ✅ Chaque message est un document indépendant
- ✅ Peut être référencé par ID
- ✅ Peut être modifié sans affecter les envois passés
- ✅ Peut être réutilisé dans plusieurs templates (futur)

### 2. Modèle `Template` (existant - conservé)

```typescript
{
  _id: ObjectId
  titre: string
  user: ObjectId → User
  messages: [                 // Embedded documents (legacy)
    {
      phoneId: ObjectId
      sendOnDay: string
      sendOnHour: string
      messageTemplate: string
      image?: string
      video?: string
    }
  ]
  createdAt: Date
  updatedAt: Date
}
```

**Note** : On garde l'array `messages` pour la compatibilité. Les nouveaux templates créent automatiquement des documents `Message` séparés.

### 3. Modèle `SentMessage` (amélioré)

```typescript
{
  _id: ObjectId
  scheduleId: ObjectId → Schedule
  messageId: ObjectId → Message        // ⭐ Nouvelle relation
  messageIndex: number                  // Ordre dans la séquence
  phoneId: ObjectId → Phone
  groupId: string                       // WhatsApp group ID

  messageSnapshot: {                    // ⭐ Snapshot immuable
    sendOnDay: string
    sendOnHour: string
    messageTemplate: string
    image?: string
    video?: string
  }

  status: "pending" | "sent" | "failed"
  sentAt: Date
  wahaResponse: any                     // Debug logs
  error?: string
  createdAt: Date
  updatedAt: Date
}
```

**Double tracking** :
1. `messageId` → Référence vers le message source (relation)
2. `messageSnapshot` → Copie du contenu au moment de l'envoi (audit)

## 🔄 Synchronisation automatique

### Création/Modification de Template

Quand un template est créé ou modifié :

```
1. Template.create() ou Template.save()
   ↓
2. syncTemplateMessages(templateId, messages)
   ↓
3. Supprime les anciens Message documents
   ↓
4. Crée de nouveaux Message documents
```

**Code** : `libs/template-message-sync.ts`

### Suppression de Template

Quand un template est supprimé :

```
1. Template.findOneAndDelete()
   ↓
2. deleteTemplateMessages(templateId)
   ↓
3. Supprime tous les Message documents associés
```

## 🚀 Flux d'envoi des messages (CRON)

### Étape 1 : Récupération des messages

```typescript
// Essaie d'abord de récupérer les Message documents
const separateMessages = await Message.find({ templateId })
  .sort({ order: 1 })
  .lean();

// Fallback sur les messages embeddés si pas de Message documents
const messages = separateMessages.length > 0
  ? separateMessages
  : template.messages.map((msg, index) => ({
      ...msg,
      _id: null,
      order: index,
    }));
```

### Étape 2 : Création de SentMessage

```typescript
await SentMessage.create({
  scheduleId: schedule._id,
  messageId: message._id || null,    // null pour les messages embeddés
  messageIndex,
  phoneId: phone._id,
  groupId,
  messageSnapshot: {                  // Snapshot immuable
    sendOnDay: message.sendOnDay,
    sendOnHour: message.sendOnHour,
    messageTemplate: message.messageTemplate,
    image: message.image,
    video: message.video,
  },
  status: "pending",
});
```

### Étape 3 : Envoi et mise à jour

```typescript
// Envoi via WAHA
const response = await sendTextMessage(...);

// Mise à jour du statut
await SentMessage.findByIdAndUpdate(sentMessage._id, {
  status: "sent",
  sentAt: new Date(),
  wahaResponse: response,
});
```

## 🔍 Avantages de cette architecture

### 1. **Traçabilité complète**

```
Question : "Quel contenu a été envoyé ?"
Réponse : messageSnapshot (immuable, jamais modifié)

Question : "Quel est le message source ?"
Réponse : messageId → Message document
```

### 2. **Détection des modifications**

L'API peut comparer :
- `messageSnapshot` (ce qui a été envoyé)
- `Message` actuel (ce qui est maintenant)

Si différent → `templateModified: true`

### 3. **Audit et conformité**

- Historique complet de chaque envoi
- Contenu exact envoyé (pour raisons légales)
- Même si le template/message est modifié ou supprimé

### 4. **Flexibilité**

- Modifier un message n'affecte pas les envois passés
- Réutiliser des messages entre templates (futur)
- Analyse des performances par message

## 📈 Migration des données existantes

### Route de synchronisation manuelle

```
GET /api/templates/sync-messages
```

Synchronise tous les templates de l'utilisateur :
- Crée des Message documents à partir des messages embeddés
- Ignore les templates déjà synchronisés
- Retourne le nombre de messages créés

### Synchronisation d'un template spécifique

```
POST /api/templates/sync-messages
Body: { templateId: "..." }
```

Force la synchronisation d'un template :
- Supprime les anciens Message documents
- Recrée à partir des messages embeddés actuels

## 🎨 Interface utilisateur

### Badge "Template modifié"

Si `messageSnapshot` ≠ `Message` actuel :
```jsx
<span className="badge badge-info badge-sm">
  Template modifié
</span>
```

Indique que le contenu du template a changé depuis l'envoi.

## 🔮 Évolutions futures possibles

### 1. Bibliothèque de messages réutilisables

```typescript
Message {
  _id: ObjectId
  user: ObjectId          // Propriétaire du message
  name: string            // Nom du message
  // ... autres champs
  templates: [ObjectId]   // Templates qui utilisent ce message
}
```

### 2. A/B Testing

```typescript
Message {
  variants: [
    { content: "Version A", weight: 50 },
    { content: "Version B", weight: 50 },
  ]
}

SentMessage {
  variantUsed: "A" | "B"
  messageSnapshot: { /* content de la variante */ }
}
```

### 3. Analytics par message

```sql
SELECT
  m._id,
  m.messageTemplate,
  COUNT(sm._id) as sent_count,
  AVG(CASE WHEN sm.status = 'sent' THEN 1 ELSE 0 END) as success_rate
FROM Message m
LEFT JOIN SentMessage sm ON sm.messageId = m._id
GROUP BY m._id
```

## 📝 Checklist de migration

Pour passer d'un ancien système à cette architecture :

- [x] Créer le modèle `Message`
- [x] Ajouter `messageId` dans `SentMessage`
- [x] Ajouter `messageSnapshot` dans `SentMessage`
- [x] Créer `template-message-sync.ts`
- [x] Ajouter sync automatique dans POST /api/templates
- [x] Ajouter sync automatique dans PUT /api/templates/[id]
- [x] Ajouter delete automatique dans DELETE /api/templates/[id]
- [x] Modifier CRON pour utiliser Message documents
- [x] Créer route `/api/templates/sync-messages`
- [x] Ajouter badge "Template modifié" dans l'UI
- [ ] Exécuter sync pour les templates existants
- [ ] Tester l'envoi avec Message documents
- [ ] Tester l'envoi avec messages embeddés (fallback)

## 🏁 Conclusion

Cette architecture offre le meilleur des deux mondes :

1. **Relations propres** via `messageId` pour la structure
2. **Snapshots immuables** via `messageSnapshot` pour l'audit
3. **Compatibilité** avec l'ancien système embeddé

Le système peut fonctionner avec :
- Nouveaux templates → Message documents
- Anciens templates → Messages embeddés
- Mode hybride pendant la migration
