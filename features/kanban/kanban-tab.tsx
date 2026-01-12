/**
 * This component represents the main view for the 'Kanban' tab.
 * It serves as a simple wrapper for the KanbanArea component, providing basic layout constraints.
 */

"use client";

import KanbanArea from "./KanbanArea";

/**
 * KanbanTab Component
 * 
 * @param board - The optional starting state of the board columns and tasks.
 * @param onChange - An optional callback triggered whenever the board structure changes (moves, deletes, adds).
 */
export default function KanbanTab({ board, onChange }: { board?: any[], onChange?: (board: any[]) => void }) {
  return (
    // Outer container: fills the height of the parent and prevents overflow issues.
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        {/* Mount the primary Kanban logic and UI. */}
        <KanbanArea board={board} onChange={onChange} />
      </div>
    </div>
  );
}
