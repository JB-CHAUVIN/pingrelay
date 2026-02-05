# Guide de Migration i18n - PingRelay

## Structure mise en place

✅ **Fichiers créés:**
- `i18n/config.ts` - Configuration des langues (fr, en, es, it, de)
- `i18n/get-dictionary.ts` - Fonction pour récupérer les traductions
- `i18n/dictionaries/[lang].json` - Fichiers de traduction pour chaque langue
- `middleware.ts` - Redirection automatique vers la langue appropriée
- `components/LanguageSwitcher.tsx` - Composant de sélection de langue
- `app/sitemap.ts` - Sitemap XML multilingue
- `app/robots.ts` - Robots.txt
- `app/llms.txt/route.ts` - Fichier pour les LLMs (SEO IA)

## Nouvelles routes

Les URL suivent maintenant ce format:
```
/fr/          → Page d'accueil en français
/en/          → Page d'accueil en anglais
/fr/dashboard → Dashboard en français
/en/dashboard → Dashboard en anglais
```

## Migration des pages existantes

### Étape 1: Restructurer app/

Actuellement: `app/page.tsx`, `app/dashboard/page.tsx`, etc.

Nouveau: Tout doit être dans `app/[lang]/`

```
app/
├── [lang]/
│   ├── page.tsx          (ex: app/page.tsx)
│   ├── layout.tsx        (nouveau layout avec lang param)
│   └── dashboard/
│       ├── page.tsx      (ex: app/dashboard/page.tsx)
│       ├── phones/
│       ├── templates/
│       └── schedules/
├── api/                  (reste inchangé)
├── sitemap.ts
├── robots.ts
└── llms.txt/
```

### Étape 2: Adapter le layout principal

**Fichier:** `app/[lang]/layout.tsx`

```typescript
import { Inter } from "next/font/google";
import { getDictionary } from "@/i18n/get-dictionary";
import { i18n, type Locale } from "@/i18n/config";
import ClientLayout from "@/components/LayoutClient";
import "@/app/globals.css";

const font = Inter({ subsets: ["latin"] });

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <html lang={lang} className={font.className}>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
```

### Étape 3: Adapter les pages

**Avant (Server Component):**
```typescript
export default async function Dashboard() {
  return <div>Dashboard</div>;
}
```

**Après (avec traductions):**
```typescript
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return (
    <div>
      <h1>{dict.dashboard.welcome}</h1>
      <p>{dict.dashboard.description}</p>
    </div>
  );
}
```

### Étape 4: Adapter les composants clients

**Créer un contexte pour les traductions côté client:**

```typescript
// i18n/dictionary-provider.tsx
"use client";

import { createContext, useContext } from "react";
import type { Dictionary } from "./get-dictionary";

const DictionaryContext = createContext<Dictionary | null>(null);

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <DictionaryContext.Provider value={dictionary}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const dict = useContext(DictionaryContext);
  if (!dict) throw new Error("useDictionary must be used within DictionaryProvider");
  return dict;
}
```

**Utilisation dans un composant client:**

```typescript
"use client";

import { useDictionary } from "@/i18n/dictionary-provider";

export default function MyComponent() {
  const dict = useDictionary();

  return <button>{dict.common.save}</button>;
}
```

### Étape 5: Adapter les métadonnées SEO

```typescript
import { getDictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Locale }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.seo.home.title,
    description: dict.seo.home.description,
    alternates: {
      languages: {
        fr: "https://pingrelay.live/fr",
        en: "https://pingrelay.live/en",
        es: "https://pingrelay.live/es",
        it: "https://pingrelay.live/it",
        de: "https://pingrelay.live/de",
      },
    },
  };
}
```

## Composants à adapter

### Header avec sélecteur de langue

```typescript
import LanguageSwitcher from "@/components/LanguageSwitcher";

<Header>
  <LanguageSwitcher currentLocale={lang} />
</Header>
```

### Liens internes

```typescript
import Link from "next/link";

// Avant
<Link href="/dashboard">Dashboard</Link>

// Après
<Link href={`/${lang}/dashboard`}>Dashboard</Link>

// Ou créer un helper
function useLocalizedHref(href: string) {
  const { lang } = useParams();
  return `/${lang}${href}`;
}
```

## Routes API (inchangées)

Les routes API restent hors de `[lang]/` et ne changent pas:
```
/api/phones
/api/templates
/api/schedules
```

## Mots-clés SEO optimisés

Les traductions incluent des mots-clés optimisés pour chaque marché:

- **FR**: automatisation WhatsApp, webinaire, rappels automatiques, engagement participants
- **EN**: WhatsApp automation, webinar, automated reminders, participant engagement
- **ES**: automatización WhatsApp, webinar, recordatorios automáticos, participación
- **IT**: automazione WhatsApp, webinar, promemoria automatici, coinvolgimento
- **DE**: WhatsApp Automatisierung, Webinar, automatische Erinnerungen, Teilnehmer-Engagement

## Fichiers SEO

✅ **Sitemap** (`/sitemap.xml`): Généré automatiquement pour toutes les langues
✅ **Robots** (`/robots.txt`): Configure le crawling
✅ **LLMs.txt** (`/llms.txt`): Indexation par les IA (Claude, ChatGPT, etc.)

## Prochaines étapes

1. Créer `app/[lang]/layout.tsx`
2. Déplacer `app/page.tsx` vers `app/[lang]/page.tsx`
3. Déplacer `app/dashboard/` vers `app/[lang]/dashboard/`
4. Adapter tous les composants pour utiliser les traductions
5. Tester chaque langue
6. Vérifier le sitemap: https://pingrelay.live/sitemap.xml

## Exemple complet - Dashboard traduit

Voir les fichiers pour référence:
- Traductions: `i18n/dictionaries/fr.json`
- Page dashboard déjà créée: utilise `dict.dashboard.*`
- Composants: utilisent `useDictionary()` pour accéder aux traductions

## Support

Les 5 langues sont maintenant disponibles avec des traductions professionnelles et SEO-optimisées!
