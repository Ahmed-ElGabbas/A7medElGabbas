"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminCertificate,
  type CategoryOption,
} from "@/lib/admin-api";
import {
  CheckboxField,
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextArea,
  TextInput,
  inputClass,
} from "@/components/admin/field";
import { MediaField } from "@/components/admin/media-field";
import { SortableList } from "@/components/admin/sortable-list";

interface CertificateDraft {
  title: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
  credentialUrl: string;
  category: string;
  skills: string[];
  badgeText: string;
  description: string;
  featured: boolean;
  previewImageUrl: string;
  fileUrl: string;
}

const EMPTY: CertificateDraft = {
  title: "",
  issuer: "",
  issueDate: "",
  credentialId: "",
  credentialUrl: "",
  category: "",
  skills: [],
  badgeText: "",
  description: "",
  featured: false,
  previewImageUrl: "",
  fileUrl: "",
};

function toDraft(certificate: AdminCertificate): CertificateDraft {
  return {
    title: certificate.title,
    issuer: certificate.issuer,
    issueDate: certificate.issueDate,
    credentialId: certificate.credentialId,
    credentialUrl: certificate.credentialUrl ?? "",
    category: certificate.category,
    skills: certificate.skills,
    badgeText: certificate.badgeText,
    description: certificate.description,
    featured: certificate.featured,
    previewImageUrl: certificate.previewImageUrl ?? "",
    fileUrl: certificate.fileUrl ?? "",
  };
}

function toPayload(draft: CertificateDraft) {
  return {
    title: draft.title.trim(),
    issuer: draft.issuer.trim(),
    issueDate: draft.issueDate.trim(),
    credentialId: draft.credentialId.trim(),
    credentialUrl: draft.credentialUrl.trim() || null,
    category: draft.category,
    skills: draft.skills,
    badgeText: draft.badgeText.trim(),
    description: draft.description.trim(),
    featured: draft.featured,
    previewImageUrl: draft.previewImageUrl.trim() || null,
    fileUrl: draft.fileUrl.trim() || null,
  };
}

