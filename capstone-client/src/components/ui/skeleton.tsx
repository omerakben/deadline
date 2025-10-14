import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base skeleton component for loading states
 * Provides animated placeholder for content loading
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Skeleton for workspace cards in grid layout
 */
export function WorkspaceCardSkeleton() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>

      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-6 w-12" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-14" />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      <div className="pt-2 border-t border-dashed">
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}

/**
 * Skeleton for artifact table rows
 */
export function ArtifactTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-3 border rounded">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32 flex-1" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for form fields
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/**
 * Skeleton for page headers
 */
export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton grid for dashboard/listing pages
 */
export function GridSkeleton({
  items = 6,
  columns = 3
}: {
  items?: number;
  columns?: 2 | 3 | 4;
}) {
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  }[columns];

  return (
    <div className={cn("grid gap-6", gridClass)}>
      {Array.from({ length: items }).map((_, i) => (
        <WorkspaceCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Full page loading skeleton for initial page loads
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PageHeaderSkeleton />
        <div className="mt-8">
          <GridSkeleton />
        </div>
      </div>
    </div>
  );
}
