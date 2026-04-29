export interface Executor {
    open(filePath: string, ext: string): void;
    run(filePath: string, ext: string): void;
}
