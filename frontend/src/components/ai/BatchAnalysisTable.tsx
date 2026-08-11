import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { aiService } from "@/services/aiService";
import { formatDate } from "@/utils/formatters";
import type { BatchAnalysisItem } from "@/types/ai";

interface BatchAnalysisTableProps {
  fileIds: number[];
}

const StatusCell = ({ status }: { status: BatchAnalysisItem["status"] }) => {
  if (status === "COMPLETED")
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium text-xs">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Completed
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-500 font-medium text-xs">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Processing…
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-red-500 font-medium text-xs">
      <AlertCircle className="w-3.5 h-3.5" />
      Failed
    </span>
  );
};

export const BatchAnalysisTable = ({ fileIds }: BatchAnalysisTableProps) => {
  const hasPending = (data: BatchAnalysisItem[] | undefined) =>
    data?.some((item) => item.status === "PENDING") ?? false;

  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["ai", "batch", fileIds],
    queryFn: () => aiService.batchAnalyze(fileIds),
    enabled: fileIds.length > 0,
    refetchInterval: (query) =>
      hasPending(query.state.data) ? 5000 : false,
  });

  // Force immediate refetch when fileIds change
  useEffect(() => {
    if (fileIds.length > 0) refetch();
  }, [fileIds, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        Analyzing files…
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
        <p className="font-medium">No results</p>
      </div>
    );
  }

  const completed = data.filter((d) => d.status === "COMPLETED").length;

  return (
    <div className="space-y-3">
      {/* Progress summary */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {completed} of {data.length} complete
        </span>
        {hasPending(data) && (
          <span className="flex items-center gap-1 text-amber-500">
            <Loader2 className="w-3 h-3 animate-spin" />
            Auto-refreshing…
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(completed / data.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border/40">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                File
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Summary
              </th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((item, i) => (
              <motion.tr
                key={item.fileId}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-3 font-medium truncate max-w-[140px]">
                  {item.fileName ?? `File #${item.fileId}`}
                </td>
                <td className="px-4 py-3">
                  <StatusCell status={item.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell max-w-xs truncate">
                  {item.summary ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
