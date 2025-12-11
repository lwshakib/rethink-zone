"use client";

import { useMemo, useState } from "react";

type KanbanColumn = {
  title: string;
  items: string[];
};

type KanbanItem = {
  id: string;
  text: string;
};

type KanbanState = {
  title: string;
  items: KanbanItem[];
};

type DragPayload = {
  fromCol: number;
  itemId: string;
};

type EditingState = {
  colIdx: number;
  itemId: string;
  value: string;
} | null;

const newItemLabel = "New item";

type KanbanTabProps = {
  board: KanbanColumn[];
};

export default function KanbanTab({ board }: KanbanTabProps) {
  const initialState = useMemo<KanbanState[]>(
    () =>
      board.map((col, colIdx) => ({
        title: col.title,
        items: col.items.map((item, itemIdx) => ({
          id: `${colIdx}-${itemIdx}-${item}`,
          text: item,
        })),
      })),
    [board]
  );

  const [columns, setColumns] = useState<KanbanState[]>(initialState);
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<number | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);

  const moveItem = (
    fromCol: number,
    itemId: string,
    toCol: number,
    beforeItemId?: string
  ) => {
    setColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));

      const source = next[fromCol];
      const target = next[toCol];
      if (!source || !target) return prev;

      const sourceIdx = source.items.findIndex((it) => it.id === itemId);
      if (sourceIdx === -1) return prev;

      const [item] = source.items.splice(sourceIdx, 1);
      let insertAt = beforeItemId
        ? target.items.findIndex((it) => it.id === beforeItemId)
        : target.items.length;
      if (insertAt < 0) insertAt = target.items.length;

      target.items.splice(insertAt, 0, item);
      return next;
    });
  };

  const parsePayload = (event: React.DragEvent): DragPayload | null => {
    const payload =
      event.dataTransfer.getData("application/json") ||
      event.dataTransfer.getData("text/plain");
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  };

  const onDragStart = (fromCol: number, itemId: string) => (event: React.DragEvent) => {
    const payload: DragPayload = { fromCol, itemId };
    event.dataTransfer.setData("application/json", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
    setDragging(payload);
  };

  const onDropColumn = (toCol: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const payload = parsePayload(event);
    if (payload) {
      moveItem(payload.fromCol, payload.itemId, toCol);
    }
    setDragging(null);
    setActiveDropCol(null);
  };

  const onDropItem = (toCol: number, beforeItemId: string) => (event: React.DragEvent) => {
    event.preventDefault();
    const payload = parsePayload(event);
    if (payload) {
      moveItem(payload.fromCol, payload.itemId, toCol, beforeItemId);
    }
    setDragging(null);
    setActiveDropCol(null);
  };

  const onDragOver = (colIdx: number) => (event: React.DragEvent) => {
    event.preventDefault();
    setActiveDropCol(colIdx);
  };

  const addItem = (colIdx: number) => {
    setColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));
      const column = next[colIdx];
      if (!column) return prev;
      const nextIdx = column.items.length;
      column.items.push({
        id: `${colIdx}-${nextIdx}-${Date.now()}`,
        text: newItemLabel,
      });
      return next;
    });
  };

  const startEditing = (colIdx: number, itemId: string, value: string) => {
    setEditing({ colIdx, itemId, value });
  };

  const commitEdit = () => {
    if (!editing) return;
    setColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));
      const column = next[editing.colIdx];
      if (!column) return prev;
      const idx = column.items.findIndex((it) => it.id === editing.itemId);
      if (idx === -1) return prev;
      column.items[idx] = { ...column.items[idx], text: editing.value || newItemLabel };
      return next;
    });
    setEditing(null);
  };

  const cancelEdit = () => setEditing(null);

  const isDraggingItem = (itemId: string) => dragging?.itemId === itemId;

  return (
    <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#0b0b11] via-[#0c0c14] to-[#0f0f19] p-5 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-white/60">
          Kanban Board
        </div>
        <div className="text-[11px] text-white/40">Drag to reorder & move</div>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {columns.map((column, colIdx) => (
          <div
            key={column.title}
            onDragOver={onDragOver(colIdx)}
            onDrop={onDropColumn(colIdx)}
            className={`rounded-xl border border-white/5 bg-white/5/10 p-3 backdrop-blur-sm ${
              activeDropCol === colIdx ? "border-white/30 bg-white/10" : "bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">{column.title}</div>
              <div className="text-[10px] text-white/50">
                {column.items.length} items
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/80 min-h-[48px]">
              {column.items.map((item) => (
                <li
                  key={item.id}
                  className={`group rounded-lg border border-white/5 bg-[#0f0f16] px-3 py-2 shadow-sm ${
                    isDraggingItem(item.id)
                      ? "opacity-60 border-dashed border-white/30"
                      : "hover:border-white/15"
                  }`}
                  draggable
                  onDragStart={onDragStart(colIdx, item.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDropItem(colIdx, item.id)}
                  onDoubleClick={() => startEditing(colIdx, item.id, item.text)}
                >
                  {editing &&
                  editing.colIdx === colIdx &&
                  editing.itemId === item.id ? (
                    <input
                      autoFocus
                      value={editing.value}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev ? { ...prev, value: e.target.value } : prev
                        )
                      }
                      onBlur={commitEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="w-full rounded-md bg-transparent text-white outline-none"
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span>{item.text}</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-400/70 opacity-0 group-hover:opacity-100" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => addItem(colIdx)}
              className="mt-3 flex w-full items-center justify-center rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs font-medium text-white/70 hover:border-white/30 hover:text-white/90 transition-colors"
            >
              + Add item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

