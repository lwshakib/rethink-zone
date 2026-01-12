import { useState, useCallback, useRef } from "react"; // React hooks
import { HistoryEntry } from "../types"; // Type for snapshot data

/**
 * useCanvasHistory - Hook for managing Undo/Redo state
 * It maintains a stack of snapshots and a pointer to the current state.
 */
export const useCanvasHistory = (initialEntry: HistoryEntry) => {
  // Array of full canvas snapshots
  const [history, setHistory] = useState<HistoryEntry[]>([initialEntry]);
  // Current position in the history array
  const [historyIndex, setHistoryIndex] = useState(0);
  // Ref to track if we are currently performing an undo/redo to prevent pushing redundant entries
  const isUndoRedoRef = useRef(false);

  /**
   * Pushes a new state onto the history stack.
   * If there are "future" states (after an undo), they are truncated.
   */
  const pushHistory = useCallback(
    (entry: HistoryEntry) => {
      // Don't push if we're currently navigating history
      if (isUndoRedoRef.current) return;
      setHistory((prev) => {
        // Discard forward history if we are currently in a past state
        const trimmed = prev.slice(0, historyIndex + 1);
        const updated = [...trimmed, entry];
        setHistoryIndex(updated.length - 1);
        return updated;
      });
    },
    [historyIndex]
  );

  /**
   * Moves the history pointer back by one and returns the previous state
   */
  const undo = useCallback(() => {
    if (historyIndex <= 0) return null; // Already at the beginning
    const prevIndex = historyIndex - 1;
    setHistoryIndex(prevIndex);
    return history[prevIndex];
  }, [history, historyIndex]);

  /**
   * Moves the history pointer forward by one and returns the next state
   */
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return null; // Already at the end
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
