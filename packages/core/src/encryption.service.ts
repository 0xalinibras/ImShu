import crypto from "crypto";

export class EncryptionService {
    private key = crypto.createHash("sha256").update("imshu").digest();

    encrypt(data: string) {
        const token = crypto
            .createHash("sha256")
            .update(data)
            .digest("base64url")
            .slice(0, 5);

        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv("aes-256-ctr", this.key, iv);

        let encrypted = cipher.update(data, "utf8", "base64url");
        encrypted += cipher.final("base64url");

        return { token, encrypted };
    }
}
