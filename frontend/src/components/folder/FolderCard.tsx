import { useState } from "react";
import { Folder } from "@/types/folder";
import { Folder as FolderIcon, MoreVertical, Pencil, Trash, ChevronRight, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/formatters";
import { RenameDialog } from "@/components/common/RenameDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useAIMutations } from "@/hooks/useAI";
import { toast } from "sonner";

interface FolderCardProps {
  folder: Folder;
  onClick?: (folder: Folder) => void;
  onDoubleClick?: (folder: Folder) => void;
  onDelete?: (folder: Folder) => Promise<void>;
  onRename?: (folder: Folder, newName: string) => Promise<void>;
}

export const FolderCard = ({
  folder,
  onClick,
  onDoubleClick,
  onDelete,
  onRename,
}: FolderCardProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { moveFolderToAi, isMovingFolder } = useAIMutations();

  const handleSendToAI = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await moveFolderToAi(folder.id);
      toast.success(`Folder "${folder.name}" sent to AI for analysis`);
    } catch {
      toast.error("Failed to send folder to AI. Check the AI service is running.");
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div
          className="group relative flex items-center p-4 gap-3 cursor-pointer rounded-2xl border border-border/50 bg-card hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200"
          onClick={() => onClick?.(folder)}
          onDoubleClick={() => onDoubleClick?.(folder)}
        >
          {/* Folder icon */}
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <FolderIcon className="w-5 h-5 fill-current" />
          </div>

          {/* Name + date */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate text-gray-900" title={folder.name}>
              {folder.name}
            </h3>
            {folder.createdAt && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(folder.createdAt)}
              </p>
            )}
          </div>

          {/* Open chevron */}
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-400 shrink-0 transition-colors opacity-0 group-hover:opacity-100" />

          {/* Context menu */}
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onClick?.(folder);
                  }}
                >
                  <FolderIcon className="w-4 h-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsRenameOpen(true);
                  }}
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSendToAI}
                  disabled={isMovingFolder}
                  className="text-violet-600 focus:text-violet-600 focus:bg-violet-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isMovingFolder ? "Sending…" : "Send to AI"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsDeleteOpen(true);
                  }}
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      <RenameDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        currentName={folder.name}
        title="Rename Folder"
        onSubmit={(newName) => onRename?.(folder, newName) ?? Promise.resolve()}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={folder.name}
        onConfirm={() => onDelete?.(folder) ?? Promise.resolve()}
      />
    </>
  );
};
