import { apiClient } from "../api/axios";
import { Folder } from "../types/folder";
import { FileNode } from "../types/file";

export const searchService = {
  // GET /api/search/files?query=
  searchFiles: async (query: string): Promise<FileNode[]> => {
    if (!query) return [];
    const response = await apiClient.get<FileNode[]>(`/search/files?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // GET /api/search/folders?query=
  searchFolders: async (query: string): Promise<Folder[]> => {
    if (!query) return [];
    const response = await apiClient.get<Folder[]>(`/search/folders?query=${encodeURIComponent(query)}`);
    return response.data;
  },
};
