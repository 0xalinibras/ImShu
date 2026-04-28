import fs from 'fs';
import path from 'path';

export function saveFile(filePath:string, content: string = "") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content);
}

export function deleteFile(filePath:string) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

export function moveFile(oldPath:string, newPath:string) {
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.renameSync(oldPath, newPath);
}

export function exists(filePath:string) {
    return fs.existsSync(filePath);
}
