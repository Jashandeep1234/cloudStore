export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt?: string;
}
