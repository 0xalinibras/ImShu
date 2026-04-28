import { tempEvents } from "./events";
import { saveFile, deleteFile, exists, Repository } from "./storage";
import { moveFile } from "./storage/fileSystem";
import { TempFile } from "./types";
import path from "path";

export class TempService {
    constructor(private tempRepository: Repository) {}

    create(name: TempFile["name"], ext: TempFile["ext"], dirPath: TempFile["dirPath"], expiresIn: number, tags?: TempFile["tags"], content?: string) {
        try {
            const id = crypto.randomUUID();
            name = `${name}_${Date.now()}`; //TODO: send *name* to generateName()
            const createdAt: TempFile["createdAt"] = Date.now();
            const expiresAt: TempFile["expiresAt"] = createdAt + expiresIn;
            if (!content) content = "";
            const status: TempFile["status"] = "temp";

            const filePath = path.join(dirPath, `${name}.${ext}`);
            saveFile(filePath, content);

            this.tempRepository.create({id, name, ext, dirPath, createdAt, expiresAt, tags: tags || [], status});

            tempEvents.emit("temp:created");

            return filePath;
        } catch (error) {
            console.error("Error creating temp file:", error);
            throw error;
        }
    }

    delete(id: TempFile["id"]) {
        try {
            const temp = this.tempRepository.findById(id);
            if (!temp) throw new Error("Temp file not found");

            const filePath = path.join(temp.dirPath, `${temp.name}.${temp.ext}`);

            if (exists(filePath)) {
                deleteFile(filePath);
            }

            this.tempRepository.delete(id);

            tempEvents.emit("temp:deleted");
        } catch (error) {
            console.error("Error deleting temp file:", error);
            throw error;
        }
    }

    list(onlyExistingFiles: boolean = true): TempFile[] {
        const temps = this.tempRepository.findAll();
        if(onlyExistingFiles) {
            return temps.filter(temp => {
                const filePath = path.join(temp.dirPath, `${temp.name}.${temp.ext}`);
                const fileExists = exists(filePath);
                if (!fileExists) {
                    this.tempRepository.delete(temp.id);
                    tempEvents.emit("temp:deleted");
                }
                return fileExists;
            });
        } else {
            return temps;
        }
    }

    deleteExpired() {
        const now = Date.now();
        const temps = this.tempRepository.findAll();
        temps.forEach(temp => {
            if (temp.status === "temp" && temp.expiresAt <= now) {
                this.delete(temp.id);
            }
        });
    }

    promote(id: TempFile["id"], newDirPath: string, newName?: string) {
        const temp = this.tempRepository.findById(id);
        if (!temp) throw new Error("Temp file not found");

        const filePath = path.join(temp.dirPath, `${temp.name}.${temp.ext}`);
        if (!exists(filePath)) {
            this.tempRepository.delete(id);
            throw new Error("File does not exist, cannot promote");
        }

        const newPath = path.join(newDirPath, `${newName || temp.name}.${temp.ext}`);
        moveFile(filePath, newPath);

        this.tempRepository.update(id, { dirPath: newDirPath, name: newName || temp.name, status: "saved" });

        tempEvents.emit("temp:promoted");
    }

    demote(id: TempFile["id"], newDirPath: string, newName?: string) {
        const temp = this.tempRepository.findById(id);
        if (!temp) throw new Error("Temp file not found");

        const filePath = path.join(temp.dirPath, `${temp.name}.${temp.ext}`);
        if (!exists(filePath)) {
            this.tempRepository.delete(id);
            throw new Error("File does not exist, cannot demote");
        }

        const newPath = path.join(newDirPath, `${newName || temp.name}.${temp.ext}`);
        moveFile(filePath, newPath);

        this.tempRepository.update(id, { dirPath: newDirPath, name: newName || temp.name, status: "saved" });

        tempEvents.emit("temp:demoted");
    }

}

export const tempService = new TempService(new Repository());
