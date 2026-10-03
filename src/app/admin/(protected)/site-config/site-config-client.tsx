"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  AdminApiError,
  adminApi,
  type AdminNavItem,
  type AdminSectionMeta,
  type AdminSiteConfig,
  type AdminSocialLinks,
} from "@/lib/admin-api";
import {
  ErrorNote,
  Field,
  ListField,
  SuccessNote,
  TextInput,
} from "@/components/admin/field";
import { SortableList } from "@/components/admin/sortable-list";

type Tab = "identity" | "links" | "nav" | "headings";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "identity", label: "Identity" },
  { id: "links", label: "Social links" },
  { id: "nav", label: "Navigation" },
  { id: "headings", label: "Section headings" },
];

/**
 * Headings are edited as a fixed set rather than added/removed: the six section
 * components each read a known key, so a new key would have no renderer. The
 * key is shown read-only to make that constraint obvious.
 */
const HEADING_KEYS = ["about", "skills", "experience", "projects", "certificates", "contact"] as const;

const tabClass = (active: boolean) =>
  `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "border border-border text-muted-foreground hover:text-foreground"
  }`;

export default function SiteConfigClient({
  initialConfig,
  initialLinks,
  initialNav,
  initialHeadings,
  initialTab,
}: {
  initialConfig: AdminSiteConfig | null;
  initialLinks: AdminSocialLinks | null;
  initialNav: AdminNavItem[] | null;
  initialHeadings: AdminSectionMeta[] | null;
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? "identity");

  const [config, setConfig] = useState<AdminSiteConfig | null>(initialConfig);
  const [links, setLinks] = useState<AdminSocialLinks | null>(initialLinks);
  const [nav, setNav] = useState<AdminNavItem[]>(initialNav ?? []);
  const [headings, setHeadings] = useState<AdminSectionMeta[]>(initialHeadings ?? []);

  // A null initial payload means the server fetch failed; show that rather than
  // blank forms that look like "no config yet". Each panel also tolerates a
  // missing row, because the API upserts on first write.
  const [loadError] = useState<string | null>(
    initialConfig === null && initialLinks === null
      ? "Could not load site config from the API."
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Heading drafts are held separately so switching tabs never discards a
  // half-typed heading — each heading has its own save button.
  const [headingDrafts, setHeadingDrafts] = useState<Record<string, Partial<AdminSectionMeta>>>({});
  const [savingHeading, setSavingHeading] = useState<string | null>(null);

  // Nav editing
  const [navEditing, setNavEditing] = useState<string | "new" | null>(null);
  const [navDraft, setNavDraft] = useState({ label: "", href: "" });

  function fail(caught: unknown, fallback: string) {
    return caught instanceof AdminApiError ? caught.message : fallback;
  }

  async function handleConfigSave() {
    if (!config) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await adminApi.updateSiteConfig({
        name: config.name.trim(),
        firstName: config.firstName?.trim() || null,
        lastName: config.lastName?.trim() || null,
        title: config.title.trim(),
        metaDescription: config.metaDescription.trim(),
        url: config.url?.trim() || null,
        headline: config.headline?.trim() || null,
        photoUrl: config.photoUrl?.trim() || null,
        resumeUrl: config.resumeUrl?.trim() || null,
        location: config.location?.trim() || null,
        status: config.status?.trim() || null,
        statusSubtext: config.statusSubtext?.trim() || null,
        roles: config.roles,
      });
      setConfig(updated);
      setNotice("Site config saved.");
    } catch (caught) {
      setError(fail(caught, "Could not save the site config."));
    } finally {
      setSaving(false);
    }
  }

  async function handleLinksSave() {
    if (!links) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await adminApi.updateSocialLinks({
        email: links.email.trim(),
        phone: links.phone.trim(),
        github: links.github.trim(),
        linkedin: links.linkedin.trim(),
        twitter: links.twitter.trim(),
        facebook: links.facebook.trim(),
      });
      setLinks(updated);
      setNotice("Social links saved.");
    } catch (caught) {
      setError(fail(caught, "Could not save the social links."));
    } finally {
      setSaving(false);
    }
  }

  async function handleHeadingSave(key: string) {
    const draft = headingDrafts[key];
    if (!draft) return;
    setSavingHeading(key);
    setError(null);
    setNotice(null);
    try {
      const updated = await adminApi.updateSectionMeta(key, {
        index: draft.index?.trim() ?? "",
        label: draft.label?.trim() ?? "",
        title: draft.title?.trim() ?? "",
        subtitle: draft.subtitle?.trim() ?? "",
        order: draft.order,
      });
      setHeadings((current) =>
        current.map((row) => (row.key === key ? { ...row, ...updated } : row)),
      );
      // Drop the draft so the row falls back to the stored value.
      setHeadingDrafts((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      setNotice(`Heading "${key}" saved.`);
    } catch (caught) {
      setError(fail(caught, `Could not save the "${key}" heading.`));
    } finally {
      setSavingHeading(null);
    }
  }

  async function handleNavReorder(ids: string[]) {
    const previous = nav;
    setNav((current) => ids.map((id) => current.find((n) => n.id === id)!).filter(Boolean));
    try {
      const res = await adminApi.reorderNavItems(ids);
      setNav(res.items);
      setNotice("Navigation order saved.");
    } catch (caught) {
      setNav(previous);
      setError(fail(caught, "Could not save the navigation order."));
    }
  }

  async function handleNavSave() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (navEditing === "new") {
        await adminApi.createNavItem({
          label: navDraft.label.trim(),
          href: navDraft.href.trim(),
        });
        setNotice("Nav item added.");
      } else if (navEditing) {
        await adminApi.updateNavItem(navEditing, {
          label: navDraft.label.trim(),
          href: navDraft.href.trim(),
        });
        setNotice("Nav item updated.");
      }
      setNavEditing(null);
      setNav((await adminApi.listNavItems()).items);
    } catch (caught) {
      setError(fail(caught, "Could not save the nav item."));
    } finally {
      setSaving(false);
    }
  }

  async function handleNavDelete(item: AdminNavItem) {
    if (!window.confirm(`Remove "${item.label}" from the navigation?`)) return;
    setError(null);
    try {
      await adminApi.deleteNavItem(item.id);
      if (navEditing === item.id) setNavEditing(null);
      setNotice("Nav item removed.");
      setNav((await adminApi.listNavItems()).items);
    } catch (caught) {
      setError(fail(caught, "Could not remove the nav item."));
    }
  }

  function headingValue(row: AdminSectionMeta, field: "index" | "label" | "title" | "subtitle") {
    const draft = headingDrafts[row.key];
    if (draft && field in draft) return (draft[field] as string | null) ?? "";
    return (row[field] as string | null) ?? "";
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
        <span className="gold-text">{"//"}</span> site config
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">
        Identity, social links, navigation, and the six section headings.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)} className={tabClass(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <ErrorNote>{error ?? loadError}</ErrorNote>
      <SuccessNote>{notice}</SuccessNote>

      {/* ----------------------------- identity ----------------------------- */}
      {tab === "identity" ? (
        <section className="glass-card mt-6 space-y-4 p-5">
          {config === null ? (
            <p className="text-sm text-muted-foreground">
              No site config row found. Run the seed script, or save once here to create it.
            </p>
          ) : (
            <>
              <h2 className="text-sm font-semibold">Identity &amp; SEO</h2>

              <Field label="Full name" htmlFor="sc-name" hint="Rendered in the header logo and footer.">
                <TextInput
                  id="sc-name"
                  value={config.name}
                  onChange={(name) => setConfig({ ...config, name })}
                  disabled={saving}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" htmlFor="sc-first" hint="Used in the contact success message.">
                  <TextInput
                    id="sc-first"
                    value={config.firstName ?? ""}
                    onChange={(firstName) => setConfig({ ...config, firstName })}
                    disabled={saving}
                  />
                </Field>
                <Field label="Last name" htmlFor="sc-last">
                  <TextInput
                    id="sc-last"
                    value={config.lastName ?? ""}
                    onChange={(lastName) => setConfig({ ...config, lastName })}
                    disabled={saving}
                  />
                </Field>
              </div>

              <Field label="Title" htmlFor="sc-title" hint="Job title, shown in the hero.">
                <TextInput
                  id="sc-title"
                  value={config.title}
                  onChange={(title) => setConfig({ ...config, title })}
                  disabled={saving}
                />
              </Field>

              <Field label="Headline" htmlFor="sc-headline" hint="Optional one-liner above the title.">
                <TextInput
                  id="sc-headline"
                  value={config.headline ?? ""}
                  onChange={(headline) => setConfig({ ...config, headline })}
                  disabled={saving}
                />
              </Field>

              <ListField
                label="Rotating roles"
                value={config.roles}
                onChange={(roles) => setConfig({ ...config, roles })}
                placeholder="Backend Engineer, Robotics Enthusiast"
                hint="Comma separated. The hero rotates through these."
              />

              <Field label="Meta description" htmlFor="sc-meta" hint="Used for SEO and the OG image.">
                <TextInput
                  id="sc-meta"
                  value={config.metaDescription}
                  onChange={(metaDescription) => setConfig({ ...config, metaDescription })}
                  disabled={saving}
                />
              </Field>

              <Field label="Canonical URL" htmlFor="sc-url" hint="Optional.">
                <TextInput
                  id="sc-url"
                  value={config.url ?? ""}
                  onChange={(url) => setConfig({ ...config, url })}
                  placeholder="https://ahmedelgabbas.dev"
                  disabled={saving}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Photo path" htmlFor="sc-photo" hint="Root-relative or https URL.">
                  <TextInput
                    id="sc-photo"
                    value={config.photoUrl ?? ""}
                    onChange={(photoUrl) => setConfig({ ...config, photoUrl })}
                    placeholder="/images/ahmed.jpg"
                    disabled={saving}
                  />
                </Field>
                <Field label="Resume path" htmlFor="sc-resume" hint="Root-relative or https URL.">
                  <TextInput
                    id="sc-resume"
                    value={config.resumeUrl ?? ""}
                    onChange={(resumeUrl) => setConfig({ ...config, resumeUrl })}
                    placeholder="/assets/resume.pdf"
                    disabled={saving}
                  />
                </Field>
              </div>

              <Field label="Location" htmlFor="sc-loc" hint="Shown on the contact card.">
                <TextInput
                  id="sc-loc"
                  value={config.location ?? ""}
                  onChange={(location) => setConfig({ ...config, location })}
                  disabled={saving}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Availability status" htmlFor="sc-status" hint="Short label, e.g. Available For Hire.">
                  <TextInput
                    id="sc-status"
                    value={config.status ?? ""}
                    onChange={(status) => setConfig({ ...config, status })}
                    disabled={saving}
                  />
                </Field>
                <Field label="Status subtext" htmlFor="sc-subtext" hint="Sentence under the status label.">
                  <TextInput
                    id="sc-subtext"
                    value={config.statusSubtext ?? ""}
                    onChange={(statusSubtext) => setConfig({ ...config, statusSubtext })}
                    disabled={saving}
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={handleConfigSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Save className="h-3.5 w-3.5" aria-hidden />}
                {saving ? "Saving…" : "Save site config"}
              </button>
            </>
          )}
        </section>
      ) : null}

      {/* --------------------------- social links --------------------------- */}
      {tab === "links" ? (
        <section className="glass-card mt-6 space-y-4 p-5">
          <h2 className="text-sm font-semibold">Social links</h2>
          {links === null ? (
            <p className="text-sm text-muted-foreground">No social links row found. Run the seed script.</p>
          ) : (
            <>
              <Field label="Email" htmlFor="sl-email">
                <TextInput
                  id="sl-email"
                  type="email"
                  value={links.email}
                  onChange={(email) => setLinks({ ...links, email })}
                  disabled={saving}
                />
              </Field>
              <Field label="Phone / WhatsApp" htmlFor="sl-phone">
                <TextInput
                  id="sl-phone"
                  value={links.phone}
                  onChange={(phone) => setLinks({ ...links, phone })}
                  disabled={saving}
                />
              </Field>
              <Field label="GitHub" htmlFor="sl-github" hint="Must be https.">
                <TextInput
                  id="sl-github"
                  value={links.github}
                  onChange={(github) => setLinks({ ...links, github })}
                  disabled={saving}
                />
              </Field>
              <Field label="LinkedIn" htmlFor="sl-linkedin" hint="Must be https.">
                <TextInput
                  id="sl-linkedin"
                  value={links.linkedin}
                  onChange={(linkedin) => setLinks({ ...links, linkedin })}
                  disabled={saving}
                />
              </Field>
              <Field label="Twitter / X" htmlFor="sl-twitter" hint="Must be https.">
                <TextInput
                  id="sl-twitter"
                  value={links.twitter}
                  onChange={(twitter) => setLinks({ ...links, twitter })}
                  disabled={saving}
                />
              </Field>
              <Field label="Facebook" htmlFor="sl-facebook" hint="Must be https.">
                <TextInput
                  id="sl-facebook"
                  value={links.facebook}
                  onChange={(facebook) => setLinks({ ...links, facebook })}
                  disabled={saving}
                />
              </Field>

              <button
                type="button"
                onClick={handleLinksSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Save className="h-3.5 w-3.5" aria-hidden />}
                {saving ? "Saving…" : "Save social links"}
              </button>
            </>
          )}
        </section>
      ) : null}

      {/* ---------------------------- navigation ---------------------------- */}
      {tab === "nav" ? (
        <>
          <section className="glass-card mt-6 space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Navigation</h2>
              <button
                type="button"
                onClick={() => {
                  setNavDraft({ label: "", href: "" });
                  setNavEditing("new");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add item
              </button>
            </div>

            {navEditing ? (
              <>
                <Field label="Label" htmlFor="nav-label">
                  <TextInput
                    id="nav-label"
                    value={navDraft.label}
                    onChange={(label) => setNavDraft({ ...navDraft, label })}
                    disabled={saving}
                  />
                </Field>
                <Field label="Href" htmlFor="nav-href" hint="An anchor like #projects.">
                  <TextInput
                    id="nav-href"
                    value={navDraft.href}
                    onChange={(href) => setNavDraft({ ...navDraft, href })}
                    disabled={saving}
                  />
                </Field>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleNavSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : null}
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNavEditing(null)}
                    disabled={saving}
                    className="rounded-lg border border-border px-3 py-2 text-xs transition-colors hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : null}
          </section>

          {nav.length === 0 ? (
            <p className="mt-4 py-8 text-sm text-muted-foreground">No nav items yet.</p>
          ) : (
            <div className="mt-4">
              <SortableList
                items={nav}
                onReorder={(ids) => void handleNavReorder(ids)}
                renderItem={(item, handle) => (
                  <div className="glass-card flex items-center gap-3 p-4">
                    {handle}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.label}</div>
                      <p className="truncate text-[11px] text-muted-foreground">{item.href}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setNavDraft({ label: item.label, href: item.href });
                        setNavEditing(item.id);
                      }}
                      aria-label={`Edit ${item.label}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleNavDelete(item)}
                      aria-label={`Remove ${item.label}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                )}
              />
            </div>
          )}
        </>
      ) : null}

      {/* -------------------------- section headings ------------------------ */}
      {tab === "headings" ? (
        <section className="mt-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            The <code className="text-foreground">index</code> (e.g. <code>01</code>),{" "}
            <code className="text-foreground">label</code> (e.g. <code>PROFILE</code>), title and subtitle
            each section renders. Blank index or label degrades to a plain heading.
          </p>

          {headings.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No section headings seeded. Saving below creates the row on first write.
            </p>
          ) : null}

          {HEADING_KEYS.map((key) => {
            const row = headings.find((h) => h.key === key) ?? null;
            const dirty = key in headingDrafts;
            return (
              <div key={key} className="glass-card space-y-3 p-5">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[11px] text-muted-foreground">{key}</code>
                  {row === null ? <span className="text-[11px] text-muted-foreground">not seeded</span> : null}
                </div>

                <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
                  <Field label="Index" htmlFor={`h-${key}-index`}>
                    <TextInput
                      id={`h-${key}-index`}
                      value={row ? headingValue(row, "index") : ""}
                      onChange={(value) =>
                        setHeadingDrafts((d) => ({ ...d, [key]: { ...d[key], index: value } }))
                      }
                    />
                  </Field>
                  <Field label="Label" htmlFor={`h-${key}-label`}>
                    <TextInput
                      id={`h-${key}-label`}
                      value={row ? headingValue(row, "label") : ""}
                      onChange={(value) =>
                        setHeadingDrafts((d) => ({ ...d, [key]: { ...d[key], label: value } }))
                      }
                    />
                  </Field>
                </div>

                <Field label="Title" htmlFor={`h-${key}-title`}>
                  <TextInput
                    id={`h-${key}-title`}
                    value={row ? headingValue(row, "title") : ""}
                    onChange={(value) =>
                      setHeadingDrafts((d) => ({ ...d, [key]: { ...d[key], title: value } }))
                    }
                  />
                </Field>

                <Field label="Subtitle" htmlFor={`h-${key}-subtitle`}>
                  <TextInput
                    id={`h-${key}-subtitle`}
                    value={row ? headingValue(row, "subtitle") : ""}
                    onChange={(value) =>
                      setHeadingDrafts((d) => ({ ...d, [key]: { ...d[key], subtitle: value } }))
                    }
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => void handleHeadingSave(key)}
                  disabled={!dirty || savingHeading !== null}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {savingHeading === key ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Save className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {savingHeading === key ? "Saving…" : "Save heading"}
                </button>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}