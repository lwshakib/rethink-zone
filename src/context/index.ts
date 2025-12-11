import {create} from 'zustand'

type Workspace = {
    id: string;
    name: string;
    documentData: Record<string, unknown>;
    canvasData: Record<string, unknown>;
    kanbanBoard: Record<string, unknown>;
    updatedAt: string;
    createdAt: string;
}

interface WorkspaceStore {
    workspaces: Workspace[];
    setWorkspaces: (workspaces: Workspace[]) => void;
}


export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
    workspaces: [],
    setWorkspaces: (workspaces) => set({ workspaces }),
}));