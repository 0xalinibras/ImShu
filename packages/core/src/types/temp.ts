export type TempStatus = "temp" | "saved" | "archived";

export type TempFile = {
  id: string;
  name: string;
  ext: string;
  dirPath: string;
  createdAt: number;
  expiresAt: number;
  tags: string[];
  status: TempStatus;
};
