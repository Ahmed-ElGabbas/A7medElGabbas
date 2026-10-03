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