/**
 * Browser-side helper for the public contact form.
 *
 * Deliberately separate from `admin-api.ts`: that module is tied to the
 * authenticated panel and its errors are written for an operator, whereas this
 * one only ever talks to the unauthenticated `POST /contact`. Keeping them
 * apart means the public form cannot accidentally acquire admin behaviour, and a
 * visitor-facing error string can never leak an admin-shaped message.
 *
 * Posts through the relative /api/* path so Next's rewrite proxies it to the
 * backend on the same origin — no CORS, and the visitor's IP is seen as coming
 * from our own server, which is what the rate limit keys on.
 */

export interface ContactSubmissionInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /**
   * Honeypot. Always empty for a real visitor because the input is rendered
   * off-screen; a bot that fills it gets a success response and no delivery.
   */
  website?: string;
}

export interface ContactSubmitResult {
  received: true;
  message: string;
}

export class ContactApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ContactApiError";
  }
}

/**
 * Validation failures arrive as an array of strings from class-validator. They
 * are written for developers, so they are not shown verbatim; only the 429 and
 * the catch-all are surfaced, both phrased for a visitor.
 */
function visitorMessage(payload: unknown, status: number): string {
  if (status === 429) {
    return "Too many messages have been sent from this network. Please try again in a few minutes.";
  }
  if (status === 0) {
    return "Could not reach the server. Please check your connection and try again.";
  }
  if (status >= 500) {
    return "Something went wrong on the server. Please try again in a moment.";
  }
  return "Please check the form and try again.";
}

export async function submitContact(
  input: ContactSubmissionInput,
): Promise<ContactSubmitResult> {
  let res: Response;
  try {
    res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new ContactApiError(visitorMessage(null, 0), 0);
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ContactApiError(visitorMessage(payload, res.status), res.status);
  }

  return payload as ContactSubmitResult;
}