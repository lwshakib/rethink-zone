/**
 * This module defines the global application state using Zustand.
 * It primarily manages the list of 'Workspaces' available to the user.
 */

import {create} from 'zustand'

/**
 * Workspace Schema
 * Represents a single project/container holding multiple types of content (Docs, Canvas, Kanban).
 */
export type Workspace = {
    id: string;
    name: string;
    /** Raw document state (BlockNote JSON) */
    documentData: Record<string, unknown> | null;
    /** Raw canvas state (Shapes JSON) */
    canvasData: Record<string, unknown> | null;
    /** Raw kanban state (Board JSON) */
    kanbanBoard: Record<string, unknown> | null;
    updatedAt: string;
    createdAt: string;
};

/**
 * State store interface for workspaces.
 */
interface WorkspaceStore {
    /** Current list of workspaces fetched from the database */
    workspaces: Workspace[];
    /** Update the list with either a new array or a functional mapper */
    setWorkspaces: (
        workspaces: Workspace[] | ((workspaces: Workspace[]) => Workspace[])
    ) => void;
}

/**
 * Global hook to access and modify workspace state throughout the app.
 */
export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],
    // Implement setter with support for functional updates
    setWorkspaces: (workspaces) =>
        set((state) => ({
            workspaces:
                typeof workspaces === "function"
                    ? workspaces(state.workspaces)
                    : workspaces,
        })),
}));