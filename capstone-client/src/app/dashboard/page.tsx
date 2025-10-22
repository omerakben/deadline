"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { WorkspaceCard } from "@/components/workspace-card";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspaces } from "@/contexts/WorkspaceContext";
import { searchArtifactsGlobal } from "@/lib/api/search";
import { applyShowcaseTemplates } from "@/lib/api/workspaces";
import type { Artifact } from "@/types/artifacts";
import {
    Database,
    FileText,
    Loader2,
    PlusCircle,
    RotateCcw,
    Search,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Dashboard page - main entry point after authentication
 *
 * Features:
 * - Recent workspaces grid
 * - Global search with debouncing
 * - Quick Actions sidebar
 * - Environment-aware workspace display
 */
function DashboardContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { workspaces, loading, error, refetch } = useWorkspaces();
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Artifact[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [applyingTemplates, setApplyingTemplates] = useState(false);
  const { toast } = useToast();

  const handleApplyTemplates = async () => {
    setApplyingTemplates(true);
    try {
      const created = await applyShowcaseTemplates();
      await refetch();
      toast({
        title: "Showcase template ready",
        description: `Created ${created.length} example workspaces with curated artifacts.`,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to apply showcase template.";
      toast({
        title: "Template provisioning failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setApplyingTemplates(false);
    }
  };

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fire global search when query present
  useEffect(() => {
    const run = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      // Don't search if user is not authenticated
      if (!user) {
        setSearchResults([]);
        return;
      }

      try {
        setSearchLoading(true);
        const { results } = await searchArtifactsGlobal({ q: debouncedSearch });
        setSearchResults(results);
      } catch (error) {
        console.error("Global search failed:", error);

        // Show user-facing notification
        toast({
          title: "Search Failed",
          description: "Unable to complete search. Please try again.",
          variant: "destructive",
        });

        // Keep empty results (don't show stale data)
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    void run();
  }, [debouncedSearch, user]);

  // Filter workspaces based on search query - ensure workspaces is array
  const filteredWorkspaces = (
    Array.isArray(workspaces) ? workspaces : []
  ).filter(
    (workspace) =>
      workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workspace.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back{user?.displayName ? `, ${user.displayName}` : ""}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your development artifacts across environments
              </p>
            </div>
            <div className="flex items-center gap-3">
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Search bar + Refresh */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {Array.isArray(workspaces) && workspaces.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={loading}
                  title="Refresh workspaces"
                  aria-label="Refresh workspaces list"
                  className="flex items-center gap-1 w-full sm:w-auto"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span>Refresh</span>
                </Button>
              )}
            </div>

            {/* Workspaces grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Your Workspaces
                </h2>
              </div>

              {/* Global search results */}
              {debouncedSearch && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Search Results</h3>
                  {searchLoading ? (
                    <div className="text-sm text-muted-foreground">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No results
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-3 py-2 text-left">Kind</th>
                            <th className="px-3 py-2 text-left">Key / Title</th>
                            <th className="px-3 py-2 text-left">Env</th>
                            <th className="px-3 py-2 text-left">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {searchResults.slice(0, 25).map((a) => (
                            <tr key={a.id} className="border-t">
                              <td className="px-3 py-2">{a.kind}</td>
                              <td className="px-3 py-2">
                                {a.kind === "ENV_VAR"
                                  ? (a as unknown as { key?: string }).key ?? ""
                                  : (a as unknown as { title?: string })
                                      .title ?? ""}
                              </td>
                              <td className="px-3 py-2">{a.environment}</td>
                              <td className="px-3 py-2">
                                {new Date(a.updated_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Loading state */}
              {loading && (
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
              )}

              {/* Error state */}
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
                  <p className="text-destructive font-medium">
                    Failed to load workspaces
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    className="mt-4"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty state */}
              {!loading &&
                !error &&
                filteredWorkspaces.length === 0 &&
                (!Array.isArray(workspaces) || workspaces.length === 0) && (
                  <div className="text-center py-12 space-y-6">
                    <Database className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No workspaces yet
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                      Jump in by creating your own workspace or load our
                      showcase templates to explore every feature instantly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        asChild
                        variant="outline"
                        className="px-5 py-2 rounded-lg"
                      >
                        <Link href="/workspaces/new">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Workspace
                        </Link>
                      </Button>
                      <Button
                        variant="primarySoft"
                        className="px-5 py-2 rounded-lg"
                        onClick={handleApplyTemplates}
                        disabled={applyingTemplates}
                      >
                        {applyingTemplates ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Use Showcase Template
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                      We will provision three curated examples: PRD Acme Full Stack Suite,
                      PRD AI Delivery Lab, and PRD Project Ops Command.
                    </p>
                  </div>
                )}

              {/* No search results */}
              {!loading &&
                !error &&
                filteredWorkspaces.length === 0 &&
                Array.isArray(workspaces) &&
                workspaces.length > 0 && (
                  <div className="text-center py-12">
                    <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">
                      No workspaces found
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Try adjusting your search query
                    </p>
                  </div>
                )}

              {/* Workspaces grid */}
              {!loading && !error && filteredWorkspaces.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredWorkspaces.map((workspace) => (
                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/workspaces/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Workspace
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Link href="/docs">
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Docs
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats overview */}
              {Array.isArray(workspaces) && workspaces.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Overview</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Workspaces
                      </span>
                      <span className="font-medium">{workspaces.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Total Artifacts
                      </span>
                      <span className="font-medium">
                        {workspaces.reduce(
                          (sum, w) => sum + (w.artifact_counts?.total ?? 0),
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard page with authentication guard
 */
export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
