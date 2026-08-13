import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFolderById, useChildFolders, useFolderMutations } from "@/hooks/useFolders";
import { useFolderFiles, useFileMutations } from "@/hooks/useFiles";
import { FolderCard } from "@/components/folder/FolderCard";
import { FileGrid } from "@/components/file/FileGrid";
import { BreadcrumbNav } from "@/components/common/BreadcrumbNav";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { useDrive } from "@/context/DriveContext";
import { toast } from "sonner";
import { FileNode } from "@/types/file";
import { Folder } from "@/types/folder";

export const FolderPage = () => {
  const { id } = useParams<{ id: string }>();
  const folderId = Number(id);
  const navigate = useNavigate();
  const { setCurrentFolderId } = useDrive();

  // Tell context which folder we are in (for navbar upload/create)
  useEffect(() => {
    setCurrentFolderId(folderId);
    return () => setCurrentFolderId(null);
  }, [folderId, setCurrentFolderId]);

  // Data hooks — all at top level (no Rules of Hooks violations)
  const { data: currentFolder, isLoading: folderLoading } = useFolderById(folderId);
  const { data: childFolders = [], isLoading: childFoldersLoading } = useChildFolders(folderId);
  const { data: files = [], isLoading: filesLoading } = useFolderFiles(folderId);

  // Mutations
  const { deleteFile, renameFile, downloadFile } = useFileMutations();
  const { deleteFolder, renameFolder } = useFolderMutations();

  // Build breadcrumb — currentFolder gives us name; navigate up via parentId is done client-side
  const breadcrumbs = currentFolder
    ? [{ label: currentFolder.name, href: `/folder/${currentFolder.id}` }]
    : [];

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
      throw err;
    }
  };

  const handleFileDownload = (file: FileNode) => {
    downloadFile(file.id, file.name);
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
      {/* Breadcrumb */}
      {folderLoading ? (
        <Skeleton className="h-6 w-64 mb-6" />
      ) : (
        <BreadcrumbNav items={breadcrumbs} />
      )}

      {/* Sub-folders Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
          Folders
        </h2>
        {childFoldersLoading ? (
          <SkeletonGrid count={4} type="folder" />
        ) : childFolders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {childFolders.map((folder) => (
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
          <div className="text-sm text-muted-foreground border-2 border-dashed p-8 rounded-xl text-center">
            <p className="font-medium">No sub-folders</p>
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
            files={files}
            onDelete={handleFileDelete}
            onDownload={handleFileDownload}
            onRename={handleFileRename}
          />
        )}
      </section>
    </div>
  );
};
