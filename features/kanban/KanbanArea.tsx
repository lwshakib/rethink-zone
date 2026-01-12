"use client"; // Marks this as a client-side React component for Next.js

import { useEffect, useMemo, useState } from "react";
// Importing UI components from the shared UI library
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

/**
 * TYPE DEFINITIONS
 */
type KanbanColumn = {
  title: string;
  items: string[]; // Simple string-based items (fallback/initial format)
};

type KanbanItem = {
  id: string;        // Unique identifier for the task
  text: string;      // Main heading/title of the task
  description: string; // Detailed notes about the task
  status: string;    // Current lifecycle stage (Ready, In Progress, etc)
  priority: string;  // Urgency level (Low, Medium, High)
  eta: string;       // Expected completion time (Today, Morrow, etc)
};

type KanbanState = {
  title: string;       // Name of the column (e.g., "To Do")
  items: KanbanItem[]; // List of structured task objects in this column
};

type DragPayload = {
  fromCol: number; // Index of the column the item is being dragged FROM
  itemId: string;  // ID of the item being dragged
};

// Represents state for the 'Edit' modal
type EditingState = {
  colIdx: number;       // Column index of the item being edited
  itemId: string;      // ID of the item being edited
  value: string;        // Modified title
  description: string;  // Modified description
  status: string;       // Modified status
  priority: string;     // Modified priority
  eta: string;          // Modified ETA
} | null;

// Represents state for the 'New Item' modal
type NewItemModalState = {
  colIdx: number;       // Index of the column where the new item will be added
  text: string;         // New item title
  description: string;  // New item description
  status: string;       // New item status
  priority: string;     // New item priority
  eta: string;          // New item ETA
} | null;

const newItemLabel = "New item"; // Default label for nameless tasks
// Configuration options for dropdown selections
const statusOptions = ["Ready", "In Progress", "Review", "Blocked"];
const priorityOptions = ["Low", "Medium", "High"];
const etaOptions = ["Today", "Tomorrow", "Next week"];

type KanbanAreaProps = {
  board?: Array<KanbanColumn | KanbanState>; // Optional initial board data
  onChange?: (board: KanbanState[]) => void; // Callback fired when items move or change
};

// Seed data used if no 'board' prop is provided
const defaultBoard: KanbanColumn[] = [
  { title: "To Do", items: ["Implement auth", "Design UI"] },
  { title: "In Progress", items: ["Kanban board"] },
  { title: "Done", items: ["Initial setup"] },
];

/**
 * Main KanbanArea Component
 */
