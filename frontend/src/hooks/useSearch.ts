import { useQuery } from "@tanstack/react-query";
import { searchService } from "../services/searchService";

export const useSearch = (query: string) => {
  const fileSearch = useQuery({
    queryKey: ["search", "files", query],
    queryFn: () => searchService.searchFiles(query),
    enabled: query.length > 0,
  });

  const folderSearch = useQuery({
    queryKey: ["search", "folders", query],
    queryFn: () => searchService.searchFolders(query),
    enabled: query.length > 0,
  });

  return {
    files: fileSearch.data || [],
    folders: folderSearch.data || [],
    isLoading: fileSearch.isLoading || folderSearch.isLoading,
    isError: fileSearch.isError || folderSearch.isError,
  };
};
