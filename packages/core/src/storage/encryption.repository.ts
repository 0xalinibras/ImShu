import { db } from "./db"
import { TempEncryptedData } from "../types/encryption"

export class EncryptionRepository {
    save(token: string, data: string) {
        db.prepare(`
            INSERT INTO temp_encrypted (token, data)
            VALUES (?, ?)
        `).run(token, data);
    }

    get(token: string): TempEncryptedData | undefined {
        return db.prepare(`
            SELECT * FROM temp_encrypted WHERE token = ?
        `).get(token) as TempEncryptedData | undefined;
    }

    exists(token: string): boolean {
        return db.prepare(`
            SELECT * FROM temp_encrypted WHERE token = ?
        `).get(token) != null;
    }

    delete(token: string) {
        db.prepare(`
            DELETE FROM temp_encrypted WHERE token = ?
        `).run(token);
    }
}
