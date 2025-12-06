# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This is a **Monster Collection Game** called "또몬 배틀 게임" (Ttomon Battle
Game) built with **Next.js 14**, **React 18**, **TypeScript**, and **TailwindCSS
v3**. The project focuses on **Monster Collection (Gacha)** and
**Authentication**.

## Core Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Package management
npm install          # Install dependencies
```

## Frontend Development Guidelines

**Core Principle**: "Is this code easy to change?"

### 1. Architecture & Patterns

- **API Instance**: Use `lib/api/instance.ts` (`publicApi`, `authenticatedApi`).
- **Server State**: Use **React Query** (`@tanstack/react-query`) for all server
  data.
  - Use `queryOptions` in `lib/api/query-options.ts`.
  - Use `QUERY_KEYS` constants.
- **State Management**:
  - **Server**: React Query
  - **Form**: React Hook Form
  - **URL**: URL Search Params (for shareable state)
  - **Global**: Zustand (only when absolutely necessary)

### 2. Coding Rules

- **No Over-Abstraction**: Do not create wrapper hooks that just return another
  hook.
- **Side Effects**: Keep side effects (routing, toasts) in components/event
  handlers, not in hooks.
- **Error Handling**: Use `ErrorBoundary` for render errors,
  `try-catch`/`onError` for event handlers.

For more details, see [FRONTEND_GUIDE.md](file:///docs/FRONTEND_GUIDE.md).

## Architecture Overview

### State Management

- **Global Store** (`hooks/use-game-store.ts`): Manages collection and gacha
  state.
- **Server State**: Managed by React Query.

### Core Systems

- **Monster System** (`lib/monsters.ts`): Definitions of monsters and rarity.
- **Gacha System** (`lib/api/gacha.ts`): Logic for drawing monsters.

### Supabase Client Usage

**IMPORTANT**: Always use existing Supabase clients from `/lib/supabase/`.

```typescript
// Browser (Client Components)
import { createBrowserSupabase } from "@/lib/supabase/browser";
const supabase = createBrowserSupabase();

// Server (Server Components/Actions)
import { createServerSupabase } from "@/lib/supabase/server";
const supabase = await createServerSupabase();

// Admin (Server-side only, bypass RLS)
import { createAdminSupabase } from "@/lib/supabase/admin";
const supabase = createAdminSupabase();
```

## File Organization

- **`/app`**: Next.js App Router
- **`/components`**: UI components
- **`/hooks`**: Custom hooks
- **`/lib`**: Core logic, API, types
- **`/docs`**: Documentation