export default function AdminCertificatesClient({
  initialItems,
  initialCategories,
}: {
  initialItems: AdminCertificate[] | null;
  initialCategories: CategoryOption[] | null;
}) {
  const [items, setItems] = useState<AdminCertificate[]>(initialItems ?? []);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(
    initialCategories ?? [],
  );
  const [loadError, setLoadError] = useState<string | null>(
    initialItems === null ? "Could not load certificates from the API." : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<CertificateDraft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /** Refetch after a mutation. Never called on mount — the page server-fetches. */
  async function load() {
    try {
      const [certs, cats] = await Promise.all([
        adminApi.listCertificates(),
        adminApi.certificateCategories(),
      ]);
      setItems(certs.items);
      setCategoryOptions(cats.categories);
      setLoadError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load certificates.");
    }
  }

  async function handleReorder(ids: string[]) {
    const previous = items;
    setItems((current) =>
      ids.map((id) => current.find((c) => c.id === id)!).filter(Boolean),
    );
    try {
      const res = await adminApi.reorderCertificates(ids);
      setItems(res.items);
      setNotice("Order saved.");
    } catch (caught) {
      setItems(previous);
      setError(caught instanceof Error ? caught.message : "Could not save the new order.");
    }
  }

  function startCreate() {
    setDraft({ ...EMPTY, category: categoryOptions[0]?.value ?? "" });
    setFormError(null);
    setEditing("new");
  }

  function startEdit(certificate: AdminCertificate) {
    setDraft(toDraft(certificate));
    setFormError(null);
    setEditing(certificate.id);
  }

  async function handleSave() {
    setSaving(true);
    setFormError(null);
    try {
      if (editing === "new") {
        await adminApi.createCertificate(toPayload(draft));
        setNotice("Certificate created.");
      } else if (editing) {
        await adminApi.updateCertificate(editing, toPayload(draft));
        setNotice("Certificate updated.");
      }
      setEditing(null);
      await load();
    } catch (caught) {
      setFormError(
        caught instanceof AdminApiError ? caught.message : "Could not save the certificate.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(certificate: AdminCertificate) {
    if (!window.confirm(`Delete "${certificate.title}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await adminApi.deleteCertificate(certificate.id);
      if (editing === certificate.id) setEditing(null);
      setNotice("Certificate deleted.");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the certificate.");
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
            <span className="gold-text">{"//"}</span> certificates
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
          Add certificate
        </button>
      </div>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {editing ? (
        <section className="glass-card mb-6 space-y-4 p-5">
          <h2 className="text-sm font-semibold">
            {editing === "new" ? "New certificate" : "Edit certificate"}
          </h2>

          <Field label="Title" htmlFor="c-title">
            <TextInput
              id="c-title"
              value={draft.title}
              onChange={(title) => setDraft({ ...draft, title })}
              disabled={saving}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Issuer" htmlFor="c-issuer">
              <TextInput
                id="c-issuer"
                value={draft.issuer}
                onChange={(issuer) => setDraft({ ...draft, issuer })}
                disabled={saving}
              />
            </Field>

            <Field
              label="Issue date"
              htmlFor="c-date"
              hint="Free text — existing values mix formats."
            >
              <TextInput
                id="c-date"
                value={draft.issueDate}
                onChange={(issueDate) => setDraft({ ...draft, issueDate })}
                placeholder="2024"
                disabled={saving}
              />
            </Field>

            <Field label="Credential ID" htmlFor="c-cred">
              <TextInput
                id="c-cred"
                value={draft.credentialId}
                onChange={(credentialId) => setDraft({ ...draft, credentialId })}
                disabled={saving}
              />
            </Field>

            <Field
              label="Category"
              htmlFor="c-cat"
              hint="Fixed set — the public filter tabs are built from this enum."
            >
              <select
                id="c-cat"
                value={draft.category}
                disabled={saving}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className={inputClass}
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Credential URL" htmlFor="c-credurl">
            <TextInput
              id="c-credurl"
              type="url"
              value={draft.credentialUrl}
              onChange={(credentialUrl) => setDraft({ ...draft, credentialUrl })}
              placeholder="https://credential.netlify.app/…"
              disabled={saving}
            />
          </Field>

          <Field label="Badge text" htmlFor="c-badge">
            <TextInput
              id="c-badge"
              value={draft.badgeText}
              onChange={(badgeText) => setDraft({ ...draft, badgeText })}
              disabled={saving}
            />
          </Field>

          <Field label="Description" htmlFor="c-desc">
            <TextArea
              id="c-desc"
              value={draft.description}
              onChange={(description) => setDraft({ ...draft, description })}
              disabled={saving}
            />
          </Field>

          <ListField
            label="Skills"
            value={draft.skills}
            onChange={(skills) => setDraft({ ...draft, skills })}
            placeholder="Dart, Firebase"
            hint="Comma separated."
          />

          <MediaField
            label="Preview image URL"
            kind="IMAGE"
            value={draft.previewImageUrl}
            onChange={(previewImageUrl) => setDraft({ ...draft, previewImageUrl })}
            hint="Optional."
          />
          <MediaField
            label="Certificate file URL"
            value={draft.fileUrl}
            onChange={(fileUrl) => setDraft({ ...draft, fileUrl })}
            hint="PDF or image. The modal picks its viewer from this extension."
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
          No certificates yet. Add one to get started.
        </p>
      ) : (
        <SortableList
          items={items}
          onReorder={(ids) => void handleReorder(ids)}
          renderItem={(certificate, handle) => (
            <div className="glass-card flex items-center gap-3 p-4">
              {handle}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">{certificate.title}</span>
                  {certificate.featured ? (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-accent-gold text-accent-gold"
                      aria-label="Featured"
                    />
                  ) : null}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {certificate.categoryLabel} · {certificate.issuer}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(certificate)}
                aria-label={`Edit ${certificate.title}`}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(certificate)}
                aria-label={`Delete ${certificate.title}`}
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