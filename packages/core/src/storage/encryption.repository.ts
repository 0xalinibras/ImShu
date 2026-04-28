import { db } from "./db"
import { EncryptionType, TempEncryptedData } from "../types/encryption"

export class EncryptionRepository {
    save(token: string, type: EncryptionType, data: string) {
        db.prepare(`
            INSERT INTO temp_encrypted (token, type, data)
            VALUES (?, ?, ?)
        `).run(token, type, data);
    }

    get(token: string): TempEncryptedData | undefined {
        return db.prepare(`
            SELECT * FROM temp_encrypted WHERE token = ?
        `).get(token) as TempEncryptedData | undefined;
    }

    delete(token: string) {
        db.prepare(`
            DELETE FROM temp_encrypted WHERE token = ?
        `).run(token);
    }

    getByType(type: EncryptionType): TempEncryptedData[] {
        return db.prepare(`
            SELECT * FROM temp_encrypted WHERE type = ?
        `).all(type) as TempEncryptedData[];
    }
}
