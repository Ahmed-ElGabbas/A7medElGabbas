"use client";

import { useEffect, useRef } from "react";

/**
 * Opens a row — or a blank draft — once on mount from a `?id=` / `?new=1`
 * deep link.
 *
 * The dashboard's search results and quick actions link here, so following one
 * lands on the editor for that exact item instead of the top of the section.
 * The ids are read on the server and passed down as plain props (the same shape
 * contact/page.tsx uses for `?submission=`), which keeps this free of
 * `useSearchParams` and its client-rendering bailout.
 *
 * Fires at most once per mount: `items` is a dependency so the lookup still
 * happens if the list arrives late, but the ref guard stops a later refetch from
 * reopening a form the admin has already closed.
 */
export function useOpenDeepLink<T extends { id: string }>({
  items,
  targetId,
  openNew,
  startEdit,
  startCreate,
  onUnresolved,
}: {
  items: readonly T[];
  /** Row id from `?id=`. */
  targetId: string | null;
  /** True when `?new=1` asked for a blank draft. */
  openNew: boolean;
  startEdit: (item: T) => void;
  startCreate: () => void;
  /** Called when `targetId` is set but matches nothing in the list. */
  onUnresolved?: () => void;
}): void {
  const handledRef = useRef(false);
  const callbacksRef = useRef({ startEdit, startCreate, onUnresolved });

  /// Kept fresh in an effect rather than during render: `startEdit`/`startCreate`
  /// are recreated on every render of the host component, and the ref is read
  /// inside the effect below. Effects run in declaration order, so this one has
  /// already updated the ref by the time the deep-link effect runs.
  useEffect(() => {
    callbacksRef.current = { startEdit, startCreate, onUnresolved };
  });

  useEffect(() => {
    if (handledRef.current) return;

    if (openNew) {
      handledRef.current = true;
      callbacksRef.current.startCreate();
      return;
    }

    if (!targetId) return;

    const match = items.find((item) => item.id === targetId);

    if (!match) {
      // The list may still be loading on a later render; only give up once it
      // has actually arrived.
      if (items.length > 0) {
        handledRef.current = true;
        callbacksRef.current.onUnresolved?.();
      }
      return;
    }

    handledRef.current = true;
    callbacksRef.current.startEdit(match);
  }, [items, targetId, openNew]);
}

/** Reads the two params the dashboard links with, out of a page's searchParams. */
export function readDeepLinkParams(params: {
  id?: string | string[];
  new?: string | string[];
}): { targetId: string | null; openNew: boolean } {
  const first = (value: string | string[] | undefined): string =>
    (Array.isArray(value) ? value[0] : value)?.trim() ?? "";

  return {
    targetId: first(params.id) || null,
    openNew: first(params.new) === "1",
  };
}