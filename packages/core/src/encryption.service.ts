import crypto from "crypto";
import { EncryptionRepository } from "./storage";
import { TempFile } from "./types";

export class EncryptionService {
    constructor(
        private encryptionRepo: EncryptionRepository
    ) {}

    private key = crypto.createHash("sha256").update("imshu").digest();

    generateSmartName(name: TempFile["name"], appsContext: string) {

        const appEnc = this.encrypt(JSON.stringify(appsContext))

        const smartName = `${name}_${appEnc}`

        this.encryptionRepo.save(appEnc.token, appEnc.encrypted)

        return smartName;
    }

    private encrypt(data: string) {
        const token = crypto
            .createHash("sha256")
            .update(data)
            .digest("base64url")
            .slice(0, 8);

        const iv = Buffer.alloc(16, 0);
        const cipher = crypto.createCipheriv("aes-256-ctr", this.key, iv);

        let encrypted = cipher.update(data, "utf8", "base64url");
        encrypted += cipher.final("base64url");

        return {token, encrypted}
    }
}
