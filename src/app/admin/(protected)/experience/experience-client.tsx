"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Pencil,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminEducation,
  type AdminExperience,
  type AdminFutureGoals,
  type ExperiencePayload,
} from "@/lib/admin-api";
import {
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

type Tab = "roles" | "education" | "goals";

const TABS: { key: Tab; label: string }[] = [
  { key: "roles", label: "Roles" },
  { key: "education", label: "Education" },
  { key: "goals", label: "Future goals" },
];

interface ExperienceDraft {
  role: string;
  company: string;
  period: string;
  description: string;
  technologies: string[];
}

interface EducationDraft {
  degree: string;
  institution: string;
  period: string;
  description: string;
  gpa: string;
  courses: string[];
}

const EMPTY_EXPERIENCE: ExperienceDraft = {
  role: "",
  company: "",
  period: "",
  description: "",
  technologies: [],
};

const EMPTY_EDUCATION: EducationDraft = {
  degree: "",
  institution: "",
  period: "",
  description: "",
  gpa: "",
  courses: [],
};

export default function ExperienceClient({ initial }: { initial: ExperiencePayload | null }) {
  const [experiences, setExperiences] = useState<AdminExperience[]>(initial?.experiences ?? []);
  const [education, setEducation] = useState<AdminEducation[]>(initial?.education ?? []);
  const [futureGoals, setFutureGoals] = useState<AdminFutureGoals | null>(initial?.futureGoals ?? null);

  const [tab, setTab] = useState<Tab>("roles");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function reload() {
    try {
      const res = await adminApi.getExperience();
      setExperiences(res.experiences);
      setEducation(res.education);
      setFutureGoals(res.futureGoals);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load experience data.");
    }
  }

  async function announce(message: string) {
    setNotice(message);
    await reload();
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
        <span className="gold-text">{"//"}</span> experience
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Roles, education, and the future-goals callout. Course lists are now editable here.
      </p>

      <ErrorNote>{initial === null ? "Could not load experience data from the API." : error}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      <div role="tablist" aria-label="Experience sections" className="mt-6 flex gap-1.5">
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

      {tab === "roles" ? (
        <RolesPanel items={experiences} onChanged={announce} onError={setError} />
      ) : null}
      {tab === "education" ? (
        <EducationPanel items={education} onChanged={announce} onError={setError} />
      ) : null}
      {tab === "goals" ? <GoalsPanel goals={futureGoals} onChanged={announce} /> : null}
    </div>
  );
}

/* --------------------------------- roles --------------------------------- */

function RolesPanel({
  items,
  onChanged,
  onError,
}: {
  items: AdminExperience[];
  onChanged: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<ExperienceDraft>(EMPTY_EXPERIENCE);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function startEdit(item: AdminExperience) {
    setDraft({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      technologies: item.technologies,
    });
    setFormError(null);
    setEditing(item.id);
  }

  async function handleReorder(ids: string[]) {
    try {
      await adminApi.reorderExperiences(ids);
      await onChanged("Role order saved.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not save the role order.");
    }
  }

  async function handleSave() {
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        role: draft.role.trim(),
        company: draft.company.trim(),
        period: draft.period.trim(),
        description: draft.description.trim(),
        technologies: draft.technologies,
      };
      if (editing === "new") {
        await adminApi.createExperience(body);
        await onChanged("Role created.");
      } else if (editing) {
        await adminApi.updateExperience(editing, body);
        await onChanged("Role updated.");
      }
      setEditing(null);
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save the role.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: AdminExperience) {
    if (!window.confirm(`Delete the "${item.role}" role at ${item.company}?`)) return;
    try {
      await adminApi.deleteExperience(item.id);
      await onChanged("Role deleted.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not delete the role.");
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Newest role first is up to you — order is yours to set.</p>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_EXPERIENCE);
            setFormError(null);
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add role
        </button>
      </div>

      {editing ? (
        <div className="glass-card mt-4 space-y-4 p-5">
          <h2 className="text-sm font-semibold">{editing === "new" ? "New role" : "Edit role"}</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role" htmlFor="ex-role">
              <TextInput
                id="ex-role"
                value={draft.role}
                onChange={(role) => setDraft({ ...draft, role })}
                disabled={busy}
              />
            </Field>
            <Field label="Company" htmlFor="ex-company">
              <TextInput
                id="ex-company"
                value={draft.company}
                onChange={(company) => setDraft({ ...draft, company })}
                disabled={busy}
              />
            </Field>
          </div>

          <Field label="Period" htmlFor="ex-period" hint="Free-form, e.g. 2024 — Present.">
            <TextInput
              id="ex-period"
              value={draft.period}
              onChange={(period) => setDraft({ ...draft, period })}
              disabled={busy}
            />
          </Field>

          <Field label="Description" htmlFor="ex-desc">
            <TextArea
              id="ex-desc"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              disabled={busy}
            />
          </Field>

          <ListField
            label="Technologies"
            value={draft.technologies}
            onChange={(technologies) => setDraft({ ...draft, technologies })}
            placeholder="React, TypeScript, Prisma"
            hint="Comma separated, max 30."
          />

          <ErrorNote>{formError}</ErrorNote>

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

      {items.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No roles yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={items}
            onReorder={(ids) => void handleReorder(ids)}
            renderItem={(item, handle) => (
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  {handle}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {item.role}
                      <span className="text-muted-foreground"> · {item.company}</span>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{item.period}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.role}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    aria-label={`Delete ${item.role}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
              </div>
            )}
          />
        </div>
      )}
    </section>
  );
}

/* ------------------------------- education ------------------------------- */

function EducationPanel({
  items,
  onChanged,
  onError,
}: {
  items: AdminEducation[];
  onChanged: (message: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<EducationDraft>(EMPTY_EDUCATION);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function startEdit(item: AdminEducation) {
    setDraft({
      degree: item.degree,
      institution: item.institution,
      period: item.period,
      description: item.description ?? "",
      gpa: item.gpa ?? "",
      courses: item.courses,
    });
    setFormError(null);
    setEditing(item.id);
  }

  async function handleReorder(ids: string[]) {
    try {
      await adminApi.reorderEducation(ids);
      await onChanged("Education order saved.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not save the education order.");
    }
  }

  async function handleSave() {
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        degree: draft.degree.trim(),
        institution: draft.institution.trim(),
        period: draft.period.trim(),
        description: draft.description.trim(),
        gpa: draft.gpa.trim(),
        courses: draft.courses,
      };
      if (editing === "new") {
        await adminApi.createEducation(body);
        await onChanged("Education entry created.");
      } else if (editing) {
        await adminApi.updateEducation(editing, body);
        await onChanged("Education entry updated.");
      }
      setEditing(null);
    } catch (caught) {
      setFormError(
        caught instanceof AdminApiError ? caught.message : "Could not save the education entry.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: AdminEducation) {
    if (!window.confirm(`Delete the "${item.degree}" entry?`)) return;
    try {
      await adminApi.deleteEducation(item.id);
      await onChanged("Education entry deleted.");
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Could not delete the education entry.");
    }
  }

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Courses are stored per entry and render in the public section.
        </p>
        <button
          type="button"
          onClick={() => {
            setDraft(EMPTY_EDUCATION);
            setFormError(null);
            setEditing("new");
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add education
        </button>
      </div>

      {editing ? (
        <div className="glass-card mt-4 space-y-4 p-5">
          <h2 className="text-sm font-semibold">
            {editing === "new" ? "New education entry" : "Edit education entry"}
          </h2>

          <Field label="Degree" htmlFor="ed-degree">
            <TextInput
              id="ed-degree"
              value={draft.degree}
              onChange={(degree) => setDraft({ ...draft, degree })}
              disabled={busy}
            />
          </Field>

          <Field label="Institution" htmlFor="ed-inst">
            <TextInput
              id="ed-inst"
              value={draft.institution}
              onChange={(institution) => setDraft({ ...draft, institution })}
              disabled={busy}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Period" htmlFor="ed-period">
              <TextInput
                id="ed-period"
                value={draft.period}
                onChange={(period) => setDraft({ ...draft, period })}
                disabled={busy}
              />
            </Field>
            <Field label="GPA" htmlFor="ed-gpa" hint="Optional.">
              <TextInput
                id="ed-gpa"
                value={draft.gpa}
                onChange={(gpa) => setDraft({ ...draft, gpa })}
                disabled={busy}
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="ed-desc" hint="Optional.">
            <TextArea
              id="ed-desc"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              disabled={busy}
            />
          </Field>

          <ListField
            label="Courses"
            value={draft.courses}
            onChange={(courses) => setDraft({ ...draft, courses })}
            placeholder="Data Structures, Operating Systems"
            hint="Comma separated, max 30."
          />

          <ErrorNote>{formError}</ErrorNote>

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

      {items.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No education entries yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={items}
            onReorder={(ids) => void handleReorder(ids)}
            renderItem={(item, handle) => (
              <div className="glass-card p-4">
                <div className="flex items-center gap-3">
                  {handle}
                  <GraduationCap className="h-4 w-4 shrink-0 text-accent-gold" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.degree}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {item.institution} · {item.period}
                      {item.gpa ? ` · GPA ${item.gpa}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.degree}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item)}
                    aria-label={`Delete ${item.degree}`}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                {item.courses.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.courses.map((course) => (
                      <span
                        key={course}
                        className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {course}
                      </span>
                    ))}
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

/* ----------------------------- future goals ------------------------------ */

function GoalsPanel({
  goals,
  onChanged,
}: {
  goals: AdminFutureGoals | null;
  onChanged: (message: string) => Promise<void>;
}) {
  const [title, setTitle] = useState(goals?.title ?? "");
  const [description, setDescription] = useState(goals?.description ?? "");
  const [items, setItems] = useState<string[]>(goals?.items ?? []);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setFormError(null);
    try {
      await adminApi.updateFutureGoals({
        title: title.trim(),
        description: description.trim(),
        items,
      });
      await onChanged("Future goals saved.");
    } catch (caught) {
      setFormError(caught instanceof AdminApiError ? caught.message : "Could not save future goals.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass-card mt-6 space-y-4 p-5">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-accent-gold" aria-hidden />
        <h2 className="text-sm font-semibold">Future goals</h2>
      </div>

      {goals === null ? (
        <p className="text-xs text-muted-foreground">
          No goals row exists yet. Saving below will create one.
        </p>
      ) : null}

      <Field label="Title" htmlFor="fg-title">
        <TextInput id="fg-title" value={title} onChange={setTitle} disabled={busy} />
      </Field>

      <Field label="Description" htmlFor="fg-desc">
        <TextArea
          id="fg-desc"
          value={description}
          onChange={setDescription}
          rows={3}
          disabled={busy}
        />
      </Field>

      <ListField
        label="Items"
        value={items}
        onChange={setItems}
        placeholder="Earn a Security certification, Contribute to open source"
        hint="Comma separated, max 12."
      />

      <ErrorNote>{formError}</ErrorNote>

      <button
        type="button"
        onClick={handleSave}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
        {busy ? "Saving…" : "Save future goals"}
      </button>
    </section>
  );
}