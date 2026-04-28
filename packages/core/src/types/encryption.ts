export type EncryptionType = "context" | "metadata";

export interface TempEncryptedData {
    token: string;
    type: EncryptionType;
    data: string;
}
