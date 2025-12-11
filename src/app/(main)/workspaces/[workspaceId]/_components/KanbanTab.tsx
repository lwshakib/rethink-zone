"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type KanbanColumn = {
  title: string;
  items: string[];
};

type KanbanItem = {
  id: string;
  text: string;
  status: string;
  priority: string;
  eta: string;
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
  status: string;
  priority: string;
  eta: string;
} | null;

const newItemLabel = "New item";
const statusOptions = ["Ready", "In Progress", "Review", "Blocked"];
const priorityOptions = ["Low", "Medium", "High"];
const etaOptions = ["Today", "Tomorrow", "Next week"];

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
          status: statusOptions[(colIdx + itemIdx) % statusOptions.length],
          priority: priorityOptions[(colIdx + itemIdx) % priorityOptions.length],
          eta: etaOptions[itemIdx % etaOptions.length],
        })),
      })),
    [board]
  );

  const [columns, setColumns] = useState<KanbanState[]>(initialState);
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<number | null>(null);
  const [editing, setEditing] = useState<EditingState>(null);
  const [editingModal, setEditingModal] = useState<EditingState>(null);
  const [newBoardTitle, setNewBoardTitle] = useState("");

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

  const onDragStart =
    (fromCol: number, itemId: string) => (event: React.DragEvent) => {
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

  const onDropItem =
    (toCol: number, beforeItemId: string) => (event: React.DragEvent) => {
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
        status: statusOptions[0],
        priority: priorityOptions[0],
        eta: etaOptions[0],
      });
      return next;
    });
  };

  const startEditing = (colIdx: number, item: KanbanItem) => {
    setEditingModal({
      colIdx,
      itemId: item.id,
      value: item.text,
      status: item.status,
      priority: item.priority,
      eta: item.eta,
    });
  };

  const commitEdit = () => {
    if (!editingModal) return;
    setColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));
      const column = next[editingModal.colIdx];
      if (!column) return prev;
      const idx = column.items.findIndex((it) => it.id === editingModal.itemId);
      if (idx === -1) return prev;
      column.items[idx] = {
        ...column.items[idx],
        text: editingModal.value || newItemLabel,
        status: editingModal.status,
        priority: editingModal.priority,
        eta: editingModal.eta,
      };
      return next;
    });
    setEditingModal(null);
  };

  const cancelEdit = () => setEditingModal(null);

  const isDraggingItem = (itemId: string) => dragging?.itemId === itemId;

  const createBoard = () => {
    const title = newBoardTitle.trim() || `Board ${columns.length + 1}`;
    setColumns((prev) => [...prev, { title, items: [] }]);
    setNewBoardTitle("");
  };

  const deleteBoard = (colIdx: number) => {
    setColumns((prev) => prev.filter((_, idx) => idx !== colIdx));
    setEditing((prev) => {
      if (!prev) return prev;
      return prev.colIdx >= colIdx ? null : prev;
    });
  };

  return (
    <div className="m-4 mt-8 h-full min-h-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") createBoard();
          }}
          placeholder="New board title"
          className="w-full rounded-lg border border-white/10 bg-[#0b0b11] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
        />
        <button
          type="button"
          onClick={createBoard}
          className="whitespace-nowrap rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-white/90"
        >
          Create board
        </button>
      </div>
      <div className="mt-4 overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-full pr-2">
          {columns.map((column, colIdx) => (
            <div
              key={`${column.title}-${colIdx}`}
              onDragOver={onDragOver(colIdx)}
              onDrop={onDropColumn(colIdx)}
              className={`min-w-60 max-w-[280px] shrink-0 rounded-xl border border-white/5 bg-white/5/10 p-3 backdrop-blur-sm ${
                activeDropCol === colIdx
                  ? "border-white/30 bg-white/10"
                  : "bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <div className="text-sm font-semibold">{column.title}</div>
                  <div className="text-[10px] text-white/50">
                    {column.items.length} items
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => deleteBoard(colIdx)}
                  className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-medium text-white/70 transition hover:border-white/30 hover:text-white/90"
                >
                  Delete
                </button>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-white/80 min-h-12">
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
                  onClick={() => startEditing(colIdx, item)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-2">
                        <span className="block font-medium text-white">
                          {item.text}
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
                          <span className="rounded-full bg-white/5 px-2 py-1">
                            Status: {item.status}
                          </span>
                          <span className="rounded-full bg-amber-500/15 px-2 py-1 text-amber-100">
                            Priority: {item.priority}
                          </span>
                          <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-100">
                            ETA: {item.eta}
                          </span>
                        </div>
                      </div>
                      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400/70 opacity-0 group-hover:opacity-100" />
                    </div>
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
      <Dialog
        open={!!editingModal}
        onOpenChange={(open) => !open && cancelEdit()}
      >
        <DialogContent className="bg-[#0b0b11] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <label className="text-xs text-white/60" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              autoFocus
              value={editingModal?.value ?? ""}
              onChange={(e) =>
                setEditingModal((prev) =>
                  prev ? { ...prev, value: e.target.value } : prev
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") commitEdit();
                if (e.key === "Escape") cancelEdit();
              }}
              className="w-full rounded-lg border border-white/10 bg-[#0f0f16] px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
              placeholder="Update item title"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-white/60" htmlFor="edit-status">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={editingModal?.status ?? statusOptions[0]}
                  onChange={(e) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, status: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f16] px-2 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/60" htmlFor="edit-priority">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  value={editingModal?.priority ?? priorityOptions[0]}
                  onChange={(e) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, priority: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f16] px-2 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  {priorityOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/60" htmlFor="edit-eta">
                  ETA
                </label>
                <select
                  id="edit-eta"
                  value={editingModal?.eta ?? etaOptions[0]}
                  onChange={(e) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, eta: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0f0f16] px-2 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                >
                  {etaOptions.map((eOpt) => (
                    <option key={eOpt} value={eOpt}>
                      {eOpt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/70 hover:border-white/30 hover:text-white/90"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90"
            >
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
