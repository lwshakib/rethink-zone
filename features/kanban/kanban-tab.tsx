"use client";

import KanbanArea from "./KanbanArea";

export default function KanbanTab({ board, onChange }: { board?: any[], onChange?: (board: any[]) => void }) {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <KanbanArea board={board} onChange={onChange} />
      </div>
    </div>
  );
}
