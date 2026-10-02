"use client";

/**
 * Small form primitives shared by the projects/certificates/media managers.
 *
 * Deliberately hand-rolled rather than pulled from the shadcn set: the admin
 * wants a roomier density than the public site's h-8 controls, and keeping the
 * classes here means one place to restyle every field later.
 */

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30 disabled:opacity-60";

export const labelClass =
  "block text-xs uppercase tracking-wider text-muted-foreground";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function TextInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass}
    />
  );
}

export function TextArea({
  id,
  value,
  onChange,
  rows = 4,
  placeholder,
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <textarea
      id={id}
      value={value}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y`}
    />
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[var(--color-accent-gold)]"
      />
      <span>{label}</span>
    </label>
  );
}

/**
 * Comma-separated list editor for text[] columns (technologies, skills).
 * Keeping it a plain string in local state avoids re-rendering a chip editor on
 * every keystroke; the split happens on save.
 */
export function ListField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        value={value.join(", ")}
        placeholder={placeholder}
        onChange={(next) =>
          onChange(
            next
              .split(",")
              .map((part) => part.trim())
              .filter(Boolean),
          )
        }
      />
    </Field>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
    >
      {children}
    </p>
  );
}

export function SuccessNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      {children}
    </p>
  );
}