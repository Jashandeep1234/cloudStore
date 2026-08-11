import { FileNode } from "@/types/file";
import { FileCard } from "./FileCard";

interface FileGridProps {
  files: FileNode[];
  onDownload?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => Promise<void>;
  onRename?: (file: FileNode, newName: string) => Promise<void>;
}

export const FileGrid = ({ files, onDownload, onDelete, onRename }: FileGridProps) => {
  if (files.length === 0) {
    return (
      <div className="py-16 text-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
        <p className="text-base font-medium">No files here</p>
        <p className="text-sm mt-1">Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onDownload={onDownload}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </div>
  );
};
