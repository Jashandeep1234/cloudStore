export interface FileNode {
  id: number;
  name: string;
  originalName: string;
  folderId: number | null;
  path: string;
  size: number;
  contentType?: string;
  createdAt?: string;
}
