"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

/**
 * Generic drag-to-reorder list (BACKEND_PLAN.md §5).
 *
 * Optimistic: the parent reorders locally the moment a row is dropped, then
 * PATCHes the new id array to the matching reorder endpoint. If the call
 * fails the parent is expected to refetch so the UI snaps back to the server's
 * ordering rather than keeping a lie on screen.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  disabled = false,
}: {
  items: T[];
  onReorder: (ids: string[]) => void;
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
  disabled?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    // A small activation distance keeps a click on a row's own buttons from
    // being swallowed as the start of a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorder(arrayMove(items, oldIndex, newIndex).map((item) => item.id));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(String(event.active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {items.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              // Freezing the row being dragged avoids its own transform
              // fighting the list's animation.
              disabled={disabled || activeId === item.id}
              renderItem={renderItem}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

/**
 * One useSortable call per row, so the drag handle it renders carries the very
 * same listeners/attributes as that row's node ref. Passing a handle down from
 * the parent would mean the listeners came from a different hook invocation.
 */
function SortableRow<T extends { id: string }>({
  item,
  disabled,
  renderItem,
}: {
  item: T;
  disabled: boolean;
  renderItem: (item: T, handle: React.ReactNode) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled,
  });

  const handle = (
    <button
      type="button"
      aria-label={`Reorder ${item.id}`}
      className="cursor-grab touch-none rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-70" : undefined}
    >
      {renderItem(item, handle)}
    </li>
  );
}