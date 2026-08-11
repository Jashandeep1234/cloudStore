import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  FileText,
  Clock,
  Cpu,
  Zap,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBytes, formatDate } from "@/utils/formatters";
import type { AnalysisResult, AnalysisSummary } from "@/types/ai";

interface AnalysisPanelProps {
  result: AnalysisResult | AnalysisSummary;
  onStartChat?: () => void;
  isStartingChat?: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "COMPLETED")
    return (
      <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/25 hover:bg-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        Completed
      </Badge>
    );
  if (status === "PENDING")
    return (
      <Badge className="gap-1 bg-amber-500/15 text-amber-600 border-amber-500/25 hover:bg-amber-500/20">
        <Loader2 className="w-3 h-3 animate-spin" />
        Pending
      </Badge>
    );
  return (
    <Badge className="gap-1 bg-red-500/15 text-red-600 border-red-500/25 hover:bg-red-500/20">
      <AlertCircle className="w-3 h-3" />
      Failed
    </Badge>
  );
};

const isFullResult = (r: AnalysisResult | AnalysisSummary): r is AnalysisResult =>
  "fileMetadata" in r || "tokensUsed" in r;

export const AnalysisPanel = ({
  result,
  onStartChat,
  isStartingChat,
}: AnalysisPanelProps) => {
  const [expanded, setExpanded] = useState(true);
  const full = isFullResult(result) ? result : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 bg-gradient-to-r from-violet-500/8 via-purple-500/5 to-transparent border-b border-border/50">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-violet-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{result.fileName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI Analysis Result
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={result.status} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded-lg hover:bg-muted/60 transition-colors text-muted-foreground"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* Meta row */}
            {full && (
              <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-3 bg-muted/30 border-b border-border/40 text-xs text-muted-foreground">
                {full.fileMetadata && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      {full.fileMetadata.fileType.toUpperCase()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {formatBytes(full.fileMetadata.fileSize)}
                    </span>
                  </>
                )}
                {full.modelUsed && (
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    {full.modelUsed}
                  </span>
                )}
                {full.tokensUsed && (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    {full.tokensUsed.toLocaleString()} tokens
                  </span>
                )}
                <span className="flex items-center gap-1.5 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDate(result.createdAt)}
                </span>
              </div>
            )}

            {/* Summary */}
            <div className="px-5 py-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Summary
              </p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {result.summary || "No summary available."}
              </p>
            </div>

            {/* Action */}
            {onStartChat && (
              <div className="px-5 pb-5">
                <Button
                  onClick={onStartChat}
                  disabled={isStartingChat}
                  className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20"
                >
                  {isStartingChat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  {isStartingChat ? "Starting chat…" : "Start AI Conversation"}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
