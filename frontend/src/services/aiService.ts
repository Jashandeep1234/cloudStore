import { aiClient } from "../api/aiAxios";
import type {
  AnalysisResult,
  AnalysisSummary,
  BatchAnalysisItem,
  Conversation,
  ConversationSummary,
  CreateConversationRequest,
  CreateConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  MoveFilesRequest,
  MoveFilesResponse,
  FolderWithCount,
  MoveFolderToAiResponse,
  AIFileItem,
} from "../types/ai";

export const aiService = {
  // ── Analysis ────────────────────────────────────────────────────────────────

  /**
   * POST /analyze
   * Upload and fully analyze a single file.
   */
  analyzeFile: async (
    file: File,
    userId?: string,
    folderId?: number | null
  ): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append("file", file);
    if (userId) formData.append("userId", userId);
    if (folderId != null) formData.append("folderId", folderId.toString());

    const response = await aiClient.post<AnalysisResult>("/analyze", formData);
    return response.data;
  },

  /**
   * POST /analyze/summary
   * Get a lightweight AI summary of a file.
   */
  getQuickSummary: async (file: File): Promise<AnalysisSummary> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await aiClient.post<AnalysisSummary>(
      "/analyze/summary",
      formData
    );
    return response.data;
  },

  /**
   * POST /analyze/batch
   * Analyze multiple files by their IDs (uses cached summaries when available).
   */
  batchAnalyze: async (fileIds: number[]): Promise<BatchAnalysisItem[]> => {
    const response = await aiClient.post<BatchAnalysisItem[]>(
      "/analyze/batch",
      fileIds
    );
    return response.data;
  },

  /**
   * GET /analysis/{fileId}
   * Retrieve cached analysis/summary for a specific file.
   */
  getCachedAnalysis: async (fileId: number): Promise<AnalysisResult> => {
    const response = await aiClient.get<AnalysisResult>(`/analyze/${fileId}`);
    return response.data;
  },

  // ── Conversations ────────────────────────────────────────────────────────────

  /**
   * POST /conversations
   * Create a new conversation session.
   */
  createConversation: async (
    req: CreateConversationRequest
  ): Promise<CreateConversationResponse> => {
    const response = await aiClient.post<CreateConversationResponse>(
      "/conversations",
      req
    );
    return response.data;
  },

  /**
   * GET /conversations/{conversationId}
   * Get full conversation with all messages.
   */
  getConversation: async (id: string): Promise<Conversation> => {
    const response = await aiClient.get<Conversation>(`/conversations/${id}`);
    return response.data;
  },

  /**
   * POST /conversations/{conversationId}/messages
   * Send a message and receive the AI response.
   */
  sendMessage: async (
    conversationId: string,
    req: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await aiClient.post<SendMessageResponse>(
      `/conversations/${conversationId}/messages`,
      req
    );
    return response.data;
  },

  /**
   * DELETE /conversations/{conversationId}
   * Delete a conversation and all its messages.
   */
  deleteConversation: async (id: string): Promise<void> => {
    await aiClient.delete(`/conversations/${id}`);
  },

  /**
   * GET /conversations/users/{userId}
   * Get all conversations for a user.
   */
  getUserConversations: async (
    userId: string
  ): Promise<ConversationSummary[]> => {
    const response = await aiClient.get<ConversationSummary[]>(
      `/conversations/users/${userId}`
    );
    return response.data;
  },

  // ── File Movement ────────────────────────────────────────────────────────────

  /**
   * POST /files/move
   * Move files from one folder to another.
   */
  moveFiles: async (req: MoveFilesRequest): Promise<MoveFilesResponse> => {
    const response = await aiClient.post<MoveFilesResponse>("/files/move", req);
    return response.data;
  },

  /**
   * GET /files/available-folders
   * Get all folders available for file movement.
   */
  getAvailableFolders: async (): Promise<FolderWithCount[]> => {
    const response = await aiClient.get<FolderWithCount[]>(
      "/files/available-folders"
    );
    return response.data;
  },

  /**
   * POST /files/folders/to-ai
   * Move an entire folder to the AI service for batch analysis.
   */
  moveFolderToAi: async (
    folderId: number
  ): Promise<MoveFolderToAiResponse> => {
    const response = await aiClient.post<MoveFolderToAiResponse>(
      "/files/folders/to-ai",
      { folderId }
    );
    return response.data;
  },

  /**
   * GET /files/folders/{folderId}/files
   * Get all files within a specific folder via the AI service.
   */
  getFolderFiles: async (folderId: number): Promise<AIFileItem[]> => {
    const response = await aiClient.get<AIFileItem[]>(
      `/files/folders/${folderId}/files`
    );
    return response.data;
  },
};
