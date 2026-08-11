import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { folderService } from "../services/folderService";

/**
 * Hook to fetch all folders.
 */
export const useAllFolders = () => {
  return useQuery({
    queryKey: ["folders"],
    queryFn: folderService.getAllFolders,
  });
};

/**
 * Hook to fetch root-level folders (no parent).
 */
export const useRootFolders = () => {
  return useQuery({
    queryKey: ["folders", "root"],
    queryFn: folderService.getRootFolders,
  });
};

/**
 * Hook to fetch child folders of a given parent folder.
 */
export const useChildFolders = (parentId: number | null) => {
  return useQuery({
    queryKey: ["folders", "parent", parentId],
    queryFn: () => folderService.getChildFolders(parentId!),
    enabled: parentId !== null && parentId !== undefined,
  });
};

/**
 * Hook to fetch a single folder by id.
 */
export const useFolderById = (id: number | null) => {
  return useQuery({
    queryKey: ["folders", id],
    queryFn: () => folderService.getFolderById(id!),
    enabled: id !== null && id !== undefined && id > 0,
  });
};

/**
 * Hook that provides folder mutation operations:
 * create, rename, delete
 */
export const useFolderMutations = () => {
  const queryClient = useQueryClient();

  const invalidateFolders = () => {
    queryClient.invalidateQueries({ queryKey: ["folders"] });
  };

  const createFolderMutation = useMutation({
    mutationFn: (data: { name: string; parentId: number | null }) =>
      folderService.createFolder(data),
    onSuccess: invalidateFolders,
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      folderService.renameFolder(id, name),
    onSuccess: invalidateFolders,
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: number) => folderService.deleteFolder(id),
    onSuccess: invalidateFolders,
  });

  return {
    createFolder: createFolderMutation.mutateAsync,
    isCreating: createFolderMutation.isPending,
    renameFolder: renameFolderMutation.mutateAsync,
    isRenaming: renameFolderMutation.isPending,
    deleteFolder: deleteFolderMutation.mutateAsync,
    isDeleting: deleteFolderMutation.isPending,
  };
};
