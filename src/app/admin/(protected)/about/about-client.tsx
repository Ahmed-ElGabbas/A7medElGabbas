"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminAboutContent,
  type AdminQuickFact,
} from "@/lib/admin-api";
import { QUICK_FACT_ICON_KEYS, resolveQuickFactIcon } from "@/lib/content-icons";
import {
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

interface QuickFactDraft {
  label: string;
  value: string;
  detail: string;
  icon: string;
}

const EMPTY_FACT: QuickFactDraft = { label: "", value: "", detail: "", icon: "" };

interface AboutDraft {
  sectionSubtitle: string;
  narrativeTitle: string;
  paragraphs: string[];
  highlights: string[];
  academicFocusTitle: string;
  academicFocusDescription: string;
}

function toFactDraft(fact: AdminQuickFact): QuickFactDraft {
  return {
    label: fact.label,
    value: fact.value,
    detail: fact.detail ?? "",
    icon: fact.icon ?? "",
  };
}

export default function AboutClient({ initialAbout }: { initialAbout: AdminAboutContent | null }) {
  const [about, setAbout] = useState<AdminAboutContent | null>(initialAbout);
  const [draft, setDraft] = useState<AboutDraft>({
    sectionSubtitle: initialAbout?.sectionSubtitle ?? "",
    narrativeTitle: initialAbout?.narrativeTitle ?? "",
    paragraphs: initialAbout?.paragraphs ?? [],
    highlights: initialAbout?.highlights ?? [],
    academicFocusTitle: initialAbout?.academicFocusTitle ?? "",
    academicFocusDescription: initialAbout?.academicFocusDescription ?? "",
  });

  // Only the initial server fetch can produce a null payload; later failures go
  // through `error`, so a plain derived const is enough here.
  const loadError = initialAbout === null ? "Could not load the about section from the API." : null;
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [editingFact, setEditingFact] = useState<string | "new" | null>(null);
  const [factDraft, setFactDraft] = useState<QuickFactDraft>(EMPTY_FACT);
  const [savingFact, setSavingFact] = useState(false);
  const [factError, setFactError] = useState<string | null>(null);

  async function reload() {
    try {
      setAbout(await adminApi.getAbout());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the about section.");
    }
  }

  async function handleSaveNarrative() {
    setSaving(true);
    setFormError(null);
    setError(null);
    try {
      const updated = await adminApi.updateAbout({
        sectionSubtitle: draft.sectionSubtitle.trim(),
        narrativeTitle: draft.narrativeTitle.trim(),
        paragraphs: draft.paragraphs,
        highlights: draft.highlights,
        academicFocusTitle: draft.academicFocusTitle.trim(),
        academicFocusDescription: draft.academicFocusDescription.trim(),
      });
      setAbout(updated);
      setNotice("About content saved.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save the about content.");
    } finally {
      setSaving(false);
    }
  }

  async function handleFactReorder(ids: string[]) {
    const previous = about?.quickFacts ?? [];
    if (about) {
      setAbout({
        ...about,
        quickFacts: ids.map((id) => previous.find((f) => f.id === id)!).filter(Boolean),
      });
    }
    try {
      await adminApi.reorderQuickFacts(ids);
      setNotice("Quick fact order saved.");
    } catch (caught) {
      if (about) setAbout({ ...about, quickFacts: previous });
      setError(caught instanceof Error ? caught.message : "Could not save the quick fact order.");
    }
  }

  async function handleFactSave() {
    setSavingFact(true);
    setFactError(null);
    try {
      const payload = {
        label: factDraft.label.trim(),
        value: factDraft.value.trim(),
        detail: factDraft.detail.trim() || null,
        icon: factDraft.icon || null,
      };
      if (editingFact === "new") {
        await adminApi.createQuickFact(payload);
        setNotice("Quick fact created.");
      } else if (editingFact) {
        await adminApi.updateQuickFact(editingFact, payload);
        setNotice("Quick fact updated.");
      }
      setEditingFact(null);
      await reload();
    } catch (caught) {
      setFactError(caught instanceof AdminApiError ? caught.message : "Could not save the quick fact.");
    } finally {
      setSavingFact(false);
    }
  }

  async function handleFactDelete(fact: AdminQuickFact) {
    if (!window.confirm(`Delete the "${fact.label}" quick fact?`)) return;
    setError(null);
    try {
      await adminApi.deleteQuickFact(fact.id);
      if (editingFact === fact.id) setEditingFact(null);
      setNotice("Quick fact deleted.");
      await reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the quick fact.");
    }
  }

  const quickFacts = about?.quickFacts ?? [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <Link
        href="/admin/dashboard"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" aria-hidden />
        dashboard
      </Link>

      <h1 className="text-xl font-semibold tracking-tight">
        <span className="gold-text">{"//"}</span> about
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        The narrative block and the four quick-fact cards.
      </p>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {/* ------------------------------ narrative ---------------------------- */}
      <section className="glass-card mt-6 space-y-4 p-5">
        <h2 className="text-sm font-semibold">Narrative</h2>

        <Field label="Section subtitle" htmlFor="ab-sub" hint="Small line under the section heading.">
          <TextInput
            id="ab-sub"
            value={draft.sectionSubtitle}
            onChange={(sectionSubtitle) => setDraft({ ...draft, sectionSubtitle })}
            disabled={saving}
          />
        </Field>

        <Field label="Narrative title" htmlFor="ab-title">
          <TextInput
            id="ab-title"
            value={draft.narrativeTitle}
            onChange={(narrativeTitle) => setDraft({ ...draft, narrativeTitle })}
            disabled={saving}
          />
        </Field>

        <ListField
          label="Paragraphs"
          value={draft.paragraphs}
          onChange={(paragraphs) => setDraft({ ...draft, paragraphs })}
          hint="One per line. A new paragraph reorders as one block, so separate with a single newline only."
        />

        <ListField
          label="Highlights"
          value={draft.highlights}
          onChange={(highlights) => setDraft({ ...draft, highlights })}
          placeholder="5+ Years Experience, CS & AI Graduate"
          hint="Comma separated."
        />

        <Field label="Academic focus title" htmlFor="ab-acad-title">
          <TextInput
            id="ab-acad-title"
            value={draft.academicFocusTitle}
            onChange={(academicFocusTitle) => setDraft({ ...draft, academicFocusTitle })}
            disabled={saving}
          />
        </Field>

        <Field label="Academic focus description" htmlFor="ab-acad-desc">
          <TextArea
            id="ab-acad-desc"
            value={draft.academicFocusDescription}
            onChange={(academicFocusDescription) => setDraft({ ...draft, academicFocusDescription })}
            disabled={saving}
          />
        </Field>

        <ErrorNote>{formError}</ErrorNote>

        <button
          type="button"
          onClick={handleSaveNarrative}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          {saving ? "Saving…" : "Save narrative"}
        </button>
      </section>

      {/* ----------------------------- quick facts --------------------------- */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Quick facts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Icons are stored per row, so reordering here no longer reshuffles the glyphs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFactDraft(EMPTY_FACT);
            setFactError(null);
            setEditingFact("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add quick fact
        </button>
      </div>

      {editingFact ? (
        <section className="glass-card mt-4 space-y-4 p-5">
          <h3 className="text-sm font-semibold">
            {editingFact === "new" ? "New quick fact" : "Edit quick fact"}
          </h3>

          <Field label="Label" htmlFor="qf-label">
            <TextInput
              id="qf-label"
              value={factDraft.label}
              onChange={(label) => setFactDraft({ ...factDraft, label })}
              disabled={savingFact}
            />
          </Field>

          <Field label="Value" htmlFor="qf-value">
            <TextInput
              id="qf-value"
              value={factDraft.value}
              onChange={(value) => setFactDraft({ ...factDraft, value })}
              disabled={savingFact}
            />
          </Field>

          <Field label="Detail" htmlFor="qf-detail" hint="Optional second line.">
            <TextInput
              id="qf-detail"
              value={factDraft.detail}
              onChange={(detail) => setFactDraft({ ...factDraft, detail })}
              disabled={savingFact}
            />
          </Field>

          <Field
            label="Icon"
            htmlFor="qf-icon"
            hint="Choose the glyph to store. Leave blank for the default."
          >
            <select
              id="qf-icon"
              value={factDraft.icon}
              onChange={(e) => setFactDraft({ ...factDraft, icon: e.target.value })}
              disabled={savingFact}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
            >
              <option value="">— default —</option>
              {QUICK_FACT_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </Field>

          {/* Live preview, so the choice is verifiable before saving. */}
          {factDraft.icon ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Preview:
              {(() => {
                const Icon = resolveQuickFactIcon(factDraft.icon);
                return <Icon className="h-4 w-4 text-accent-gold" aria-hidden />;
              })()}
            </div>
          ) : null}

          <ErrorNote>{factError}</ErrorNote>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFactSave}
              disabled={savingFact}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {savingFact ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              {savingFact ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingFact(null)}
              disabled={savingFact}
              className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {initialAbout === null ? null : quickFacts.length === 0 ? (
        <p className="mt-4 py-8 text-sm text-muted-foreground">No quick facts yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={quickFacts}
            onReorder={(ids) => void handleFactReorder(ids)}
            renderItem={(fact, handle) => {
              const Icon = resolveQuickFactIcon(fact.icon);
              return (
                <div className="glass-card flex items-center gap-3 p-4">
                  {handle}
                  <Icon className="h-4 w-4 shrink-0 text-accent-gold" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{fact.label}</div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {fact.value}
                      {fact.detail ? ` · ${fact.detail}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFactDraft(toFactDraft(fact));
                      setFactError(null);
                      setEditingFact(fact.id);
                    }}
                    aria-label={`Edit ${fact.label}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleFactDelete(fact)}
                    aria-label={`Delete ${fact.label}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              );
            }}
          />
        </div>
      )}

      {initialAbout === null ? (
        <p className="mt-4 text-xs text-muted-foreground">
          <GraduationCap className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          Run the seed script to create the about row, then reload.
        </p>
      ) : null}
    </div>
  );
}