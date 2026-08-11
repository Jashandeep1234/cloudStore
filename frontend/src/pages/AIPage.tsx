import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Upload,
  FileText,
  MessageSquare,
  Loader2,
  Trash2,
  Plus,
  Bot,
  CloudUpload,
  Wand2,
  Clock,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnalysisPanel } from "@/components/ai/AnalysisPanel";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { DeleteConfirmDialog } from "@/components/common/DeleteConfirmDialog";
import { useUserConversations, useAIMutations } from "@/hooks/useAI";
import { formatDate } from "@/utils/formatters";
import { toast } from "sonner";
import type { AnalysisResult, AnalysisSummary, ConversationSummary } from "@/types/ai";

const DEFAULT_USER_ID = import.meta.env.VITE_DEFAULT_USER_ID ?? "user1";

// ── Drop-zone component ──────────────────────────────────────────────────────
interface DropZoneProps {
  onFile: (file: File) => void;
  isLoading: boolean;
  mode: "full" | "quick";
}

const DropZone = ({ onFile, isLoading, mode }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isLoading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200 select-none ${isDragging
          ? "border-violet-400 bg-violet-50 dark:bg-violet-500/10 scale-[1.01]"
          : "border-border/60 hover:border-violet-300 hover:bg-muted/30"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.bmp,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />

      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-violet-100 dark:bg-violet-500/20" : "bg-muted"
          }`}
      >
        {isLoading ? (
          <Loader2 className="w-7 h-7 text-violet-500 animate-spin" />
        ) : isDragging ? (
          <CloudUpload className="w-7 h-7 text-violet-500" />
        ) : (
          <Upload className="w-7 h-7 text-muted-foreground" />
        )}
      </div>

      <div className="text-center">
        <p className="font-semibold text-sm">
          {isLoading
            ? mode === "full"
              ? "Analyzing with Gemini AI…"
              : "Generating summary…"
            : "Drop a file here, or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, DOCX, XLSX, TXT, images — up to 50 MB
        </p>
      </div>
    </div>
  );
};

// ── Conversation list item ───────────────────────────────────────────────────
interface ConvItemProps {
  conv: ConversationSummary;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

const ConvItem = ({ conv, isActive, onClick, onDelete }: ConvItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isActive
        ? "bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30"
        : "hover:bg-muted/50"
      }`}
    onClick={onClick}
  >
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive
          ? "bg-violet-100 dark:bg-violet-500/20 text-violet-600"
          : "bg-muted text-muted-foreground"
        }`}
    >
      <MessageSquare className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{conv.title || "Untitled"}</p>
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
        <Clock className="w-3 h-3" />
        {formatDate(conv.createdAt)}
        {conv.messages?.length > 0 && (
          <span className="ml-1">· {conv.messages.length} msg{conv.messages.length !== 1 ? "s" : ""}</span>
        )}
      </p>
    </div>
    <button
      onClick={(e) => { e.stopPropagation(); onDelete(); }}
      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-all"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </motion.div>
);

// ── Main page ────────────────────────────────────────────────────────────────
export const AIPage = () => {
  const [analysisMode, setAnalysisMode] = useState<"full" | "quick">("full");
  const [analysisResult, setAnalysisResult] = useState<
    AnalysisResult | AnalysisSummary | null
  >(null);

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ConversationSummary | null>(null);

  const { data: conversations = [], isLoading: convsLoading } =
    useUserConversations(DEFAULT_USER_ID);

  const {
    analyzeFile,
    isAnalyzing,
    getQuickSummary,
    isSummarizing,
    createConversation,
    isCreatingConversation,
    deleteConversation,
  } = useAIMutations();

  const isAnalysisLoading = analysisMode === "full" ? isAnalyzing : isSummarizing;

  const handleFile = async (file: File) => {
    try {
      if (analysisMode === "full") {
        const result = await analyzeFile({ file, userId: DEFAULT_USER_ID });
        setAnalysisResult(result);
      } else {
        const result = await getQuickSummary(file);
        setAnalysisResult(result);
      }
    } catch {
      toast.error("Analysis failed. Make sure the AI service is running on port 8084.");
    }
  };

  const handleStartChat = async () => {
    try {
      const fullResult = analysisResult as AnalysisResult;
      const fileIds = fullResult?.fileId ? [fullResult.fileId] : [];
      const res = await createConversation({
        userId: DEFAULT_USER_ID,
        fileIds,
        title: `Chat about ${analysisResult?.fileName ?? "document"}`,
      });
      setActiveConversationId(res.conversationId);
    } catch {
      toast.error("Failed to create conversation.");
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteTarget) return;
    try {
      await deleteConversation({ id: deleteTarget.id, userId: DEFAULT_USER_ID });
      if (activeConversationId === deleteTarget.id) {
        setActiveConversationId(null);
      }
      toast.success("Conversation deleted");
    } catch {
      toast.error("Failed to delete conversation");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-violet-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Analysis</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-12">
          Analyze documents with Gemini AI and chat about your files.
        </p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="h-10 bg-muted/50 p-1 rounded-xl w-fit">
          <TabsTrigger
            value="analyze"
            className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg px-4"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Analyze
          </TabsTrigger>
          <TabsTrigger
            value="conversations"
            className="gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg px-4"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Conversations
            {conversations.length > 0 && (
              <span className="ml-1 bg-violet-100 dark:bg-violet-500/20 text-violet-600 text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                {conversations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Analyze Tab ── */}
        <TabsContent value="analyze" className="space-y-5 mt-0">
          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium">Mode:</span>
            <div className="flex rounded-xl border border-border/60 overflow-hidden p-0.5 bg-muted/30">
              {(["full", "quick"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setAnalysisMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${analysisMode === m
                      ? "bg-white dark:bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {m === "full" ? (
                    <><FileText className="w-3.5 h-3.5" /> Full Analysis</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" /> Quick Summary</>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <DropZone onFile={handleFile} isLoading={isAnalysisLoading} mode={analysisMode} />

          {/* Result */}
          <AnimatePresence>
            {analysisResult && !isAnalysisLoading && (
              <AnalysisPanel
                result={analysisResult}
                onStartChat={analysisMode === "full" ? handleStartChat : undefined}
                isStartingChat={isCreatingConversation}
              />
            )}
          </AnimatePresence>
        </TabsContent>

        {/* ── Conversations Tab ── */}
        <TabsContent value="conversations" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 min-h-[520px]">
            {/* Sidebar list */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Chats
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1 text-xs"
                  onClick={async () => {
                    try {
                      const res = await createConversation({
                        userId: DEFAULT_USER_ID,
                        title: "New Conversation",
                      });
                      setActiveConversationId(res.conversationId);
                    } catch {
                      toast.error("Failed to create conversation");
                    }
                  }}
                >
                  <Plus className="w-3 h-3" />
                  New
                </Button>
              </div>

              {convsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium">No conversations yet</p>
                  <p className="text-xs mt-1">
                    Analyze a file to start chatting
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      isActive={activeConversationId === conv.id}
                      onClick={() => setActiveConversationId(conv.id)}
                      onDelete={() => setDeleteTarget(conv)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Chat area */}
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden flex flex-col min-h-[520px]">
              {activeConversationId ? (
                <ChatPanel
                  key={activeConversationId}
                  conversationId={activeConversationId}
                  userId={DEFAULT_USER_ID}
                  onDeleted={() => setActiveConversationId(null)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-30" />
                  </div>
                  <p className="font-semibold text-base">Select a conversation</p>
                  <p className="text-sm mt-1">
                    Or analyze a file to start a new AI chat
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete conversation confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        itemName={deleteTarget?.title ?? "this conversation"}
        onConfirm={handleDeleteConversation}
      />
    </div>
  );
};
