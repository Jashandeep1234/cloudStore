import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonGridProps {
  count?: number;
  type?: "file" | "folder";
}

export const SkeletonGrid = ({ count = 5, type = "file" }: SkeletonGridProps) => {
  if (type === "folder") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
};
