import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "../services/aiService";
import type {
  AnalysisResult,
  CreateConversationRequest,
  MoveFilesRequest,
} from "../types/ai";

// ── Query Keys ──────────────────────────────────────────────────────────────
export const aiKeys = {
  cachedAnalysis: (fileId: number) => ["ai", "analysis", fileId] as const,
  conversation: (id: string) => ["ai", "conversation", id] as const,
  userConversations: (userId: string) =>
    ["ai", "conversations", "user", userId] as const,
  availableFolders: () => ["ai", "available-folders"] as const,
  folderFiles: (folderId: number) => ["ai", "folder-files", folderId] as const,
};

// ── Query Hooks ──────────────────────────────────────────────────────────────

/**
 * Fetch cached AI analysis for a specific file.
 * Only runs when fileId is provided.
 */
export const useCachedAnalysis = (fileId: number | null) => {
  return useQuery({
    queryKey: aiKeys.cachedAnalysis(fileId!),
    queryFn: () => aiService.getCachedAnalysis(fileId!),
    enabled: fileId !== null && fileId !== undefined,
    retry: false, // 404 is expected when no cache exists — don't retry
  });
};

/**
 * Fetch a full conversation with all messages.
 */
export const useConversation = (id: string | null) => {
  return useQuery({
    queryKey: aiKeys.conversation(id!),
    queryFn: () => aiService.getConversation(id!),
    enabled: !!id,
  });
};

/**
 * Fetch all conversations for a given user.
 */
export const useUserConversations = (userId: string | null) => {
  return useQuery({
    queryKey: aiKeys.userConversations(userId!),
    queryFn: () => aiService.getUserConversations(userId!),
    enabled: !!userId,
  });
};

/**
 * Fetch all available folders for file-move operations.
 */
export const useAvailableFolders = () => {
  return useQuery({
    queryKey: aiKeys.availableFolders(),
    queryFn: aiService.getAvailableFolders,
  });
};

/**
 * Fetch all files within a specific folder via the AI service.
 */
export const useFolderFilesFromAI = (folderId: number | null) => {
  return useQuery({
    queryKey: aiKeys.folderFiles(folderId!),
    queryFn: () => aiService.getFolderFiles(folderId!),
    enabled: folderId !== null && folderId !== undefined,
  });
};

// ── Mutation Hook ────────────────────────────────────────────────────────────

/**
 * All AI mutation operations grouped for convenience.
 */
export const useAIMutations = () => {
  const queryClient = useQueryClient();

  // Analyze a file (full analysis)
  const analyzeFileMutation = useMutation({
    mutationFn: ({
      file,
      userId,
      folderId,
    }: {
      file: File;
      userId?: string;
      folderId?: number | null;
    }) => aiService.analyzeFile(file, userId, folderId),
    onSuccess: (data: AnalysisResult) => {
      if (data.fileId) {
        queryClient.invalidateQueries({
          queryKey: aiKeys.cachedAnalysis(data.fileId),
        });
      }
    },
  });

  // Quick summary
  const getQuickSummaryMutation = useMutation({
    mutationFn: (file: File) => aiService.getQuickSummary(file),
  });

  // Batch analyze
  const batchAnalyzeMutation = useMutation({
    mutationFn: (fileIds: number[]) => aiService.batchAnalyze(fileIds),
  });

  // Create conversation
  const createConversationMutation = useMutation({
    mutationFn: (req: CreateConversationRequest) =>
      aiService.createConversation(req),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.userConversations(vars.userId),
      });
    },
  });

  // Send message
  const sendMessageMutation = useMutation({
    mutationFn: ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) =>
      aiService.sendMessage(conversationId, { message, type: "user" }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.conversation(vars.conversationId),
      });
    },
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: ({ id }: { id: string; userId: string }) =>
      aiService.deleteConversation(id),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: aiKeys.userConversations(vars.userId),
      });
    },
  });

  // Move files
  const moveFilesMutation = useMutation({
    mutationFn: (req: MoveFilesRequest) => aiService.moveFiles(req),
  });

  // Move folder to AI
  const moveFolderToAiMutation = useMutation({
    mutationFn: (folderId: number) => aiService.moveFolderToAi(folderId),
  });

  return {
    analyzeFile: analyzeFileMutation.mutateAsync,
    isAnalyzing: analyzeFileMutation.isPending,
    getQuickSummary: getQuickSummaryMutation.mutateAsync,
    isSummarizing: getQuickSummaryMutation.isPending,
    batchAnalyze: batchAnalyzeMutation.mutateAsync,
    isBatchAnalyzing: batchAnalyzeMutation.isPending,
    createConversation: createConversationMutation.mutateAsync,
    isCreatingConversation: createConversationMutation.isPending,
    sendMessage: sendMessageMutation.mutateAsync,
    isSendingMessage: sendMessageMutation.isPending,
    deleteConversation: deleteConversationMutation.mutateAsync,
    isDeletingConversation: deleteConversationMutation.isPending,
    moveFiles: moveFilesMutation.mutateAsync,
    isMovingFiles: moveFilesMutation.isPending,
    moveFolderToAi: moveFolderToAiMutation.mutateAsync,
    isMovingFolder: moveFolderToAiMutation.isPending,
  };
};
