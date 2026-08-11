import { apiClient } from "../api/axios";
import { Folder } from "../types/folder";

export const folderService = {
  // GET /api/folder
  getAllFolders: async (): Promise<Folder[]> => {
    const response = await apiClient.get<Folder[]>("/folder");
    return response.data;
  },

  // GET /api/folder/root
  getRootFolders: async (): Promise<Folder[]> => {
    const response = await apiClient.get<Folder[]>("/folder/root");
    return response.data;
  },

  // GET /api/folder/{id}
  getFolderById: async (id: number): Promise<Folder> => {
    const response = await apiClient.get<Folder>(`/folder/${id}`);
    return response.data;
  },

  // GET /api/folder/parent/{parentId}
  getChildFolders: async (parentId: number): Promise<Folder[]> => {
    const response = await apiClient.get<Folder[]>(`/folder/parent/${parentId}`);
    return response.data;
  },

  // POST /api/folder  body: { name, parentId }
  createFolder: async (data: { name: string; parentId: number | null }): Promise<Folder> => {
    const response = await apiClient.post<Folder>("/folder", data);
    return response.data;
  },

  // PUT /api/folder/{id}/rename  body: { name }
  renameFolder: async (id: number, name: string): Promise<Folder> => {
    const response = await apiClient.put<Folder>(`/folder/${id}/rename`, { name });
    return response.data;
  },

  // DELETE /api/folder/{id}
  deleteFolder: async (id: number): Promise<void> => {
    await apiClient.delete(`/folder/${id}`);
  },
};
