# Implementation Decisions Log

Running record of judgement calls made while building each stage of
`BACKEND_PLAN.md`. Entries are decisions taken during implementation that the
plan did not specify, or where the implementation deliberately reads the plan
narrowly. Nothing here overrides the plan — it records *how* the plan was
interpreted.

---

## Stage 2 — Contact module + NotificationsModule (Resend)

### 1. Rate limit is scoped to the POST handler, not the controller

`ThrottlerGuard` was first applied at `@Controller('contact')` level. That is
wrong: Nest builds the throttler key from controller + handler + IP, so a
class-level guard would have counted admin inbox traffic against the anonymous
form's quota of 3 per 15 minutes, and refreshing `/admin/contact` a few times
would have locked the public form out. The guard is now on `create()` only, which
also matches the plan's route table, where only `POST /contact` is marked
rate-limited.

Covered by `contact-throttler.spec.ts`, including an explicit per-handler
isolation test.

### 2. Limits come from the environment, validated, with safe fallbacks

`CONTACT_RATE_LIMIT` and `CONTACT_RATE_WINDOW` override the 3-per-15-minutes
default. Unparseable or nonsensical values fall back to the default rather than
being coerced:

- `Number()` not `parseInt()`, because `parseInt('2.5')` silently yields `2` — a
  typo would become a limit nobody chose.
- A limit below 1 is rejected, since it would block every visitor.
- The window uses the existing `common/ttl.ts` helper, so it accepts the same
  shorthand as the JWT lifetimes (`30s`, `15m`, `1h`, `7d`).

### 3. Honeypot returns `null` rather than throwing, and the public response is identical either way

A filled `website` field means the service returns `null` and writes nothing.
Signalling it with an exception would be an easy way to leak the difference
through a log or a monitoring hook. The success body deliberately carries no
submission id: a real id in the response would let a bot distinguish a real
submission from a dropped one.

### 4. Public `POST /contact` awaits the DB write; only the email is fire-and-forget

The plan says the response is returned "as soon as the DB write succeeds". The
database write is therefore awaited, so a failed insert surfaces as a real error
instead of a false confirmation to a visitor. Only `NotificationsService` is
detached.

### 5. Fire-and-forget needs both a `try/catch` and a `.catch`

A unit test drove this out. `.catch()` alone does not cover a *synchronous*
throw: the exception escapes before the handler can be attached, and it would
propagate out of `create()` and fail an already-saved submission's request.
`ContactService.notifyAsync` wraps the call in `try/catch` **and** attaches
`.catch`, so neither failure mode can reach the HTTP response. Verified by
`sync throw`, `async reject`, and `no unhandled rejection` tests.

### 6. `GET /contact/submissions` returns `unreadCount` and notification status

A superset of the plan's "inbox list". Both extra fields exist to save round
trips the admin UI would otherwise make on every render: the unread count drives
the inbox badge and the dashboard card, and the notification status lets the
inbox warn when Resend is unconfigured instead of that being invisible until
someone notices no email arrived.

### 7. `PATCH .../read` accepts `{ read: false }` to un-read

The plan only specifies mark-as-read. Accepting an optional boolean (default
`true`) means the same endpoint also moves a submission back to unread, which an
inbox needs, without adding a second route. Omitting the body keeps the plain
mark-as-read behaviour from the plan.

### 8. IP is stored as an HMAC digest, never raw

`contact_submissions.ip_hash` uses HMAC-SHA256 keyed by
`CONTACT_IP_HASH_SALT`, falling back to `JWT_SECRET` so the column is never
populated with readable addresses even when the extra variable is unset. A bare
hash was rejected because the IPv4 space is small enough to brute-force offline.
The user agent is truncated to 500 chars — it is attacker-controlled and is the
only place that header is retained.

### 9. Notification transport is split from notification logic

`ResendService` owns the SDK and is the only code that can open a socket;
`NotificationsService` owns content assembly and error handling. This mirrors
Stage 1's `R2StorageService` / `MediaService` split, and it is why the live send
is stubbable in one obvious place. Both SDK clients (Resend, AWS) are lazily
constructed so the API still boots without credentials.

### 10. `NotificationsService` cannot reject; `ResendService` can

The fail-safe requirement is enforced by construction: the public method catches
everything and returns a boolean. Only the transport throws, so the guarantee
does not depend on every future caller remembering to wrap the call.

### 11. Sender defaults to Resend's test address

`NOTIFICATION_FROM_EMAIL` overrides the envelope sender. Unset, it falls back to
`Portfolio <onboarding@resend.dev>`, which only delivers to the address on the
Resend account — enough to verify the whole pipeline live before a domain is
verified. `FRONTEND_URL` is treated as optional too: unset, the deep link
degrades to a relative `/admin/contact?submission=<id>` instead of embedding
`undefined`.

### 12. Email content is escaped, header-sanitised, and scheme-guarded

All four submission fields are attacker-controlled, and this is the one place
they are rendered as markup:

- `escapeHtml` on every interpolated value.
- Newlines, tabs and CR stripped from the name used in the Subject header
  (header injection).
