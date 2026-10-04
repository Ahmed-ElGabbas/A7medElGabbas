"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, KeyRound, LogOut, X } from "lucide-react";
import { adminApi } from "@/lib/admin-api";

/** Kept in sync with MIN_PASSWORD_LENGTH in the backend ChangePasswordDto. */
const MIN_LENGTH = 12;

/**
 * Self-service password change for the signed-in admin.
 *
 * Rendered inline rather than in a portal-level dialog so it inherits the
 * dashboard's glass panel and needs no dialog dependency. Focus is moved into
 * the form on open and Escape closes it, so it is keyboard-usable like a real
 * modal even though it is a positioned overlay.
 */
export default function AdminChangePasswordDialog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  const resetForm = useCallback(() => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setDone(false);
    setStatus("idle");
  }, []);

  const openDialog = () => {
    // Cleared here rather than in an effect on close, so a stale failure or a
    // typed password is never sitting in the fields when the panel reopens.
    resetForm();
    setOpen(true);
  };

  const close = useCallback(() => {
    setOpen(false);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!open) return;

    firstFieldRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < MIN_LENGTH) {
      setError(`New password must be at least ${MIN_LENGTH} characters.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The two new passwords do not match.");
      return;
    }

    setStatus("saving");

    try {
      await adminApi.changePassword({ currentPassword, newPassword });
      setDone(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not change the password.");
    } finally {
      setStatus("idle");
    }
  }

  const busy = status === "saving";

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs transition-colors hover:border-accent-gold/45 hover:bg-accent/10"
      >
        <KeyRound className="h-3.5 w-3.5 gold-text" aria-hidden />
        Change password
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="glass-panel w-full max-w-md p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="change-password-title" className="text-base font-semibold tracking-tight">
                  <span className="gold-text">{"//"}</span> change password
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">{email}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {done ? (
              <div className="space-y-4">
                <p className="flex items-start gap-2 rounded-xl border border-accent-gold/40 bg-accent/10 px-3 py-3 text-xs text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 gold-text" aria-hidden />
                  <span>
                    Password updated, and every other signed-in device has been signed out. This
                    browser stays signed in; anything else will need the new password.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="current-password"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Current password
                  </label>
                  <input
                    id="current-password"
                    ref={firstFieldRef}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    disabled={busy}
                    className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="new-password"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_LENGTH}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={busy}
                    className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    At least {MIN_LENGTH} characters. A passphrase you can remember beats a short
                    one with punctuation rules.
                  </p>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="text-xs uppercase tracking-wider text-muted-foreground"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_LENGTH}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={busy}
                    className="w-full rounded-lg border border-border bg-background py-2.5 px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
                  />
                </div>

                {error ? (
                  <p
                    role="alert"
                    className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? "Updating…" : "Update password"}
                </button>

                {/* Stated up front rather than only in the success message: signing
                    out a phone or a second browser is a visible consequence, and
                    finding out after the fact reads as the change having broken
                    something. */}
                <p className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <LogOut className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span>
                    This signs out every other device. This browser stays signed in.
                  </span>
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}