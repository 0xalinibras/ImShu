import clipboardy from "clipboardy";
import { ClipboardProvider } from "@imshu/core"

export class Clipboard implements ClipboardProvider {
    async read(): Promise<string> {
        return clipboardy.read();
    }
}
