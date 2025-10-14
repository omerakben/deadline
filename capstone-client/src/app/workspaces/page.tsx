"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { WorkspaceCard } from "@/components/workspace-card";
import { useWorkspaces } from "@/contexts/WorkspaceContext";
import { PlusCircle } from "lucide-react";
import Link from "next/link";

/**
 * Workspaces list page for managing artifact collections.
 */
function WorkspacesListContent() {
  const { workspaces, loading, error } = useWorkspaces();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-6">
            <div className="h-5 w-32 animate-pulse rounded bg-muted mb-4" />
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 w-48 animate-pulse rounded bg-muted mb-2" />
                <div className="h-4 w-64 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-9 w-36 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-12 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-14 animate-pulse rounded bg-muted" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </div>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>

                <div className="pt-2 border-t border-dashed">
                  <div className="h-8 w-full animate-pulse rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Workspaces", current: true },
            ]}
          />
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
              <p className="text-muted-foreground">
                Manage your development artifact collections
              </p>
            </div>
            <Button
              asChild
              variant="primarySoft"
              className="px-5 py-2 rounded-lg"
            >
              <Link href="/workspaces/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Workspace
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {workspaces.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first workspace to start organizing your development
              artifacts
            </p>
            <Button
              asChild
              variant="primarySoft"
              className="px-5 py-2 rounded-lg"
            >
              <Link href="/workspaces/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Workspace
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkspacesListPage() {
  return (
    <AuthGuard>
      <WorkspacesListContent />
    </AuthGuard>
  );
}
