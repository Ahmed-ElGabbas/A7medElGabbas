"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Quote,
  Trash2,
} from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminSkill,
  type AdminSkillCategory,
  type AdminSkillSpotlight,
  type AdminTickerSkill,
  type SkillsPayload,
} from "@/lib/admin-api";
import { SKILL_CATEGORY_ICON_KEYS, resolveSkillCategoryIcon } from "@/lib/content-icons";
import {
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

type Tab = "categories" | "quote" | "ticker";

const TABS: { key: Tab; label: string }[] = [
  { key: "categories", label: "Categories" },
  { key: "quote", label: "Philosophy quote" },
  { key: "ticker", label: "Ticker" },
];

interface CategoryDraft {
  title: string;
  icon: string;
}

interface SpotlightDraft {
  summary: string;
  patterns: string[];
  primaryProject: string;
}

const EMPTY_CATEGORY: CategoryDraft = { title: "", icon: "" };

export default function SkillsClient({ initial }: { initial: SkillsPayload | null }) {
  const [categories, setCategories] = useState<AdminSkillCategory[]>(initial?.categories ?? []);
  const [quote, setQuote] = useState(initial?.philosophyQuote ?? null);
  const [ticker, setTicker] = useState<AdminTickerSkill[]>(initial?.tickerSkills ?? []);

  const [tab, setTab] = useState<Tab>("categories");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    try {
      const res = await adminApi.getSkills();
      setCategories(res.categories);
      setQuote(res.philosophyQuote);
      setTicker(res.tickerSkills);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load skills.");
    }
  }

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
        <span className="gold-text">{"//"}</span> skills
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Category cards, their nested skills and spotlights, plus the quote and ticker strip.
      </p>

      <ErrorNote>{initial === null ? "Could not load skills from the API." : error}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      <div role="tablist" aria-label="Skills sections" className="mt-6 flex gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "categories" ? (
        <CategoriesPanel
          categories={categories}
          onChanged={async (message) => {
            setNotice(message);
            await reload();
          }}
          onError={setError}
        />
      ) : null}

      {tab === "quote" ? (
        <QuotePanel
          quote={quote}
          onChanged={async (message) => {
            setNotice(message);
            await reload();
          }}
        />
      ) : null}

      {tab === "ticker" ? (
        <TickerPanel
          items={ticker}
          onChanged={async (message) => {
            setNotice(message);
            await reload();
          }}
          onError={setError}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------- categories ------------------------------- */

function CategoriesPanel({
  categories,
  onChanged,
  onError,
}: {
  categories: AdminSkillCategory[];
  onChanged: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<CategoryDraft>(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  async function handleCategoryReorder(ids: string[]) {
    try {
      await adminApi.reorderSkillCategories(ids);
      await onChanged("Category order saved.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not save the category order.");
    }
  }

  async function handleCategorySave() {
    setSaving(true);
    setFormError(null);
    try {
      const body = { title: draft.title.trim(), icon: draft.icon || null };
      if (editing === "new") {
        await adminApi.createSkillCategory(body);
        await onChanged("Category created.");
      } else if (editing) {
        await adminApi.updateSkillCategory(editing, body);
        await onChanged("Category updated.");
      }
      setEditing(null);
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save the category.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCategoryDelete(category: AdminSkillCategory) {
    const extra =
      category.skills.length > 0
        ? ` It has ${category.skills.length} skill(s) and a spotlight, which will be deleted too.`
        : "";
    if (!window.confirm(`Delete the "${category.title}" category?${extra}`)) return;
    try {
      await adminApi.deleteSkillCategory(category.id);
      await onChanged("Category deleted.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not delete the category.");
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Deleting a category removes its skills and spotlight.
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_CATEGORY);
            setFormError(null);
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add category
        </button>
      </div>

      {editing ? (
        <div className="glass-card mt-4 space-y-4 p-5">
          <h2 className="text-sm font-semibold">
            {editing === "new" ? "New category" : "Edit category"}
          </h2>

          <Field label="Title" htmlFor="cat-title">
            <TextInput
              id="cat-title"
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
              disabled={saving}
            />
          </Field>

          <Field label="Icon" htmlFor="cat-icon" hint="Stored per row, so reordering is safe.">
            <select
              id="cat-icon"
              value={draft.icon}
              onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
              disabled={saving}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60"
            >
              <option value="">— default —</option>
              {SKILL_CATEGORY_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </Field>

          <ErrorNote>{formError}</ErrorNote>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCategorySave}
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
        </div>
      ) : null}

      {categories.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No skill categories yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={categories}
            onReorder={(ids) => void handleCategoryReorder(ids)}
            renderItem={(category, handle) => (
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  {handle}
                  <button
                    type="button"
                    onClick={() => setOpen({ ...open, [category.id]: !open[category.id] })}
                    aria-expanded={Boolean(open[category.id])}
                    aria-label={`${open[category.id] ? "Collapse" : "Expand"} ${category.title}`}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {open[category.id] ? (
                      <ChevronDown className="h-4 w-4" aria-hidden />
                    ) : (
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    )}
                  </button>

                  {(() => {
                    const Icon = resolveSkillCategoryIcon(category.icon);
                    return <Icon className="h-4 w-4 shrink-0 text-accent-gold" aria-hidden />;
                  })()}

                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {category.skills.length} skills
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({ title: category.title, icon: category.icon ?? "" });
                      setFormError(null);
                      setEditing(category.id);
                    }}
                    aria-label={`Edit ${category.title}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCategoryDelete(category)}
                    aria-label={`Delete ${category.title}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>

                {open[category.id] ? (
                  <div className="mt-4 space-y-5 border-t border-border pt-4">
                    <SkillsEditor category={category} onChanged={onChanged} onError={onError} />
                    <SpotlightEditor category={category} onChanged={onChanged} />
                  </div>
                ) : null}
              </div>
            )}
          />
        </div>
      )}
    </section>
  );
}

function SkillsEditor({
  category,
  onChanged,
  onError,
}: {
  category: AdminSkillCategory;
  onChanged: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleReorder(ids: string[]) {
    try {
      await adminApi.reorderSkills(category.id, ids);
      await onChanged("Skill order saved.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not save the skill order.");
    }
  }

  async function handleAdd() {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.createSkill(category.id, { name: name.trim() });
      setName("");
      setAdding(false);
      await onChanged("Skill added.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not add the skill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(skill: AdminSkill) {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.updateSkill(category.id, skill.id, { name: editName.trim() });
      setEditing(null);
      await onChanged("Skill updated.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not update the skill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(skill: AdminSkill) {
    if (!window.confirm(`Delete the "${skill.name}" skill?`)) return;
    try {
      await adminApi.deleteSkill(category.id, skill.id);
      await onChanged("Skill deleted.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not delete the skill.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</h3>
        <button
          type="button"
          onClick={() => {
            setName("");
            setFormError(null);
            setAdding(true);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] transition-colors hover:bg-accent"
        >
          <Plus className="h-3 w-3" aria-hidden />
          Add
        </button>
      </div>

      {adding ? (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div className="min-w-[12rem] flex-1">
            <Field label="New skill name" htmlFor={`sk-new-${category.id}`}>
              <TextInput
                id={`sk-new-${category.id}`}
                value={name}
                onChange={setName}
                placeholder="React"
                disabled={busy}
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
            Add
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            disabled={busy}
            className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      ) : null}

      <ErrorNote>{formError}</ErrorNote>

      {category.skills.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">No skills in this category.</p>
      ) : (
        <div className="mt-3">
          <SortableList
            items={category.skills}
            onReorder={(ids) => void handleReorder(ids)}
            renderItem={(skill, handle) =>
              editing === skill.id ? (
                <div className="flex flex-wrap items-end gap-2 rounded-lg border border-primary/40 bg-background p-2">
                  {handle}
                  <div className="min-w-[10rem] flex-1">
                    <Field label="Skill name" htmlFor={`sk-edit-${skill.id}`}>
                      <TextInput
                        id={`sk-edit-${skill.id}`}
                        value={editName}
                        onChange={setEditName}
                        disabled={busy}
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUpdate(skill)}
                    disabled={busy}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    Save
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
              ) : (
                <div className="flex items-center gap-2 rounded-lg bg-background p-2 text-sm">
                  {handle}
                  <span className="min-w-0 flex-1 truncate">{skill.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(skill.name);
                      setFormError(null);
                      setEditing(skill.id);
                    }}
                    aria-label={`Edit ${skill.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(skill)}
                    aria-label={`Delete ${skill.name}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              )
            }
          />
        </div>
      )}
    </div>
  );
}

function SpotlightEditor({
  category,
  onChanged,
}: {
  category: AdminSkillCategory;
  onChanged: (message: string) => Promise<void>;
}) {
  const existing: AdminSkillSpotlight | null = category.spotlight;
  const [draft, setDraft] = useState<SpotlightDraft>({
    summary: existing?.summary ?? "",
    patterns: existing?.patterns ?? [],
    primaryProject: existing?.primaryProject ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.updateSpotlight(category.id, {
        summary: draft.summary.trim(),
        patterns: draft.patterns,
        primaryProject: draft.primaryProject.trim(),
      });
      await onChanged("Spotlight saved.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save the spotlight.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Spotlight
      </h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        One spotlight per category; saving creates it if the category does not have one yet.
      </p>

      <div className="mt-3 space-y-3">
        <Field label="Summary" htmlFor={`sp-sum-${category.id}`}>
          <TextArea
            id={`sp-sum-${category.id}`}
            value={draft.summary}
            onChange={(summary) => setDraft({ ...draft, summary })}
            rows={3}
            disabled={busy}
          />
        </Field>

        <ListField
          label="Patterns"
          value={draft.patterns}
          onChange={(patterns) => setDraft({ ...draft, patterns })}
          placeholder="Design systems, Recharts dashboards"
          hint="Comma separated, max 12."
        />

        <Field label="Primary project" htmlFor={`sp-pp-${category.id}`}>
          <TextInput
            id={`sp-pp-${category.id}`}
            value={draft.primaryProject}
            onChange={(primaryProject) => setDraft({ ...draft, primaryProject })}
            disabled={busy}
          />
        </Field>

        <ErrorNote>{formError}</ErrorNote>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
          Save spotlight
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- quote --------------------------------- */

function QuotePanel({
  quote,
  onChanged,
}: {
  quote: SkillsPayload["philosophyQuote"];
  onChanged: (message: string) => Promise<void>;
}) {
  const [text, setText] = useState(quote?.quote ?? "");
  const [author, setAuthor] = useState(quote?.author ?? "");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.updatePhilosophyQuote({
        quote: text.trim(),
        author: author.trim(),
      });
      await onChanged("Quote saved.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save the quote.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-card mt-6 space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Quote className="h-4 w-4 text-accent-gold" aria-hidden />
        <h2 className="text-sm font-semibold">Philosophy quote</h2>
      </div>

      {quote === null ? (
        <p className="text-xs text-muted-foreground">
          No quote row exists yet. Saving below will create one.
        </p>
      ) : null}

      <Field label="Quote" htmlFor="q-text">
        <TextArea id="q-text" value={text} onChange={setText} rows={4} disabled={busy} />
      </Field>

      <Field label="Author" htmlFor="q-author" hint="Leave blank for none.">
        <TextInput id="q-author" value={author} onChange={setAuthor} disabled={busy} />
      </Field>

      <ErrorNote>{formError}</ErrorNote>

      <button
        type="button"
        onClick={handleSave}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
        {busy ? "Saving…" : "Save quote"}
      </button>
    </section>
  );
}

/* --------------------------------- ticker -------------------------------- */

function TickerPanel({
  items,
  onChanged,
  onError,
}: {
  items: AdminTickerSkill[];
  onChanged: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  async function handleReorder(ids: string[]) {
    try {
      await adminApi.reorderTickerSkills(ids);
      await onChanged("Ticker order saved.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not save the ticker order.");
    }
  }

  async function handleAdd() {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.createTickerSkill({ label: label.trim() });
      setLabel("");
      await onChanged("Ticker skill added.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not add the ticker skill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(item: AdminTickerSkill) {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.updateTickerSkill(item.id, { label: editLabel.trim() });
      setEditing(null);
      await onChanged("Ticker skill updated.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not update the ticker skill.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: AdminTickerSkill) {
    if (!window.confirm(`Remove "${item.label}" from the ticker?`)) return;
    try {
      await adminApi.deleteTickerSkill(item.id);
      await onChanged("Ticker skill removed.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not remove the ticker skill.");
    }
  }

  return (
    <section className="mt-6">
      <div className="glass-card space-y-4 p-5">
        <Field label="Add ticker skill" htmlFor="tk-label">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[12rem] flex-1">
              <TextInput
                id="tk-label"
                value={label}
                onChange={setLabel}
                placeholder="TypeScript"
                disabled={busy}
              />
            </div>
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
              Add
            </button>
          </div>
        </Field>

        <ErrorNote>{formError}</ErrorNote>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">The ticker is empty.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={items}
            onReorder={(ids) => void handleReorder(ids)}
            renderItem={(item, handle) =>
              editing === item.id ? (
                <div className="flex flex-wrap items-end gap-2 rounded-lg border border-primary/40 bg-background p-3">
                  {handle}
                  <div className="min-w-[10rem] flex-1">
                    <Field label="Label" htmlFor={`tk-edit-${item.id}`}>
                      <TextInput
                        id={`tk-edit-${item.id}`}
                        value={editLabel}
                        onChange={setEditLabel}
                        disabled={busy}
                      />
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleUpdate(item)}
                    disabled={busy}
                    className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    Save
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
              ) : (
                <div className="glass-card flex items-center gap-3 p-3">
                  {handle}
                  <span className="min-w-0 flex-1 truncate text-sm">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditLabel(item.label);
                      setFormError(null);
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
              )
            }
          />
        </div>
      )}
    </section>
  );
}