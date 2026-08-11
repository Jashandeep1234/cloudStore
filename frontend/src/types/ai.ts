// ─────────────────────────────────────────────
// AI Service — TypeScript types
// ─────────────────────────────────────────────

// ── Analysis ──────────────────────────────────

export type AnalysisStatus = "COMPLETED" | "PENDING" | "FAILED";

export interface FileMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  extension: string;
  contentType: string;
}

export interface AnalysisResult {
  id: string;
  fileId: number | null;
  fileName: string;
  fileType: string;
  summary: string;
  status: AnalysisStatus;
  modelUsed: string | null;
  tokensUsed: number | null;
  analysis: string | null;
  fileMetadata: FileMetadata | null;
  createdAt: string;
}

export interface AnalysisSummary {
  id: string;
  status: AnalysisStatus;
  summary: string;
  fileName: string;
  createdAt: string;
}

export interface BatchAnalysisItem {
  id?: string;
  fileId: number;
  fileName?: string;
  summary?: string;
  status: AnalysisStatus;
  modelUsed?: string;
  createdAt: string;
}

// ── Conversations ──────────────────────────────

export interface Message {
  id: string;
  userMessage: string;
  aiResponse: string;
  tokensUsed: number | null;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  folderId: number | null;
  title: string;
  status: "ACTIVE" | "CLOSED";
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  userId: string;
  folderId: number | null;
  title: string;
  status: "ACTIVE" | "CLOSED";
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  userId: string;
  fileIds?: number[];
  folderId?: number | null;
  title?: string;
}

export interface SendMessageRequest {
  message: string;
  type: "user";
}

export interface SendMessageResponse {
  messageId: string;
  userMessage: string;
  aiResponse: string;
  timestamp: string;
}

export interface CreateConversationResponse {
  conversationId: string;
  userId: string;
  folderId: number | null;
  title: string;
  status: "ACTIVE" | "CLOSED";
  createdAt: string;
}

// ── File Movement ──────────────────────────────

export interface MoveFilesRequest {
  fileIds: number[];
  targetFolderId: number;
}

export interface MoveFilesResponse {
  success: boolean;
  movedCount: number;
  errors: number;
}

export interface FolderWithCount {
  id: number;
  name: string;
  parentId: number | null;
  fileCount: number;
}

export interface MoveFolderToAiResponse {
  success: boolean;
  folderId: number;
}

export interface AIFileItem {
  id: number;
  name: string;
  type: string;
  size: number;
  folderId: number;
}

// ── Error ──────────────────────────────────────

export interface AIError {
  status: number;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}
