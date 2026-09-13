# Portail d'accréditation FSF — Frontend

Application Next.js 16 (App Router) du portail d'accréditation médias de la Fédération
Sénégalaise de Football. Consomme l'API NestJS du dossier voisin `fsf-acreditation-backend`.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript strict
- **Tailwind CSS v4** + **shadcn/ui** (style `radix-nova`)
- **Framer Motion** pour les interactions 3D/animations (badge holographique, sélecteur de
  zones du stade, transitions de pages)
- **TanStack Query** pour les données authentifiées côté client
- **react-hook-form** + **zod** pour les formulaires
- **canvas-confetti**, **sonner** (toasts), **lucide-react** (icônes)

## Authentification

Les jetons NestJS (`accessToken` / `refreshToken`) ne sont **jamais exposés au navigateur**.
Ils sont posés en cookies `httpOnly` par les Route Handlers sous `src/app/api/auth/*`, qui
relaient vers l'API NestJS. Toute requête authentifiée côté client passe par le proxy générique
`src/app/api/proxy/[...path]/route.ts`, qui ajoute l'en-tête `Authorization` et tente une
rotation du refresh token en cas de 401. Les lectures publiques passent par
`src/app/api/public/[...path]/route.ts` (sans jeton).

`src/proxy.ts` (convention Next 16, ex-`middleware.ts`) protège les routes `/dashboard`,
`/apply`, `/media-desk` (rôle `REQUESTER`), `/admin` (rôles staff hors contrôle) et `/scanner`
(rôle `AGENT_CONTROLE`/`ADMIN`) en décodant le payload du JWT côté edge (vérification UX
seulement — l'autorisation réelle reste appliquée par le backend).

## Arborescence des routes

```
/                          Portail public (matchs ouverts, quotas)
/track                     Suivi de dossier (référence + email)
/login  /register          Authentification
/apply/[matchId]           Assistant de demande en 4 étapes (stade 3D)
/dashboard                 Espace journaliste (mes demandes, badge holographique)
/media-desk                Espace Rédacteur en Chef (délégation presse)
/admin                     Back-office Commission FSF (tableau de bord, modération,
                           médias/diffuseurs, impression A6, notifications, sécurité
                           cryptographique, audit)
/scanner                   Poste de contrôle (scan caméra + saisie manuelle)
```

## Variables d'environnement

| Variable       | Description                              | Défaut                          |
| -------------- | ----------------------------------------- | -------------------------------- |
| `BACKEND_URL`  | URL de base de l'API NestJS (côté serveur) | `http://localhost:3000/api/v1`  |

## Développement

```bash
npm install
BACKEND_URL=http://localhost:3000/api/v1 npm run dev -- -p 3001
```

Le backend (`fsf-acreditation-backend`) doit tourner en parallèle sur le port 3000.

## Build

```bash
npm run build   # build de production (Turbopack)
npm run lint    # ESLint
```
