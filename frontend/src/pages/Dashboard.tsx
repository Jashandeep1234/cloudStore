import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HardDrive, FileText, Folder as FolderIcon, Clock, ArrowUpRight } from "lucide-react";
import { useAllFiles } from "@/hooks/useFiles";
import { useAllFolders } from "@/hooks/useFolders";
import { FileGrid } from "@/components/file/FileGrid";
import { SkeletonGrid } from "@/components/common/SkeletonGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBytes } from "@/utils/formatters";
import { useDrive } from "@/context/DriveContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";

const statCards = [
  {
    key: "storage",
    title: "Total Size",
    icon: HardDrive,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    gradient: "from-blue-500/10 to-blue-400/5",
    border: "border-blue-200/60",
  },
  {
    key: "files",
    title: "Files",
    icon: FileText,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    gradient: "from-purple-500/10 to-purple-400/5",
    border: "border-purple-200/60",
  },
  {
    key: "folders",
    title: "Folders",
    icon: FolderIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    gradient: "from-green-500/10 to-green-400/5",
    border: "border-green-200/60",
  },
  {
    key: "recent",
    title: "Recent",
    icon: Clock,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    gradient: "from-orange-500/10 to-orange-400/5",
    border: "border-orange-200/60",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export const Dashboard = () => {
  const { setCurrentFolderId } = useDrive();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setCurrentFolderId(null);
  }, [setCurrentFolderId]);

  const { data: files = [], isLoading: filesLoading } = useAllFiles();
  const { data: folders = [], isLoading: foldersLoading } = useAllFolders();

  const recentFiles = [...files].reverse().slice(0, 6);
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  const statValues: Record<string, React.ReactNode> = {
    storage: filesLoading ? <Skeleton className="h-7 w-20" /> : formatBytes(totalSize),
    files: filesLoading ? <Skeleton className="h-7 w-12" /> : files.length,
    folders: foldersLoading ? <Skeleton className="h-7 w-12" /> : folders.length,
    recent: filesLoading ? <Skeleton className="h-7 w-12" /> : recentFiles.length,
  };
  const statSubs: Record<string, string> = {
    storage: "Across all files",
    files: "Total uploaded files",
    folders: "Total folders",
    recent: "Recently added",
  };

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground text-sm">Here's an overview of your cloud storage.</p>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-4 grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statCards.map(({ key, title, icon: Icon, iconBg, iconColor, gradient, border }) => (
          <motion.div key={key} variants={cardVariants}>
            <Card className={`bg-gradient-to-br ${gradient} border ${border} hover:shadow-md transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{title}</CardTitle>
                <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold text-gray-900">{statValues[key]}</div>
                <p className="text-xs text-muted-foreground mt-1">{statSubs[key]}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Files */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold tracking-tight">Recent Files</h2>
          <button
            onClick={() => navigate("/drive")}
            className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View all
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {filesLoading ? (
          <SkeletonGrid count={6} type="file" />
        ) : recentFiles.length === 0 ? (
          <div className="border-2 border-dashed rounded-2xl p-12 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium text-sm">No files yet</p>
            <p className="text-xs mt-1">Upload your first file to get started.</p>
          </div>
        ) : (
          <FileGrid files={recentFiles} />
        )}
      </div>
    </div>
  );
};