- The `mailto:` href is only emitted when the value is actually a plain address;
  otherwise it renders as plain text, because `escapeHtml` prevents attribute
  break-out but would still have produced `href="mailto:javascript:…"`.
- The admin deep link is `encodeURIComponent`-encoded so an id cannot inject
  extra query parameters.

### 13. `app.set('trust proxy', 1)` added in `main.ts`

Not contact-specific, but the rate limit is unusable without it: behind Railway
every request appears to originate from the proxy, which would collapse all
visitors into one shared 3-per-15-minute quota. Set to a numeric `1` rather than
`true` so a client-supplied `X-Forwarded-For` cannot spoof past the limit. This
also corrects `req.ip` for the digest in decision 8.

### 14. Timestamps in the inbox render with `suppressHydrationWarning`

The inbox is a client component that Next also prerenders, and
`toLocaleString()` legitimately differs between the server's locale/timezone and
the browser's. The full ISO value stays available in the `title` attribute.

### 15. Public contact form not wired up in this stage

Out of the scope that was set for Stage 2 (module + notifications + admin inbox).
Migrating `src/components/sections/contact.tsx` off its fake `setTimeout` is a
`§6` cutover step, and per the plan is done one section at a time with a static
fallback. When that happens, the form needs a hidden `website` input (the
honeypot) alongside the existing fields; `POST /contact` already expects it and
ignores it when absent.

### 16. Admin reply is a `mailto:` link

Per the plan, replying happens from the visitor's own mail client. The button
prefills a `Re: <subject>` and sets `reply-to` on the notification to the
sender's address, so both directions work without an in-app composer.

---

## Stage 3 — Content modules + public cutover + admin UI

### 1. Static fallbacks are kept in `content.ts`, not deleted at cutover

Each loader in `src/lib/content.ts` falls back to `src/data/portfolio.ts` when the
API is unreachable or returns malformed JSON, and the page is
`dynamic = "force-dynamic"` so the fetch happens per request rather than at build
time. The fallback is logged once per loader per process rather than on every
render, because a page render fans out into 16 loaders and an unreachable backend
would otherwise produce 16 identical stack traces per visit.

This is deliberate: the plan treats the cutover as reversible per section, so the
static data stays as the rollback path. The consequence to be aware of is that a
broken backend degrades to stale content *silently* apart from the server log —
worth revisiting once the site is on monitoring.

### 2. `SectionMeta` is keyed by string, and the route is `/section-meta/:key`

The original migration created `section_meta` with an autoincrement `id` plus a
unique `key`. That combination is a trap: the public loader receives `key` (the
only value the six section components know) while the admin editor receives `id`,
so any lookup that mixes them silently edits the wrong row. A dedicated migration
(`20261003095332_fix_section_meta_id`) and a `:key` route parameter remove the
ambiguity — the key is now the single identifier used on both sides.

The six keys are a closed set (`about`, `skills`, `experience`, `projects`,
`certificates`, `contact`) and the admin editor presents exactly those six,
read-only. Adding a seventh row would have no renderer, so the page does not
offer "add".

### 3. Icons are stored on the row, keyed by a shared string vocabulary

`about.tsx` originally picked a quick-fact icon by array position, so deleting or
reordering a card in the admin reassigned glyphs to the wrong labels. The same
class of bug existed for skill-category icons. Both now store an `icon` string
validated by `@IsIn(...)` against a list that is mirrored in
`src/lib/content-icons.ts`, and resolved through
`resolveQuickFactIcon` / `resolveSkillCategoryIcon`. Those resolvers fall back to
a default glyph for an unknown key, so a bad value degrades instead of throwing
during render.

The vocabulary is duplicated in two files by necessity — the backend cannot
import from the frontend — and the DTO comment points at the frontend constant so
the two stay in sync.

### 4. `education.courses` was a real column that nothing rendered

The public education card showed a hardcoded course list. Editing courses in the
admin produced no visible change, which is the exact failure the stage is meant to
eliminate. `courses` is now returned by `GET /experience` and rendered from the
API. Same root cause as the heading and icon bugs: a data field that no component
read.

### 5. Reorder is one shared helper, and ids are validated as a complete set

Every reorder endpoint funnels through `backend/src/common/reorder.ts`. It
rejects a partial or duplicated id list (400) rather than silently renumbering,
because a drag that drops one row would otherwise leave two rows sharing an order
value and make the next render non-deterministic.

### 6. Literal routes are declared before their `:id` siblings

`/certificates/stats` and `/certificates/issuing-organizations` are siblings of
`/certificates/:id`. Express matches in declaration order, so declaring the
literal paths after the parameterised one would route every request to
`/certificates/:id`. Both controllers declare literals first, and
`backend/src/tests/certificate-extras-routes.spec.ts` asserts it explicitly —
this is a silent 404/500 otherwise, and it is easy to reintroduce.

### 7. Certificate stats and issuing organizations live in the Certificates admin UI

They are separate tables and separate endpoints, but they only ever render inside
the certificates section, next to the certificate grid. They are therefore edited
as two collapsible panels inside the existing `/admin/certificates` page rather
than as their own routes. Keeps the admin IA aligned with how the page is read.

