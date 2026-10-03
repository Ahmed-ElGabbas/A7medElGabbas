"use client";

import { useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminCertificateStat,
  type AdminIssuingOrganization,
} from "@/lib/admin-api";
import { ErrorNote, Field, SuccessNote, TextInput } from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

interface StatDraft {
  value: string;
  label: string;
  desc: string;
}

const EMPTY_STAT: StatDraft = { value: "", label: "", desc: "" };

/**
 * The two supporting data sets the public certificates section renders next to
 * the certificate cards: the stat strip and the issuing-organization marquee.
 * They live on their own endpoints, so they are fetched independently rather
 * than piggybacking on the certificate list response.
 */
export function CertificateExtras({
  initialStats,
  initialOrganizations,
}: {
  initialStats: AdminCertificateStat[] | null;
  initialOrganizations: AdminIssuingOrganization[] | null;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="mt-10 space-y-4">
      <div className="border-t border-border pt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Section extras
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          The stat strip and issuer marquee that render around the certificate grid.
        </p>
      </div>

      <ErrorNote>
        {initialStats === null || initialOrganizations === null
          ? "Could not load section extras from the API."
          : null}
      </ErrorNote>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setExpanded(expanded === "stats" ? null : "stats")}
          aria-expanded={expanded === "stats"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            expanded === "stats"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Stats{initialStats ? ` (${initialStats.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(expanded === "orgs" ? null : "orgs")}
          aria-expanded={expanded === "orgs"}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            expanded === "orgs"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Issuing organizations{initialOrganizations ? ` (${initialOrganizations.length})` : ""}
        </button>
      </div>

      {expanded === "stats" ? <StatsPanel initial={initialStats} /> : null}
      {expanded === "orgs" ? <OrgsPanel initial={initialOrganizations} /> : null}
    </div>
  );
}

function StatsPanel({ initial }: { initial: AdminCertificateStat[] | null }) {
  const [items, setItems] = useState<AdminCertificateStat[]>(initial ?? []);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<StatDraft>(EMPTY_STAT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    try {
      const res = await adminApi.listCertificateStats();
      setItems(res.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load stats.");
    }
  }

  async function handleReorder(ids: string[]) {
    try {
      const res = await adminApi.reorderCertificateStats(ids);
      setItems(res.items);
      setNotice("Stat order saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the stat order.");
      await reload();
    }
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const body = {
        value: draft.value.trim(),
        label: draft.label.trim(),
        desc: draft.desc.trim(),
      };
      if (editing === "new") {
        await adminApi.createCertificateStat(body);
        setNotice("Stat created.");
      } else if (editing) {
        await adminApi.updateCertificateStat(editing, body);
        setNotice("Stat updated.");
      }
      setEditing(null);
      await reload();
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Could not save the stat.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: AdminCertificateStat) {
    if (!window.confirm(`Delete the "${item.label}" stat?`)) return;
    try {
      await adminApi.deleteCertificateStat(item.id);
      if (editing === item.id) setEditing(null);
      setNotice("Stat deleted.");
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the stat.");
    }
  }

  return (
    <section className="glass-card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Stats</h3>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_STAT);
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add stat
        </button>
      </div>

      <SuccessNote>{notice}</SuccessNote>
      <ErrorNote>{error}</ErrorNote>

      {editing ? (
        <div className="space-y-4 rounded-lg border border-primary/40 bg-background p-4">
          <h4 className="text-xs font-semibold">
            {editing === "new" ? "New stat" : "Edit stat"}
          </h4>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Value" htmlFor="cs-value" hint="e.g. 8+">
              <TextInput
                id="cs-value"
                value={draft.value}
                onChange={(value) => setDraft({ ...draft, value })}
                disabled={busy}
              />
            </Field>
            <Field label="Label" htmlFor="cs-label" hint="e.g. Certifications">
              <TextInput
                id="cs-label"
                value={draft.label}
                onChange={(label) => setDraft({ ...draft, label })}
                disabled={busy}
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="cs-desc" hint="Optional.">
            <TextInput
              id="cs-desc"
              value={draft.desc}
              onChange={(desc) => setDraft({ ...draft, desc })}
              disabled={busy}
            />
          </Field>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {initial === null ? null : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No stats yet.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={(ids) => void handleReorder(ids)}
          renderItem={(item, handle) => (
            <div className="flex items-center gap-3 rounded-lg bg-background p-3">
              {handle}
              <span className="font-display text-base font-bold gold-text">{item.value}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{item.label}</div>
                {item.desc ? (
                  <div className="truncate text-[11px] text-muted-foreground">{item.desc}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraft({ value: item.value, label: item.label, desc: item.desc ?? "" });
                  setEditing(item.id);
                }}
                aria-label={`Edit ${item.label}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(item)}
                aria-label={`Delete ${item.label}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}
        />
      )}
    </section>
  );
}

function OrgsPanel({ initial }: { initial: AdminIssuingOrganization[] | null }) {
  const [items, setItems] = useState<AdminIssuingOrganization[]>(initial ?? []);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    try {
      const res = await adminApi.listIssuingOrganizations();
      setItems(res.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load organizations.");
    }
  }

  async function handleReorder(ids: string[]) {
    try {
      const res = await adminApi.reorderIssuingOrganizations(ids);
      setItems(res.items);
      setNotice("Organization order saved.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the organization order.");
      await reload();
    }
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      if (editing === "new") {
        await adminApi.createIssuingOrganization({ name: name.trim() });
        setNotice("Organization created.");
      } else if (editing) {
        await adminApi.updateIssuingOrganization(editing, { name: name.trim() });
        setNotice("Organization updated.");
      }
      setName("");
      setEditing(null);
      await reload();
    } catch (caught) {
      setError(caught instanceof AdminApiError ? caught.message : "Could not save the organization.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: AdminIssuingOrganization) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      await adminApi.deleteIssuingOrganization(item.id);
      if (editing === item.id) setEditing(null);
      setNotice("Organization deleted.");
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the organization.");
    }
  }

  return (
    <section className="glass-card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Issuing organizations</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Names shown in the marquee, e.g. Meta, Cisco, AWS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setName("");
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add organization
        </button>
      </div>

      <SuccessNote>{notice}</SuccessNote>
      <ErrorNote>{error}</ErrorNote>

      {editing ? (
        <div className="space-y-4 rounded-lg border border-primary/40 bg-background p-4">
          <Field label="Name" htmlFor="org-name">
            <TextInput
              id="org-name"
              value={name}
              onChange={setName}
              placeholder="Amazon Web Services"
              disabled={busy}
            />
          </Field>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {initial === null ? null : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No organizations yet.</p>
      ) : (
        <SortableList
          items={items}
          onReorder={(ids) => void handleReorder(ids)}
          renderItem={(item, handle) => (
            <div className="flex items-center gap-3 rounded-lg bg-background p-3">
              {handle}
              <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm">{item.name}</span>
              <button
                type="button"
                onClick={() => {
                  setName(item.name);
                  setEditing(item.id);
                }}
                aria-label={`Edit ${item.name}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(item)}
                aria-label={`Delete ${item.name}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}
        />
      )}
    </section>
  );
}