"use client";

import KanbanArea from "./KanbanArea";

export default function KanbanTab() {
  return (
    <div className="flex h-full min-h-0">
      <div className="min-h-0 h-full w-full">
        <KanbanArea />
      </div>
    </div>
  );
}
