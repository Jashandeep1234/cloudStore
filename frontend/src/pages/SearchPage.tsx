import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearch } from "@/hooks/useSearch";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FileGrid } from "@/components/file/FileGrid";
import { FolderCard } from "@/components/folder/FolderCard";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { Skeleton } from "@/components/ui/skeleton";

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const navigate = useNavigate();

  // 300ms debounce as specified
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, setSearchParams]);

  const { files, folders, isLoading } = useSearch(debouncedQuery);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Search</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            id="search-page-input"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            placeholder="Search for files, folders, or anything..."
            className="w-full pl-12 h-14 text-lg rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-inner"
            autoFocus
          />
        </div>
      </div>

      {!debouncedQuery ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Type something to search your drive</p>
          <p className="text-sm mt-1">Search across all files and folders</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-8">
          <Skeleton className="h-5 w-32" />
          <SkeletonGrid count={4} type="folder" />
          <Skeleton className="h-5 w-28" />
          <SkeletonGrid count={5} type="file" />
        </div>
      ) : files.length === 0 && folders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No results for "{debouncedQuery}"</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="space-y-8">
          {folders.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Folders ({folders.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onClick={() => navigate(`/folder/${folder.id}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {files.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
                Files ({files.length})
              </h2>
              <FileGrid files={files} />
            </section>
          )}
        </div>
      )}
    </div>
  );
};
