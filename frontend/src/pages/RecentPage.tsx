import { useAllFiles, useFileMutations } from "@/hooks/useFiles";
import { FileGrid } from "@/components/file/FileGrid";
import { Clock, FileText } from "lucide-react";
import { toast } from "sonner";
import { FileNode } from "@/types/file";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";

export const RecentPage = () => {
  const { data: allFiles = [], isLoading: filesLoading } = useAllFiles();
  const { deleteFile, renameFile, downloadFile } = useFileMutations();

  // In the current setup, allFiles are appended chronologically, so reverse gives the newest first.
  const recentFiles = [...allFiles].reverse();

  const handleFileDelete = async (file: FileNode) => {
    try {
      await deleteFile({ id: file.id, folderId: file.folderId });
      toast.success(`"${file.name}" deleted`);
    } catch (err: unknown) {
      toast.error("Failed to delete file");
    }
  };

  const handleFileRename = async (file: FileNode, newName: string) => {
    try {
      await renameFile({ id: file.id, newName });
      toast.success(`Renamed to "${newName}"`);
    } catch (err: unknown) {
      toast.error("Failed to rename file");
      throw err;
    }
  };

  const handleFileDownload = (file: FileNode) => {
    downloadFile(file.id);
  };

  return (
    <div className="relative min-h-full animate-in fade-in duration-500 pb-20 space-y-8">
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          Recent Files
        </h1>
        <p className="text-muted-foreground text-sm ml-1">
          View all your recently uploaded files across your drive.
        </p>
      </div>

      <section>
        {filesLoading ? (
          <SkeletonGrid count={12} type="file" />
        ) : recentFiles.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl p-16 text-center text-muted-foreground mt-8 bg-gray-50/50">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20 text-gray-500" />
            <p className="font-medium text-base text-gray-700">No recent files</p>
            <p className="text-sm mt-1">Files you upload will appear here.</p>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <FileGrid
              files={recentFiles}
              onDelete={handleFileDelete}
              onDownload={handleFileDownload}
              onRename={handleFileRename}
            />
          </div>
        )}
      </section>
    </div>
  );
};