export default function KanbanArea({
  board,
  onChange,
}: KanbanAreaProps) {
  const safeBoard = board || defaultBoard; // Fallback to seed data
  
  // Transform the potentially heterogeneous 'board' input into a strictly typed 'KanbanState[]'
  const initialState = useMemo<KanbanState[]>(
    () =>
      safeBoard.map((col, colIdx) => ({
        title: col.title,
        items: (col.items || []).map((item: any, itemIdx: number) => {
          // Normalizes item text regardless of whether input was a string or object
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
                : `${colIdx}-${itemIdx}-${text}`, // Fallback ID generation
            text,
            description:
              typeof item?.description === "string" ? item.description : "",
            status:
              typeof item?.status === "string"
                ? item.status
                : statusOptions[(colIdx + itemIdx) % statusOptions.length], // Default status
            priority:
              typeof item?.priority === "string"
                ? item.priority
                : priorityOptions[(colIdx + itemIdx) % priorityOptions.length], // Default priority
            eta:
              typeof item?.eta === "string"
                ? item.eta
                : etaOptions[itemIdx % etaOptions.length], // Default ETA
          };
        }),
      })),
    [board]
  );

  // Core state for all columns and tasks
  const [columns, setColumns] = useState<KanbanState[]>(initialState);

  // Update internal state if the external 'board' prop changes
  useEffect(() => {
    setColumns(initialState);
  }, [initialState]);

  // Wrapper for updating state that also triggers the 'onChange' callback
  const updateColumns = (updater: (prev: KanbanState[]) => KanbanState[]) => {
    setColumns((prev) => {
      const next = updater(prev);
      onChange?.(next); // Inform parent of the change
      return next;
    });
  };

  /**
   * INTERACTION STATE
   */
  const [dragging, setDragging] = useState<DragPayload | null>(null);   // Information about the currently dragged item
  const [activeDropCol, setActiveDropCol] = useState<number | null>(null); // Highlights the target column during drag
  const [editingModal, setEditingModal] = useState<EditingState>(null);    // Controls the edit task modal
  const [createBoardOpen, setCreateBoardOpen] = useState(false);           // Controls the 'New Column' modal
  const [newBoardName, setNewBoardName] = useState("");                    // Buffer for new column title
  const [newItemModal, setNewItemModal] = useState<NewItemModalState>(null); // Controls the add task modal

  /**
   * DRAG AND DROP LOGIC
   */

  // Logic to move an item within or between columns
  const moveItem = (
    fromCol: number,
    itemId: string,
    toCol: number,
    beforeItemId?: string // Optional target index within the new column
  ) => {
    updateColumns((prev) => {
      // Deep clone only the necessary parts of the state
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));

      const source = next[fromCol];
      const target = next[toCol];
      if (!source || !target) return prev;

      // Find and remove the item from its source column
      const sourceIdx = source.items.findIndex((it) => it.id === itemId);
      if (sourceIdx === -1) return prev;

      const [item] = source.items.splice(sourceIdx, 1);
      
      // Calculate where to insert the item in the target column
      let insertAt = beforeItemId
        ? target.items.findIndex((it) => it.id === beforeItemId)
        : target.items.length;
      if (insertAt < 0) insertAt = target.items.length;

      target.items.splice(insertAt, 0, item); // Insert the item
      return next;
    });
  };

  // Helper to extract drag payload from browser drag events
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

  // Called when a user starts dragging a task card
  const onDragStart =
    (fromCol: number, itemId: string) => (event: React.DragEvent) => {
      const payload: DragPayload = { fromCol, itemId };
      event.dataTransfer.setData("application/json", JSON.stringify(payload)); // Attach payload to event
      event.dataTransfer.effectAllowed = "move";
      setDragging(payload); // Update local visual state
    };

  // Called when an item is dropped onto a column (specifically the empty area)
  const onDropColumn = (toCol: number) => (event: React.DragEvent) => {
    event.preventDefault();
    const payload = parsePayload(event);
    if (payload) {
      moveItem(payload.fromCol, payload.itemId, toCol); // Execute move
    }
    setDragging(null);      // Reset drag state
    setActiveDropCol(null);
  };

  // Called when an item is dropped directly onto another item (reordering)
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

  // Called continuously while dragging over a column to show highlight
  const onDragOver = (colIdx: number) => (event: React.DragEvent) => {
    event.preventDefault(); // Required to allow dropping
    setActiveDropCol(colIdx);
  };

  /**
   * TASK CREATION AND EDITING
   */

  // Opens the modal to create a new task in a specific column
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

  // Opens the modal to edit an existing task card
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

  // Finalizes the editing process and updates the task in the state
  const commitEdit = () => {
    if (!editingModal) return; // Guard clause if no editing session is active
    updateColumns((prev) => {
      // Create a fresh copy of the whole board state
      const next = prev.map((col) => ({
        ...col,
        items: [...col.items],
      }));
      // Locate the target column and item to apply modifications
      const column = next[editingModal.colIdx];
      if (!column) return prev;
      const idx = column.items.findIndex((it) => it.id === editingModal.itemId);
      if (idx === -1) return prev;
      // Update the item properties with the values from the modal state
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
    setEditingModal(null); // Close the modal
  };

  // Discords changes and closes the edit modal
  const cancelEdit = () => setEditingModal(null);

  // Inserts a newly created task into the specified column
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
      // Generate a new task object with a timestamp-based ID
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
    setNewItemModal(null); // Close the modal
  };

  // Closes the new item creation modal without saving
  const cancelNewItem = () => setNewItemModal(null);

  // Utility to check if a specific item is the one currently being dragged
  const isDraggingItem = (itemId: string) => dragging?.itemId === itemId;

  // Adds a completely new (empty) column to the Kanban board
  const createBoard = () => {
    const title = newBoardName.trim() || `Board ${columns.length + 1}`;
    updateColumns((prev) => [...prev, { title, items: [] }]);
    setNewBoardName("");      // Clear the input
    setCreateBoardOpen(false); // Close the dialog
  };

  // Removes a whole column and its contents from the board
  const deleteBoard = (colIdx: number) => {
    updateColumns((prev) => prev.filter((_, idx) => idx !== colIdx));
    // Cleanup any active modals that might be referencing the deleted column
    setEditingModal((prev) => {
      if (!prev) return prev;
      return prev.colIdx >= colIdx ? null : prev;
    });
    setNewItemModal((prev) => {
      if (!prev) return prev;
      return prev.colIdx >= colIdx ? null : prev;
    });
  };

  /**
   * RENDER UI
   */
  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 overflow-hidden bg-background">
      {/* Header section with title and global actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Project Board
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage your tasks and workflow
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateBoardOpen(true)}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          New Column
        </button>
      </div>

      {/* Main Board Area - Scrollable horizontally */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max pr-6">
          {columns.map((column, colIdx) => (
            <div
              key={`${column.title}-${colIdx}`}
              onDragOver={onDragOver(colIdx)}
              onDrop={onDropColumn(colIdx)}
              className={`flex flex-col w-80 rounded-2xl border transition-all duration-300 ${activeDropCol === colIdx
                ? "border-primary/40 bg-accent/10" // Highlight column when dragging over
                : "border-border bg-card/50"
                }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                    {column.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {column.items.length}
                  </span>
                </div>
                {/* Column deletion trigger */}
                <button
                  type="button"
                  onClick={() => deleteBoard(colIdx)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
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

              {/* Task Items List - Scrollable vertically */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-25">
                {column.items.map((item) => (
                  <div
                    key={item.id}
                    className={`group relative rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/20 hover:bg-accent/10 cursor-grab active:cursor-grabbing ${isDraggingItem(item.id) ? "opacity-40 scale-95" : ""
                      }`}
                    draggable
                    onDragStart={onDragStart(colIdx, item.id)}
                    onDragOver={(event) => event.preventDefault()} // Required for drop target
                    onDrop={onDropItem(colIdx, item.id)}            // Enable reordering by dropping on items
                    onClick={() => startEditing(colIdx, item)}      // Open edit modal on click
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-semibold text-sm text-foreground leading-tight">
                          {item.text}
                        </span>
                        {/* Priority indicator dot */}
                        <div
                          className={`h-1.5 w-1.5 rounded-full shrink-0 mt-1 ${item.priority === "High"
                            ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                            : item.priority === "Medium"
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                              : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                            }`}
                        />
                      </div>

                      {/* Optional description snippet */}
                      {item.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Status and ETA tags */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="rounded-lg bg-accent/50 px-2 py-1 text-[10px] font-medium text-muted-foreground border border-border/50">
                          {item.status}
                        </span>
                        <span className="rounded-lg bg-accent/50 px-2 py-1 text-[10px] font-medium text-muted-foreground border border-border/50">
                          {item.eta}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 'Add Task' button at the bottom of each column */}
                <button
                  type="button"
                  onClick={() => openNewItemModal(colIdx)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-bold text-muted-foreground/60 hover:border-primary/40 hover:text-foreground hover:bg-accent/20 transition-all active:scale-[0.98]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
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

      {/* DIALOGS / MODALS */}

      {/* Modal for creating a new column */}
      <Dialog open={createBoardOpen} onOpenChange={setCreateBoardOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm rounded-2xl shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Column</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
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
                className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground outline-none transition-all focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                placeholder="e.g. Backlog"
              />
            </div>
          </div>
          <DialogFooter className="gap-3 sm:justify-between">
            <button
              type="button"
              onClick={() => setCreateBoardOpen(false)}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createBoard}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-all"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for creating a new task item */}
      <Dialog
        open={!!newItemModal}
        onOpenChange={(open) => !open && cancelNewItem()}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-md rounded-2xl shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            {/* Title Input */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
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
                className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                placeholder="Task title"
              />
            </div>
            {/* Description Textarea */}
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
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
                className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40"
                placeholder="What needs to be done?"
                rows={3}
              />
            </div>
            {/* Dropdown selectors for Status, Priority, and ETA */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {statusOptions.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {priorityOptions.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {etaOptions.map((eOpt) => (
                      <SelectItem
                        key={eOpt}
                        value={eOpt}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
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
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
               onClick={createItem}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-all"
            >
              Create Task
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal for editing an existing task item (similar structure to creation modal) */}
      <Dialog
        open={!!editingModal}
        onOpenChange={(open) => !open && cancelEdit()}
      >
        <DialogContent className="bg-card border-border text-foreground max-w-md rounded-2xl shadow-2xl backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
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
                className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                placeholder="Update task title"
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
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
                className="w-full rounded-xl border border-border bg-accent/30 px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/40"
                placeholder="Add more details"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {statusOptions.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
                      >
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {priorityOptions.map((p) => (
                      <SelectItem
                        key={p}
                        value={p}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
                      >
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <SelectTrigger className="w-full h-11 rounded-xl border-border bg-accent/30 text-sm text-foreground focus:ring-1 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground rounded-xl shadow-xl">
                    {etaOptions.map((eOpt) => (
                      <SelectItem
                        key={eOpt}
                        value={eOpt}
                        className="focus:bg-accent focus:text-foreground rounded-lg"
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
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitEdit}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-[0.98] transition-all"
            >
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
