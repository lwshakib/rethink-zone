import { useState, useCallback, useRef } from "react";
import { HistoryEntry } from "../types";

export const useCanvasHistory = (initialEntry: HistoryEntry) => {
  const [history, setHistory] = useState<HistoryEntry[]>([initialEntry]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback(
    (entry: HistoryEntry) => {
      if (isUndoRedoRef.current) return;
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const updated = [...trimmed, entry];
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex <= 0) return null;
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    return history[prevIndex];
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return null;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    return history[nextIndex];
  }, [history, historyIndex]);

  return {
    history,
    setHistory,
    historyIndex,
    setHistoryIndex,
    isUndoRedoRef,
    pushHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
