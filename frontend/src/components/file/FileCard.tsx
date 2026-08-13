import { useState } from "react";
import { FileNode } from "@/types/file";
import {
  File as FileIcon,
  MoreVertical,
  Download,
  Trash,
  Pencil,
  Image,
  FileText,
  Film,
  Music,
  Archive,
  Code,
  FileSpreadsheet,
  Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnalysisPanel } from "@/components/ai/AnalysisPanel";
import { useAIMutations } from "@/hooks/useAI";
import { fileService } from "@/services/fileService";
import { toast } from "sonner";
import type { AnalysisResult } from "@/types/ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { formatBytes, formatDate } from "@/utils/formatters";
import { RenameDialog } from "@/components/common/RenameDialog";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";

interface FileCardProps {
  file: FileNode;
  onDownload?: (file: FileNode) => void;
  onDelete?: (file: FileNode) => Promise<void>;
  onRename?: (file: FileNode, newName: string) => Promise<void>;
}

type IconConfig = {
  icon: React.ReactNode;
  bg: string;
};

const getFileIconConfig = (filename: string): IconConfig => {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext))
    return { icon: <Image className="w-6 h-6 text-blue-500" />, bg: "bg-blue-50" };
  if (["pdf"].includes(ext))
    return { icon: <FileText className="w-6 h-6 text-red-500" />, bg: "bg-red-50" };
  if (["doc", "docx", "txt", "md", "rtf"].includes(ext))
    return { icon: <FileText className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50" };
  if (["xls", "xlsx", "csv"].includes(ext))
    return { icon: <FileSpreadsheet className="w-6 h-6 text-green-600" />, bg: "bg-green-50" };
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext))
    return { icon: <Film className="w-6 h-6 text-purple-500" />, bg: "bg-purple-50" };
  if (["mp3", "wav", "ogg", "flac", "aac"].includes(ext))
    return { icon: <Music className="w-6 h-6 text-yellow-500" />, bg: "bg-yellow-50" };
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext))
    return { icon: <Archive className="w-6 h-6 text-orange-500" />, bg: "bg-orange-50" };
  if (["js", "ts", "jsx", "tsx", "py", "java", "cpp", "c", "go", "rs"].includes(ext))
    return { icon: <Code className="w-6 h-6 text-cyan-600" />, bg: "bg-cyan-50" };
  return { icon: <FileIcon className="w-6 h-6 text-slate-500" />, bg: "bg-slate-50" };
};

export const FileCard = ({ file, onDownload, onDelete, onRename }: FileCardProps) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { analyzeFile, isAnalyzing } = useAIMutations();

  const { icon, bg } = getFileIconConfig(file.name);

  const handleAnalyze = async () => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const fileObj = new File([blob], file.name, { type: blob.type });
      const result = await analyzeFile({ file: fileObj });
      setAnalysisResult(result);
      setIsAnalysisOpen(true);
    } catch {
      toast.error("Failed to analyze file. Check the AI service is running.");
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="group relative flex flex-col p-4 gap-3 cursor-pointer rounded-2xl border border-border/50 bg-card hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 h-40">
          <div className="flex justify-between items-start">
            <div className={`p-2.5 rounded-xl ${bg}`}>
              {icon}
            </div>

            {/* Menu — always visible on touch devices, hover on desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onDownload?.(file);
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
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
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleAnalyze();
                  }}
                  disabled={isAnalyzing}
                  className="text-violet-600 focus:text-violet-600 focus:bg-violet-50"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAnalyzing ? "Analyzing…" : "Analyze with AI"}
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

          <div className="mt-auto overflow-hidden">
            <h3 className="font-medium text-sm truncate text-gray-900" title={file.name}>
              {file.name}
            </h3>
            {file.originalName && file.originalName !== file.name && (
              <p className="text-xs text-muted-foreground/60 truncate">{file.originalName}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {formatBytes(file.size)}
              {file.createdAt && ` • ${formatDate(file.createdAt)}`}
            </p>
          </div>
        </div>
      </motion.div>

      <RenameDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        currentName={file.name}
        title="Rename File"
        onSubmit={(newName) => onRename?.(file, newName) ?? Promise.resolve()}
      />

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        itemName={file.name}
        onConfirm={() => onDelete?.(file) ?? Promise.resolve()}
      />

      {/* AI Analysis Result Dialog */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4 text-violet-500" />
              AI Analysis
            </DialogTitle>
          </DialogHeader>
          {analysisResult && (
            <AnalysisPanel result={analysisResult} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
