import { db } from "./db";
import type { TempFile, TempStatus } from "../types";

export class TempRepository {
    create(temp: TempFile) {
        db.prepare(`INSERT INTO temps (id, name, ext, dirPath, createdAt, expiresAt, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
            .run(temp.id, temp.name, temp.ext, temp.dirPath, temp.createdAt, temp.expiresAt, JSON.stringify(temp.tags), temp.status);
    }

    delete(id: TempFile["id"]) {
        db.prepare(`DELETE FROM temps WHERE id = ?`).run(id);
    }

    findById(id: TempFile["id"]): TempFile | undefined {
        const row = db.prepare(`SELECT * FROM temps WHERE id = ?`).get(id) as (Omit<TempFile, "tags"> & { tags: string }) | undefined;
        if (!row) return undefined;
        return mapTemp(row);
    }

    findAll(): TempFile[] {
        const rows = db.prepare(`SELECT * FROM temps`).all() as (Omit<TempFile, "tags"> & { tags: string })[];
        return rows.map(row => mapTemp(row));
    }

    update(id: TempFile["id"], updates: Partial<Omit<TempFile, "id">>) {
        const temp = this.findById(id);
        if (!temp) throw new Error("Temp file not found");

        const updatedTemp = { ...temp, ...updates };
        db.prepare(`UPDATE temps SET name = ?, ext = ?, dirPath = ?, createdAt = ?, expiresAt = ?, tags = ?, status = ? WHERE id = ?`)
            .run(updatedTemp.name, updatedTemp.ext, updatedTemp.dirPath, updatedTemp.createdAt, updatedTemp.expiresAt, JSON.stringify(updatedTemp.tags), updatedTemp.status, id);
    }
}

function mapTemp(row: any): TempFile {
    return {
        id: row.id,
        name: row.name,
        ext: row.ext,
        dirPath: row.dirPath,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        tags: JSON.parse(row.tags),
        status: row.status
    };
}
