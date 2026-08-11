import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, File as FileIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/utils/formatters";
 
interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: number | null;
  onUpload: (file: File, folderId: number | null, name: string) => Promise<void>;
  isUploading: boolean;
}
 
export const UploadDialog = ({
  open,
  onOpenChange,
  folderId,
  onUpload,
  isUploading,
}: UploadDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
 
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
 
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
 
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };
 
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
 
  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      // Pass file, folderId, and custom name (or use original filename)
      await onUpload(selectedFile, folderId, customName || selectedFile.name);
      setSelectedFile(null);
      setCustomName("");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };
 
  const handleCloseDialog = (val: boolean) => {
    if (!isUploading) {
      onOpenChange(val);
      if (!val) {
        setSelectedFile(null);
        setCustomName("");
      }
    }
  };
 
  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>
            Drag and drop your file here or click to browse.
          </DialogDescription>
        </DialogHeader>
 
        {!selectedFile ? (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-secondary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium mb-1">
              Click or drag file to this area to upload
            </h3>
            <p className="text-sm text-muted-foreground">
              Support for a single or bulk upload.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* File Preview */}
            <div className="flex items-center gap-4 p-4 border rounded-xl">
              <div className="bg-secondary p-3 rounded-lg">
                <FileIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{selectedFile.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(selectedFile.size)}
                </p>
              </div>
              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </Button>
              )}
            </div>
 
            {/* Custom Name Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                File Name (optional)
              </label>
              <input
                type="text"
                placeholder="Leave empty to use original filename"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
 
            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Uploading...</span>
                  <span className="font-medium">Please wait</span>
                </div>
                <Progress value={undefined} className="h-2" />
              </div>
            )}
 
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => handleCloseDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Start Upload"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
