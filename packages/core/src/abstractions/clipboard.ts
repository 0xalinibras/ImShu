export interface ClipboardProvider {
    read(): Promise<string>;
}
