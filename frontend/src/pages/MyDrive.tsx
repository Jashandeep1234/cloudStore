import { useNavigate } from "react-router-dom";
import { useAllFiles, useFileMutations } from "@/hooks/useFiles";
import { useRootFolders, useFolderMutations } from "@/hooks/useFolders";
import { FolderCard } from "@/components/folder/FolderCard";
import { FileGrid } from "@/components/file/FileGrid";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { useDrive } from "@/context/DriveContext";
import { toast } from "sonner";
import { useEffect } from "react";
import { FileNode } from "@/types/file";
import { Folder } from "@/types/folder";

export const MyDrive = () => {
  const navigate = useNavigate();
  const { setCurrentFolderId } = useDrive();

  // Tell context we are at root
  useEffect(() => {
    setCurrentFolderId(null);
  }, [setCurrentFolderId]);

  // Data hooks (proper top-level calls)
  const { data: rootFolders = [], isLoading: foldersLoading } = useRootFolders();
  const { data: allFiles = [], isLoading: filesLoading } = useAllFiles();

  // Root files = files with no folder (folderId is null or 0)
  const rootFiles = allFiles.filter((f) => !f.folderId);

  // Mutation hooks
  const { deleteFile, renameFile, downloadFile } = useFileMutations();
  const { deleteFolder, renameFolder } = useFolderMutations();

  /* ── File handlers ── */
  const handleFileDelete = async (file: FileNode) => {
    try {
      await deleteFile({ id: file.id, folderId: file.folderId });
      toast.success(`"${file.name}" deleted`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete file";
      toast.error(msg);
    }
  };

  const handleFileRename = async (file: FileNode, newName: string) => {
    try {
      await renameFile({ id: file.id, newName });
      toast.success(`Renamed to "${newName}"`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to rename file";
      toast.error(msg);
      throw err; // re-throw so RenameDialog doesn't close
    }
  };

  const handleFileDownload = (file: FileNode) => {
    downloadFile(file.id);
  };

  /* ── Folder handlers ── */
  const handleFolderDelete = async (folder: Folder) => {
    try {
      await deleteFolder(folder.id);
      toast.success(`"${folder.name}" deleted`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete folder";
      toast.error(msg);
    }
  };

  const handleFolderRename = async (folder: Folder, newName: string) => {
    try {
      await renameFolder({ id: folder.id, name: newName });
      toast.success(`Renamed to "${newName}"`);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to rename folder";
      toast.error(msg);
      throw err;
    }
  };

  return (
    <div className="relative min-h-full animate-in fade-in duration-500 pb-20 space-y-8">
      <BreadcrumbNav items={[{ label: "My Drive" }]} />

      {/* Folders Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Folders
        </h2>
        {foldersLoading ? (
          <SkeletonGrid count={4} type="folder" />
        ) : rootFolders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rootFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onClick={(f) => navigate(`/folder/${f.id}`)}
                onDelete={handleFolderDelete}
                onRename={handleFolderRename}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground border-2 border-dashed p-10 rounded-xl text-center">
            <p className="font-medium">No folders yet</p>
            <p className="text-xs mt-1">Use the "New Folder" button above to create one.</p>
          </div>
        )}
      </section>

      {/* Files Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Files
        </h2>
        {filesLoading ? (
          <SkeletonGrid count={5} type="file" />
        ) : (
          <FileGrid
            files={rootFiles}
            onDelete={handleFileDelete}
            onDownload={handleFileDownload}
            onRename={handleFileRename}
          />
        )}
      </section>
    </div>
  );
};
