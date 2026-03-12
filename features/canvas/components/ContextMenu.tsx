import React, { useEffect, useRef } from "react";
import {
  Scissors,
  Copy,
  Clipboard,
  Files,
  MousePointer2,
  Trash2,
  BringToFront,
  SendToBack,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDuplicate: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onCut,
  onCopy,
  onPaste,
  onDuplicate,
  onSelectAll,
  onDelete,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("wheel", onClose);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("wheel", onClose);
    };
  }, [onClose]);

  // Adjust position to keep menu within viewport
  const adjustedX = Math.min(x, window.innerWidth - 220);
  const adjustedY = Math.min(y, window.innerHeight - 450); // Increased limit as menu is longer

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl py-1.5 min-w-[220px] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: adjustedX, top: adjustedY }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ContextMenuItem
        label="Cut"
        icon={<Scissors className="w-4 h-4" />}
        shortcut="Ctrl+X"
        onClick={() => {
          onCut();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Copy"
        icon={<Copy className="w-4 h-4" />}
        shortcut="Ctrl+C"
        onClick={() => {
          onCopy();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Paste"
        icon={<Clipboard className="w-4 h-4" />}
        shortcut="Ctrl+V"
        onClick={() => {
          onPaste();
          onClose();
        }}
      />
      <div className="h-px bg-border/50 my-1.5 mx-3" />
      <ContextMenuItem
        label="Duplicate"
        icon={<Files className="w-4 h-4" />}
        shortcut="Ctrl+D"
        onClick={() => {
          onDuplicate();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Select All"
        icon={<MousePointer2 className="w-4 h-4" />}
        shortcut="Ctrl+A"
        onClick={() => {
          onSelectAll();
          onClose();
        }}
      />
      <div className="h-px bg-border/50 my-1.5 mx-3" />
      <ContextMenuItem
        label="Bring to Front"
        icon={<BringToFront className="w-4 h-4" />}
        shortcut="Alt+F"
        onClick={() => {
          onBringToFront();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Send to Back"
        icon={<SendToBack className="w-4 h-4" />}
        shortcut="Alt+B"
        onClick={() => {
          onSendToBack();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Bring Forward"
        icon={<ChevronUp className="w-4 h-4" />}
        shortcut="Alt+]"
        onClick={() => {
          onBringForward();
          onClose();
        }}
      />
      <ContextMenuItem
        label="Send Backward"
        icon={<ChevronDown className="w-4 h-4" />}
        shortcut="Alt+["
        onClick={() => {
          onSendBackward();
          onClose();
        }}
      />
      <div className="h-px bg-border/50 my-1.5 mx-3" />
      <ContextMenuItem
        label="Delete"
        icon={<Trash2 className="w-4 h-4 text-destructive" />}
        shortcut="Del"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="text-destructive hover:bg-destructive/10"
      />
    </div>
  );
};

interface ContextMenuItemProps {
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  onClick: () => void;
  className?: string;
}

const ContextMenuItem = ({
  label,
  icon,
  shortcut,
  onClick,
  className = "",
}: ContextMenuItemProps) => (
  <button
    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent transition-all duration-200 group ${className}`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <span className="opacity-70 group-hover:opacity-100">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    <span className="text-[10px] uppercase tracking-widest opacity-40 font-mono">
      {shortcut}
    </span>
  </button>
);
