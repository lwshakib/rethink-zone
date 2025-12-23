"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type KanbanColumn = {
  title: string;
  items: string[];
};

type KanbanItem = {
  id: string;
  text: string;
  description: string;
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
  description: string;
  status: string;
  priority: string;
  eta: string;
} | null;

type NewItemModalState = {
  colIdx: number;
  text: string;
  description: string;
  status: string;
  priority: string;
  eta: string;
} | null;

const newItemLabel = "New item";
const statusOptions = ["Ready", "In Progress", "Review", "Blocked"];
const priorityOptions = ["Low", "Medium", "High"];
const etaOptions = ["Today", "Tomorrow", "Next week"];

type KanbanAreaProps = {
  board?: Array<KanbanColumn | KanbanState>;
  onChange?: (board: KanbanState[]) => void;
};

const defaultBoard: KanbanColumn[] = [
  { title: "To Do", items: ["Implement auth", "Design UI"] },
  { title: "In Progress", items: ["Kanban board"] },
  { title: "Done", items: ["Initial setup"] },
];

export default function KanbanArea({
  board = defaultBoard,
  onChange,
}: KanbanAreaProps) {
  const initialState = useMemo<KanbanState[]>(
    () =>
      board.map((col, colIdx) => ({
        title: col.title,
        items: (col.items || []).map((item: any, itemIdx: number) => {
          const text =
            typeof item === "string"
              ? item
              : typeof item?.text === "string"
              ? item.text
              : "Item";
          return {
            id:
              typeof item?.id === "string"
                ? item.id
                : `${colIdx}-${itemIdx}-${text}`,
            text,
            description:
              typeof item?.description === "string" ? item.description : "",
            status:
              typeof item?.status === "string"
                ? item.status
                : statusOptions[(colIdx + itemIdx) % statusOptions.length],
            priority:
              typeof item?.priority === "string"
                ? item.priority
                : priorityOptions[(colIdx + itemIdx) % priorityOptions.length],
            eta:
              typeof item?.eta === "string"
                ? item.eta
                : etaOptions[itemIdx % etaOptions.length],
          };
        }),
      })),
    [board]
  );

  const [columns, setColumns] = useState<KanbanState[]>(initialState);
  const updateColumns = (updater: (prev: KanbanState[]) => KanbanState[]) => {
    setColumns((prev) => {
      const next = updater(prev);
      onChange?.(next);
      return next;
    });
  };
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<number | null>(null);
  const [editingModal, setEditingModal] = useState<EditingState>(null);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newItemModal, setNewItemModal] = useState<NewItemModalState>(null);

  const moveItem = (
    fromCol: number,
    itemId: string,
    toCol: number,
    beforeItemId?: string
  ) => {
    updateColumns((prev) => {
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

  const openNewItemModal = (colIdx: number) => {
    setNewItemModal({
      colIdx,
      text: "",
      description: "",
      status: statusOptions[0],
      priority: priorityOptions[0],
      eta: etaOptions[0],
    });
  };

  const startEditing = (colIdx: number, item: KanbanItem) => {
    setEditingModal({
      colIdx,
      itemId: item.id,
      value: item.text,
      description: item.description,
      status: item.status,
      priority: item.priority,
      eta: item.eta,
    });
  };

  const commitEdit = () => {
    if (!editingModal) return;
    updateColumns((prev) => {
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
        description: editingModal.description,
        status: editingModal.status,
        priority: editingModal.priority,
        eta: editingModal.eta,
      };
      return next;
    });
    setEditingModal(null);
  };

  const cancelEdit = () => setEditingModal(null);

  const createItem = () => {
    if (!newItemModal) return;
    updateColumns((prev) => {
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));
      const column = next[newItemModal.colIdx];
      if (!column) return prev;
      const nextIdx = column.items.length;
      column.items.push({
        id: `${newItemModal.colIdx}-${nextIdx}-${Date.now()}`,
        text: newItemModal.text.trim() || newItemLabel,
        description: newItemModal.description,
        status: newItemModal.status,
        priority: newItemModal.priority,
        eta: newItemModal.eta,
      });
      return next;
    });
    setNewItemModal(null);
  };

  const cancelNewItem = () => setNewItemModal(null);

  const isDraggingItem = (itemId: string) => dragging?.itemId === itemId;

  const createBoard = () => {
    const title = newBoardName.trim() || `Board ${columns.length + 1}`;
    updateColumns((prev) => [...prev, { title, items: [] }]);
    setNewBoardName("");
    setCreateBoardOpen(false);
  };

  const deleteBoard = (colIdx: number) => {
    updateColumns((prev) => prev.filter((_, idx) => idx !== colIdx));
    setEditingModal((prev) => {
      if (!prev) return prev;
      return prev.colIdx >= colIdx ? null : prev;
    });
    setNewItemModal((prev) => {
      if (!prev) return prev;
      return prev.colIdx >= colIdx ? null : prev;
    });
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-hidden bg-black/50 backdrop-blur-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Project Board
          </h2>
          <p className="text-sm text-white/50">
            Manage your tasks and workflow
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateBoardOpen(true)}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          New Column
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max pr-6">
          {columns.map((column, colIdx) => (
            <div
              key={`${column.title}-${colIdx}`}
              onDragOver={onDragOver(colIdx)}
              onDrop={onDropColumn(colIdx)}
              className={`flex flex-col w-80 rounded-2xl border transition-all duration-300 ${
                activeDropCol === colIdx
                  ? "border-white/40 bg-white/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-medium text-white/40">
                    {column.items.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteBoard(colIdx)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/90 hover:bg-white/5 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-25">
                {column.items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative rounded-xl border border-white/10 bg-[#0f0f16]/80 p-4 transition-all hover:border-white/20 hover:bg-[#15151e] cursor-grab active:cursor-grabbing ${
                      isDraggingItem(item.id) ? "opacity-40 scale-95" : ""
                    }`}
                    draggable
                    onDragStart={onDragStart(colIdx, item.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={onDropItem(colIdx, item.id)}
                    onClick={() => startEditing(colIdx, item)}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-sm text-white leading-tight">
                          {item.text}
                        </span>
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${
                            item.priority === "High"
                              ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                              : item.priority === "Medium"
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                              : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          }`}
                        />
                      </div>

                      {item.description && (
                        <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-white/60">
                          {item.status}
                        </span>
                        <span className="rounded-lg bg-white/5 px-2 py-1 text-[10px] font-medium text-white/60">
                          {item.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => openNewItemModal(colIdx)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-xs font-semibold text-white/30 hover:border-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  Add Task
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
        <DialogContent className="bg-[#0b0b11] border-white/10 text-white max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-white/40"
                htmlFor="board-title"
              >
                Column Name
              </label>
              <input
                id="board-title"
                autoFocus
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") createBoard();
                  if (e.key === "Escape") setCreateBoardOpen(false);
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-white outline-none transition-all focus:border-white/30"
                placeholder="e.g. Backlog"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-between">
            <button
              type="button"
              onClick={() => setCreateBoardOpen(false)}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createBoard}
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!newItemModal}
        onOpenChange={(open) => !open && cancelNewItem()}
      >
        <DialogContent className="bg-[#0b0b11] border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-white/40"
                htmlFor="new-item-title"
              >
                Title
              </label>
              <input
                id="new-item-title"
                autoFocus
                value={newItemModal?.text ?? ""}
                onChange={(e) =>
                  setNewItemModal((prev) =>
                    prev ? { ...prev, text: e.target.value } : prev
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all"
                placeholder="Task title"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-white/40"
                htmlFor="new-item-description"
              >
                Description
              </label>
              <textarea
                id="new-item-description"
                value={newItemModal?.description ?? ""}
                onChange={(e) =>
                  setNewItemModal((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all resize-none"
                placeholder="What needs to be done?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Status
                </label>
                <Select
                  value={newItemModal?.status ?? statusOptions[0]}
                  onValueChange={(val) =>
                    setNewItemModal((prev) =>
                      prev ? { ...prev, status: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {statusOptions.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Priority
                </label>
                <Select
                  value={newItemModal?.priority ?? priorityOptions[0]}
                  onValueChange={(val) =>
                    setNewItemModal((prev) =>
                      prev ? { ...prev, priority: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {priorityOptions.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  ETA
                </label>
                <Select
                  value={newItemModal?.eta ?? etaOptions[0]}
                  onValueChange={(val) =>
                    setNewItemModal((prev) =>
                      prev ? { ...prev, eta: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {etaOptions.map((eOpt) => (
                      <SelectItem
                        key={eOpt}
                        value={eOpt}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {eOpt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button
              type="button"
              onClick={cancelNewItem}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createItem}
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Create Task
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingModal}
        onOpenChange={(open) => !open && cancelEdit()}
      >
        <DialogContent className="bg-[#0b0b11] border-white/10 text-white max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-white/40"
                htmlFor="edit-title"
              >
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
                className="w-full rounded-xl border border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all"
                placeholder="Update task title"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-wider text-white/40"
                htmlFor="edit-description"
              >
                Description
              </label>
              <textarea
                id="edit-description"
                value={editingModal?.description ?? ""}
                onChange={(e) =>
                  setEditingModal((prev) =>
                    prev ? { ...prev, description: e.target.value } : prev
                  )
                }
                className="w-full rounded-xl border border-white/10 bg-[#0f0f16] px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all resize-none"
                placeholder="Add more details"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Status
                </label>
                <Select
                  value={editingModal?.status ?? statusOptions[0]}
                  onValueChange={(val) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, status: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {statusOptions.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  Priority
                </label>
                <Select
                  value={editingModal?.priority ?? priorityOptions[0]}
                  onValueChange={(val) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, priority: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {priorityOptions.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                  ETA
                </label>
                <Select
                  value={editingModal?.eta ?? etaOptions[0]}
                  onValueChange={(val) =>
                    setEditingModal((prev) =>
                      prev ? { ...prev, eta: val } : prev
                    )
                  }
                >
                  <SelectTrigger className="w-full rounded-xl border-white/10 bg-[#0f0f16] text-sm text-white focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f16] border-white/10 text-white rounded-xl">
                    {etaOptions.map((eOpt) => (
                      <SelectItem
                        key={eOpt}
                        value={eOpt}
                        className="focus:bg-white/10 focus:text-white rounded-lg"
                      >
                        {eOpt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="flex-1 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
