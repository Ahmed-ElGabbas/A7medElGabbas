"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminApiError, adminApi, type AdminStat } from "@/lib/admin-api";
import { ErrorNote, Field, SuccessNote, TextInput } from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

interface StatDraft {
  value: string;
  label: string;
}

const EMPTY: StatDraft = { value: "", label: "" };

function toDraft(stat: AdminStat): StatDraft {
  return { value: stat.value, label: stat.label };
}

export default function HeroClient({ initialItems }: { initialItems: AdminStat[] | null }) {
  const [items, setItems] = useState<AdminStat[]>(initialItems ?? []);
  const [loadError, setLoadError] = useState<string | null>(
    initialItems === null ? "Could not load stats from the API." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<StatDraft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await adminApi.listStats();
      setItems(res.items);
      setLoadError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load stats.");
    }
  }

  async function handleReorder(ids: string[]) {
    const previous = items;
    setItems((current) => ids.map((id) => current.find((s) => s.id === id)!).filter(Boolean));
    try {
      const res = await adminApi.reorderStats(ids);
      setItems(res.items);
      setNotice("Order saved.");
    } catch (caught) {
      setItems(previous);
      setError(caught instanceof Error ? caught.message : "Could not save the new order.");
    }
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      const payload = { value: draft.value.trim(), label: draft.label.trim() };
      if (editing === "new") {
        await adminApi.createStat(payload);
        setNotice("Stat created.");
      } else if (editing) {
        await adminApi.updateStat(editing, payload);
        setNotice("Stat updated.");
      }
      setEditing(null);
      await load();
    } catch (caught) {
      setFormError(
        caught instanceof AdminApiError ? caught.message : "Could not save the stat.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(stat: AdminStat) {
    if (!window.confirm(`Delete "${stat.value} ${stat.label}"?`)) return;
    setError(null);
    try {
      await adminApi.deleteStat(stat.id);
      if (editing === stat.id) setEditing(null);
      setNotice("Stat deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the stat.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        dashboard
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> hero &amp; stats
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            The stat strip renders in both the hero and the about section. Identity fields live under Site
            config.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY);
            setFormError(null);
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add stat
        </button>
      </div>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {editing ? (
        <section className="glass-card mb-6 space-y-4 p-5">
          <h2 className="text-sm font-semibold">
            {editing === "new" ? "New stat" : "Edit stat"}
          </h2>

          <Field label="Value" htmlFor="s-value" hint="Short display value, e.g. 3+ or 500+.">
            <TextInput
              id="s-value"
              value={draft.value}
              onChange={(value) => setDraft({ ...draft, value })}
              disabled={saving}
            />
          </Field>

          <Field label="Label" htmlFor="s-label" hint="e.g. Projects Delivered.">
            <TextInput
              id="s-label"
              value={draft.label}
              onChange={(label) => setDraft({ ...draft, label })}
              disabled={saving}
            />
          </Field>

          <ErrorNote>{formError}</ErrorNote>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              disabled={saving}
              className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {initialItems === null ? null : items.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">
          No stats yet. Add one, or run the seed script.
        </p>
      ) : (
        <SortableList
          items={items}
          onReorder={(ids) => void handleReorder(ids)}
          renderItem={(stat, handle) => (
            <div className="glass-card flex items-center gap-3 p-4">
              {handle}
              <div className="min-w-0 flex-1">
                <span className="font-display text-lg font-bold gold-text">{stat.value}</span>
                <span className="ml-2 text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraft(toDraft(stat));
                  setFormError(null);
                  setEditing(stat.id);
                }}
                aria-label={`Edit ${stat.label}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(stat)}
                aria-label={`Delete ${stat.label}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}