### 8. Site config, social links, nav and headings share one admin page

Same reasoning: all four are global site settings with one row (or one short
list), and an editor looking for "the site name" should not have to know which
table it lives in. `/admin/site-config` presents them as four tabs.

The active tab is passed from the server component via `?tab=` rather than read
with `useSearchParams` in the client, which keeps the page free of the Suspense
boundary `useSearchParams` requires. This is also what lets the dashboard
deep-link straight to the Navigation tab.

### 9. Identity fields are edited under Site config, not under Hero & stats

`/admin/hero` only manages the four stat rows. The name, title, headline and
photo are columns of the `site_config` singleton, which the header and footer read
too — editing them from a page named "hero" would have two writers for one row.

### 10. A `null` initial payload is reported, not rendered as empty

Every admin page server-fetches its data. A failed fetch yields `null` rather than
an empty array, so the page can distinguish "no rows yet" from "the API is not
reachable" and say so. Silently rendering empty forms would read as data loss.

### 11. Public GET routes are `@Public()`; every write stays guarded

The public site is unauthenticated, so the read endpoints for each Stage 3 module
are public. All `POST`/`PATCH`/`DELETE` routes keep the global `JwtAuthGuard` and
are exercised as authenticated in the route tests. No write endpoint was opened
up to make the admin UI work.

### 12. Reordering is optimistic, then reconciled from the server response

`SortableList` reorders locally on drop and the client `PATCH`es the id array.
On success the client replaces local state with the response body rather than
trusting its own guess, so the on-screen order is always the server's order. On
failure the previous order is restored.

---

## Stage 4 — Railway deployment

### 1. `engines.node` is declared in *both* `package.json` files

The first production build provisioned **Node 18.20.5** and ran the whole NestJS
11 app on it. Nothing failed — the service booted, `PrismaService` connected, and
the health check passed — which is exactly what makes this worth recording.
NestJS 11 requires Node >= 20, so the first deploy was an unsupported runtime
that happened to work.

The cause is that Nixpacks picks the Node version from the **repository root**
`package.json`, and this is a monorepo whose root is the Next.js frontend. With
no `engines` field it fell back to the Nixpacks default of Node 18. Declaring
`engines.node` only in `backend/package.json` would have been the obvious fix and
would have done nothing, because the backend's `package.json` is never consulted
during the setup phase. Both files now declare `>=20`.

Residual, accepted: several *frontend* dependencies (`@tailwindcss/oxide`,
`undici`, `shadcn`, `next` 16) declare `>=22`, so they keep emitting `EBADENGINE`
warnings during the backend build's install phase. Those are warnings on packages
we are not using at build time, and they disappear if the range is later raised.

### 2. Railway build config lives in the repo root and `cd`s into `backend/`

The dashboard's "Root Directory" field is the intended way to point a service at
`backend/`, but it could not be edited, and the Railway config schema has no
`rootDirectory` key (it is a dashboard-only setting) and the CLI has no matching
flag. The workaround is a root-level `railway.json` whose commands `cd backend`
first, with the builder set to `NIXPACKS` so `railway.json` is honoured at all.

The cost is that Nixpacks still runs its own `npm ci` against the **frontend**
root before our build command, so the backend build pays for a Next.js install it
does not need. A root `Dockerfile` would avoid this and is the better long-term
answer, but it is a larger change than this deployment needed.

Worth knowing: `railway service status --json` reports the dashboard's stored
settings (`builder: RAILPACK`, `buildCommand: null`) while the build is still
running, which looks like the config was ignored. It is misleading — the Nixpacks
plan banner in `railway logs --build` is the authoritative signal that
`railway.json` was applied.

### 3. `--include=dev` is mandatory in the build command

Railway sets `NODE_ENV=production` for the build, which makes npm resolve
`omit=dev`. A plain `npm ci` in `backend/` therefore drops `@nestjs/cli` and
`prisma`, and `nest build` / `prisma generate` both fail with a missing-binary
error. The build command uses `npm ci --include=dev` to force them back in.

### 4. Seed runs manually over SSH, and `ADMIN_*` are never Railway variables

`preDeployCommand` runs `prisma migrate deploy` only. `prisma db seed` is
deliberately **not** in it: `seed.ts` upserts the admin row and rewrites its
password hash, so running it on every deploy would silently revert any password
change made through the admin UI.

For the same reason `ADMIN_EMAIL` and `ADMIN_PASSWORD` are not stored as Railway
variables, matching the "local only" note in `backend/.env.example`. They are
supplied inline for a single `railway ssh` invocation instead, so the credentials
exist in exactly one place at exactly one moment.

### 5. `railway.json` is deprecated in favour of `.railway/railway.ts`

Every Railway CLI call now emits:

> Config as Code (railway.json / railway.toml) is deprecated. Prefer
> Infrastructure as Code (.railway/railway.ts). Existing files keep working
> until 2026-12-01.

The current file works and this deployment is unaffected, so no migration is
attempted now. **Action required before 2026-12-01:** either run
`railway config migrate` or hand-write `.railway/railway.ts` for
`portfolio-backend`. Deliberately deferred rather than done mid-deployment.