# 4Builder

Iraq's construction services marketplace — a mobile app where clients browse contractors, craftsmen, and heavy machinery providers by region.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router file-based navigation
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API types)
- `lib/api-client-react/` — generated React Query hooks from the spec
- `lib/api-zod/` — generated Zod schemas from the spec
- `lib/db/src/schema/` — Drizzle ORM table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/mobile/app/` — Expo Router screens (file-based routing)
- `artifacts/mobile/components/` — shared UI components
- `artifacts/mobile/context/` — React contexts (Auth)
- `artifacts/mobile/constants/` — colors palette, Iraqi governorates list

## Architecture decisions

- **Contract-first API**: OpenAPI spec in `lib/api-spec/openapi.yaml` drives all codegen; never edit generated files
- **OTP auth**: JWT signed with `SESSION_SECRET`; OTPs stored in `otp_codes` DB table; Twilio used if env vars present, otherwise OTP logged to console (dev mode)
- **Color system**: Dark bg `#000000`, light bg `#F4F6F9`, Deep Navy `#1A2332` as primary in both modes; defined in `constants/colors.ts` and consumed via `useColors()` hook
- **Navigation**: Splash → Onboarding (first launch) → Auth (login/OTP/role) → Tabs (Home/Directory/Notifications/Profile)
- **Orval naming**: Component schema `SendOtpResponse` was renamed to `OtpSentResult` to avoid conflict with orval's auto-generated endpoint response Zod validator

## Product

- Clients browse contractors, craftsmen, and heavy machinery providers across 18 Iraqi governorates
- Iraqi phone number OTP authentication (+964 prefix)
- Provider directory with search, filter by type, sort by rating
- Provider detail pages with portfolio photos, specs, reviews, and direct call/WhatsApp
- Subscription tiers: Silver (25,000 IQD/mo) and Gold (50,000 IQD/mo) via FIB / ZainCash / FastPay

## User preferences

- Dark mode: #000000 bg, #1A2332 (Deep Navy) accent
- Light mode: #F4F6F9 bg, #1A2332 primary
- No emojis in UI
- Iraqi phone format: +964 prefix, 10 digits

## Gotchas

- Always run `pnpm run typecheck:libs` before `pnpm --filter @workspace/api-server run typecheck` — the DB lib must emit declarations first
- Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml`
- Twilio env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — if absent, OTP is logged at INFO level
- `useColors()` hook casts via `unknown` to handle `radius` not being a palette key

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
