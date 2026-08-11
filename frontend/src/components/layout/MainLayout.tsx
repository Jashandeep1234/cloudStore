import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { DriveProvider, useDrive } from "@/context/DriveContext";
import { UploadDialog } from "@/components/upload/UploadDialog";
import { CreateFolderDialog } from "@/components/folder/CreateFolderDialog";
import { useFileMutations } from "@/hooks/useFiles";
import { useFolderMutations } from "@/hooks/useFolders";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Inner layout that has access to DriveContext.
 */
const LayoutInner = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);

  const { currentFolderId, triggerRefresh } = useDrive();
  const { uploadFile, isUploading } = useFileMutations();
  const { createFolder } = useFolderMutations();

  const handleUpload = async (file: File) => {
    try {
      await uploadFile({ name: file.name, folderId: currentFolderId, file });
      toast.success(`"${file.name}" uploaded successfully`);
      triggerRefresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Upload failed";
      toast.error(msg);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder({ name, parentId: currentFolderId });
      toast.success(`Folder "${name}" created`);
      triggerRefresh();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create folder";
      toast.error(msg);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Drawer — animated */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="relative z-50 h-full shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
            >
              <Sidebar className="flex w-[240px] h-full" />
              {/* Close button */}
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-[-44px] w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md text-gray-600 hover:bg-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onUploadClick={() => setIsUploadOpen(true)}
          onNewFolderClick={() => setIsCreateFolderOpen(true)}
        />
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global dialogs */}
      <UploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        folderId={currentFolderId}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
};

export const MainLayout = () => {
  return (
    <DriveProvider>
      <LayoutInner />
    </DriveProvider>
  );
};
