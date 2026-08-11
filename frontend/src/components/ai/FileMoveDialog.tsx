import { useState } from "react";
import { motion } from "framer-motion";
import {
  Folder as FolderIcon,
  Loader2,
  Check,
  MoveRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAvailableFolders, useAIMutations } from "@/hooks/useAI";
import { toast } from "sonner";

interface FileMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileIds: number[];
  onMoved?: () => void;
}

export const FileMoveDialog = ({
  open,
  onOpenChange,
  fileIds,
  onMoved,
}: FileMoveDialogProps) => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const { data: folders = [], isLoading: foldersLoading } =
    useAvailableFolders();
  const { moveFiles, isMovingFiles } = useAIMutations();

  const handleMove = async () => {
    if (!selectedFolderId) return;
    try {
      const result = await moveFiles({
        fileIds,
        targetFolderId: selectedFolderId,
      });
      toast.success(
        `${result.movedCount} file${result.movedCount !== 1 ? "s" : ""} moved successfully`
      );
      onOpenChange(false);
      onMoved?.();
      setSelectedFolderId(null);
    } catch {
      toast.error("Failed to move files. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveRight className="w-4 h-4 text-violet-500" />
            Move {fileIds.length} File{fileIds.length !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-3">
            Select a destination folder:
          </p>

          {foldersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : folders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No folders available
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/30">
              {folders.map((folder, i) => (
                <motion.button
                  key={folder.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() =>
                    setSelectedFolderId(
                      selectedFolderId === folder.id ? null : folder.id
                    )
                  }
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${selectedFolderId === folder.id ? "bg-violet-50 dark:bg-violet-500/10" : ""
                    }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selectedFolderId === folder.id
                        ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600"
                        : "bg-blue-50 dark:bg-blue-500/10 text-blue-500"
                      }`}
                  >
                    <FolderIcon className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {folder.fileCount} file{folder.fileCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {selectedFolderId === folder.id && (
                    <Check className="w-4 h-4 text-violet-600 shrink-0" />
                  )}
                </motion.button>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={!selectedFolderId || isMovingFiles}
            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isMovingFiles ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoveRight className="w-4 h-4" />
            )}
            {isMovingFiles ? "Moving…" : "Move Files"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
