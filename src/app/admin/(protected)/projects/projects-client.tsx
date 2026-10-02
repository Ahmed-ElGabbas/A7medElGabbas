"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminProject,
} from "@/lib/admin-api";
import {
  CheckboxField,
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextArea,
  TextInput,
} from "@/components/admin/field";
import { MediaField } from "@/components/admin/media-field";
import { SortableList } from "@/components/admin/sortable-list";

interface ProjectDraft {
  title: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
  imageUrl: string;
  githubUrl: string;
  demoUrl: string;
}

const EMPTY: ProjectDraft = {
  title: "",
  description: "",
  technologies: [],
  category: "",
  featured: false,
  imageUrl: "",
  githubUrl: "",
  demoUrl: "",
};

function toDraft(project: AdminProject): ProjectDraft {
  return {
    title: project.title,
    description: project.description,
    technologies: project.technologies,
    category: project.category,
    featured: project.featured,
    imageUrl: project.imageUrl ?? "",
    githubUrl: project.githubUrl ?? "",
    demoUrl: project.demoUrl ?? "",
  };
}

/** Strips empty strings so PATCH does not null out fields the user left blank. */
function toPayload(draft: ProjectDraft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim(),
    technologies: draft.technologies,
    category: draft.category.trim(),
    featured: draft.featured,
    imageUrl: draft.imageUrl.trim() || null,
    githubUrl: draft.githubUrl.trim() || null,
    demoUrl: draft.demoUrl.trim() || null,
  };
}

export default function AdminProjectsClient({
  initialItems,
  initialCategories,
}: {
  initialItems: AdminProject[] | null;
  initialCategories: string[] | null;
}) {
  const [items, setItems] = useState<AdminProject[]>(initialItems ?? []);
  const [categories, setCategories] = useState<string[]>(initialCategories ?? []);
  // A null initial payload means the server-side fetch failed; show that rather
  // than an empty list that looks like "no projects yet".
  const [loadError, setLoadError] = useState<string | null>(
    initialItems === null ? "Could not load projects from the API." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // null = list view; "new" = blank draft; an id = editing that project.
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /** Refetch after a mutation. Never called on mount — see the page's server fetch. */
  async function load() {
    try {
      const [projects, cats] = await Promise.all([
        adminApi.listProjects(),
        adminApi.projectCategories(),
      ]);
      setItems(projects.items);
      setCategories(cats.categories);
      setLoadError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load projects.");
    }
  }

  async function handleReorder(ids: string[]) {
    const previous = items;
    // Optimistic: reflect the drop immediately, then confirm with the server.
    setItems((current) => ids.map((id) => current.find((p) => p.id === id)!).filter(Boolean));
    try {
      const res = await adminApi.reorderProjects(ids);
      setItems(res.items);
      setNotice("Order saved.");
    } catch (caught) {
      setItems(previous);
      setError(caught instanceof Error ? caught.message : "Could not save the new order.");
    }
  }

  function startCreate() {
    setDraft(EMPTY);
    setFormError(null);
    setEditing("new");
  }

  function startEdit(project: AdminProject) {
    setDraft(toDraft(project));
    setFormError(null);
    setEditing(project.id);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing === "new") {
        await adminApi.createProject(toPayload(draft));
        setNotice("Project created.");
      } else if (editing) {
        await adminApi.updateProject(editing, toPayload(draft));
        setNotice("Project updated.");
      }
      setEditing(null);
      await load();
    } catch (caught) {
      setFormError(
        caught instanceof AdminApiError ? caught.message : "Could not save the project.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: AdminProject) {
    if (!window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await adminApi.deleteProject(project.id);
      if (editing === project.id) setEditing(null);
      setNotice("Project deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the project.");
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

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            <span className="gold-text">{"//"}</span> projects
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Drag the handle to reorder. Changes go live immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add project
        </button>
      </div>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {editing ? (
        <section className="glass-card mb-6 space-y-4 p-5">
          <h2 className="text-sm font-semibold">
            {editing === "new" ? "New project" : "Edit project"}
          </h2>

          <Field label="Title" htmlFor="p-title">
            <TextInput
              id="p-title"
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
              disabled={saving}
            />
          </Field>

          <Field label="Description" htmlFor="p-desc">
            <TextArea
              id="p-desc"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              disabled={saving}
            />
          </Field>

          <Field
            label="Category"
            htmlFor="p-cat"
            hint="Free text. Existing values are offered as suggestions so new ones need no migration."
          >
            <TextInput
              id="p-cat"
              value={draft.category}
              onChange={(category) => setDraft({ ...draft, category })}
              placeholder="e.g. Full-Stack"
              disabled={saving}
            />
          </Field>

          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setDraft({ ...draft, category })}
                  disabled={saving}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[11px] transition-colors hover:border-accent-gold hover:bg-accent/10"
                >
                  {category}
                </button>
              ))}
            </div>
          ) : null}

          <ListField
            label="Technologies"
            value={draft.technologies}
            onChange={(technologies) => setDraft({ ...draft, technologies })}
            placeholder="React, NestJS, PostgreSQL"
            hint="Comma separated."
          />

          <MediaField
            label="Image URL"
            kind="IMAGE"
            value={draft.imageUrl}
            onChange={(imageUrl) => setDraft({ ...draft, imageUrl })}
            hint="Optional. New field — existing seeded projects have none."
          />
          <MediaField
            label="GitHub URL"
            value={draft.githubUrl}
            onChange={(githubUrl) => setDraft({ ...draft, githubUrl })}
            hint="Optional. Must be https."
          />
          <MediaField
            label="Demo URL"
            value={draft.demoUrl}
            onChange={(demoUrl) => setDraft({ ...draft, demoUrl })}
            hint="Optional. Must be https."
          />

          <CheckboxField
            label="Featured"
            checked={draft.featured}
            onChange={(featured) => setDraft({ ...draft, featured })}
          />

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
          No projects yet. Add one to get started.
        </p>
      ) : (
        <SortableList
          items={items}
          onReorder={(ids) => void handleReorder(ids)}
          renderItem={(project, handle) => (
            <div className="glass-card flex items-center gap-3 p-4">
              {handle}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{project.title}</span>
                  {project.featured ? (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-accent-gold text-accent-gold"
                      aria-label="Featured"
                    />
                  ) : null}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {project.category}
                  {project.technologies.length > 0
                    ? ` · ${project.technologies.join(", ")}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(project)}
                aria-label={`Edit ${project.title}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(project)}
                aria-label={`Delete ${project.title}`}
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