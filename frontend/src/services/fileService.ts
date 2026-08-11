import { apiClient } from "../api/axios";
import { FileNode } from "../types/file";

export const fileService = {
  // GET /api/files
  getAllFiles: async (): Promise<FileNode[]> => {
    const response = await apiClient.get<FileNode[]>("/files");
    return response.data;
  },

  // GET /api/files/{id}
  getFileById: async (id: number): Promise<FileNode> => {
    const response = await apiClient.get<FileNode>(`/files/${id}`);
    return response.data;
  },

  // GET /api/files/folder/{folderId}
  getFilesByFolder: async (folderId: number): Promise<FileNode[]> => {
    const response = await apiClient.get<FileNode[]>(`/files/folder/${folderId}`);
    return response.data;
  },

  // POST /api/files/upload (multipart/form-data: name, folderId, file)
  uploadFile: async (
    name: string,
    folderId: number | null,
    file: File
  ): Promise<FileNode> => {
    const formData = new FormData();
    formData.append("name", name || file.name);
    if (folderId !== null && folderId !== undefined) {
      formData.append("folderId", folderId.toString());
    }
    formData.append("file", file);

    const response = await apiClient.post<FileNode>("/files/upload", formData);
    return response.data;
  },

  // PUT /api/files/rename/{id}?newName=
  renameFile: async (id: number, newName: string): Promise<FileNode> => {
    const response = await apiClient.put<FileNode>(
      `/files/rename/${id}`,
      null,
      { params: { newName } }
    );
    return response.data;
  },

  // DELETE /api/files/{id}
  deleteFile: async (id: number): Promise<void> => {
    await apiClient.delete(`/files/${id}`);
  },

  // GET /api/files/download/{id}
  downloadFileUrl: (id: number): string => {
    return `${apiClient.defaults.baseURL}/files/download/${id}`;
  },
};
