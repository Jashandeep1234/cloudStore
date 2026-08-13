import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fileService } from "../services/fileService";
import { FileNode } from "../types/file";

/**
 * Hook to fetch all files.
 */
export const useAllFiles = () => {
  return useQuery({
    queryKey: ["files"],
    queryFn: fileService.getAllFiles,
  });
};

/**
 * Hook to fetch files inside a specific folder.
 */
export const useFolderFiles = (folderId: number | null) => {
  return useQuery({
    queryKey: ["files", "folder", folderId],
    queryFn: () => fileService.getFilesByFolder(folderId!),
    enabled: folderId !== null && folderId !== undefined,
  });
};

/**
 * Hook that provides file mutation operations:
 * upload, rename, delete, download
 */
export const useFileMutations = () => {
  const queryClient = useQueryClient();

  const invalidateFiles = (folderId?: number | null) => {
    queryClient.invalidateQueries({ queryKey: ["files"] });
    if (folderId !== undefined && folderId !== null) {
      queryClient.invalidateQueries({ queryKey: ["files", "folder", folderId] });
    }
  };

  const uploadFileMutation = useMutation({
    mutationFn: ({
      name,
      folderId,
      file,
    }: {
      name: string;
      folderId: number | null;
      file: File;
    }) => fileService.uploadFile(name, folderId, file),
    onSuccess: (data: FileNode) => {
      invalidateFiles(data.folderId);
    },
  });

  const renameFileMutation = useMutation({
    mutationFn: ({ id, newName }: { id: number; newName: string }) =>
      fileService.renameFile(id, newName),
    onSuccess: (data: FileNode) => {
      invalidateFiles(data.folderId);
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: ({ id, folderId }: { id: number; folderId?: number | null }) =>
      fileService.deleteFile(id).then(() => ({ folderId })),
    onSuccess: (result: { folderId?: number | null }) => {
      invalidateFiles(result.folderId);
    },
  });

  const downloadFile = async (id: number, name?: string) => {
    const blob = await fileService.downloadFile(id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", name ?? `file-${id}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return {
    uploadFile: uploadFileMutation.mutateAsync,
    isUploading: uploadFileMutation.isPending,
    renameFile: renameFileMutation.mutateAsync,
    isRenaming: renameFileMutation.isPending,
    deleteFile: deleteFileMutation.mutateAsync,
    isDeleting: deleteFileMutation.isPending,
    downloadFile,
  };
};
