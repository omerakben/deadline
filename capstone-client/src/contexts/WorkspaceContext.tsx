"use client";

import { listWorkspaces, type Workspace } from "@/lib/api/workspaces";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface WorkspaceContextValue {
  workspaces: Workspace[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();

  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await listWorkspaces();
      setWorkspaces(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch workspaces";
      setError(message);
      if (process.env.NODE_ENV !== "production") {
        console.error("Error fetching workspaces:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    fetchWorkspaces();
  }, [fetchWorkspaces, authLoading]);

  const value: WorkspaceContextValue = {
    workspaces,
    loading: loading || authLoading,
    error,
    refetch: fetchWorkspaces,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export function useWorkspaces(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspaces must be used within WorkspaceProvider");
  }
  return context;
}
