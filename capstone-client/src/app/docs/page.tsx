"use client";

import { AuthGuard } from "@/components/AuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspaces } from "@/contexts/WorkspaceContext";
import { type DocLink, listDocLinksGlobalServer } from "@/lib/api/docs";
import { Copy, ExternalLink, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDomain } from "tldts";

function DocsContent() {
  const [docLinks, setDocLinks] = useState<DocLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { toast } = useToast();
  const { workspaces } = useWorkspaces();
  const [wsId, setWsId] = useState<number | "">("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch doc links on mount
  useEffect(() => {
    const fetchDocLinks = async () => {
      try {
        setIsLoading(true);
        const links = await listDocLinksGlobalServer();
        setDocLinks(links);
      } catch {
        if (process.env.NODE_ENV !== "production") {
          console.error("Failed to fetch doc links");
        }
        toast({
          title: "Error",
          description: "Failed to load documentation links. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocLinks();
  }, [toast]);

  // Set default workspace ID from context
  useEffect(() => {
    if (workspaces.length > 0 && wsId === "") {
      setWsId(workspaces[0].id);
    }
  }, [workspaces, wsId]);

  // Creation flows are handled by /docs/new and /w/[id]/new

  // Filter doc links based on search
  const filteredDocLinks = useMemo(() => {
    if (!debouncedSearch) return docLinks;

    const query = debouncedSearch.toLowerCase();
    return docLinks.filter(
      (link) =>
        link.title.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query) ||
        link.label?.toLowerCase().includes(query)
    );
  }, [docLinks, debouncedSearch]);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Copied!",
        description: "Link copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const extractDomainFromUrl = (url: string): string => {
    try {
      const domain = getDomain(url);
      return domain || new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=16`;
    } catch {
      return "/file.svg"; // Fallback icon
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Documentation Hub
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2">
              Centralized access to all your documentation links
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse flex flex-col">
              <CardHeader className="pb-3">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="h-3 bg-muted rounded w-full mb-2"></div>
                <div className="h-8 bg-muted rounded w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Documentation Hub
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Centralized access to all your documentation links
          </p>
        </div>
        <Button asChild className="flex-shrink-0 w-full sm:w-auto">
          <Link href="/docs/new">
            <Plus className="w-4 h-4 mr-2" /> Add Link
          </Link>
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search documentation links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Doc links grid */}
      {filteredDocLinks.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery
              ? "No matching links found"
              : "No documentation links yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Add your first documentation link to get started"}
          </p>
          {!searchQuery && (
            <Button asChild>
              <Link href="/docs/new">
                <Plus className="w-4 h-4 mr-2" /> Add Your First Link
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocLinks.map((link) => (
            <Card
              key={link.id}
              className="group hover:shadow-md transition-shadow flex flex-col"
            >
              <CardHeader className="pb-3 flex-shrink-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getFaviconUrl(link.url)}
                      alt=""
                      width={16}
                      height={16}
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      onError={(event) => {
                        event.currentTarget.src = "/file.svg";
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight line-clamp-2">
                        {link.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleCopyLink(link.url)}
                      title="Copy link"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() =>
                        window.open(link.url, "_blank", "noopener,noreferrer")
                      }
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-1.5">
                  {extractDomainFromUrl(link.url)}
                </p>
              </CardHeader>
              <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                {link.label && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {link.label}
                    </Badge>
                  </div>
                )}
                <div className="space-y-2">
                  {link.workspace && (
                    <div className="text-xs">
                      <Link
                        className="text-primary hover:underline"
                        href={`/w/${link.workspace}`}
                      >
                        View Workspace
                      </Link>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(link.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats footer */}
      {filteredDocLinks.length > 0 && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Showing {filteredDocLinks.length} of {docLinks.length} documentation
          links
        </div>
      )}
    </div>
  );
}

export default function DocsPage() {
  return (
    <AuthGuard>
      <DocsContent />
    </AuthGuard>
  );
}
