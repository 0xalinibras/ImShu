import { Executor } from "@imshu/core";
import { exec } from "child_process";

export class CLIExecutor implements Executor {
    constructor(
        private config: any
    ){}

    open(filePath: string, ext: string) {
        const openIn = this.config.openIn[ext] || "notepad";

        switch (openIn) {
            case "vscode":
                exec(`code -n ${filePath}`, (error) => {
                    if (error) {
                        console.error("Error opening file in VSCode:", error);
                    }
                })
                break;
            case "notepad":
                exec(`notepad ${filePath}`, (error) => {
                    if (error) {
                        console.error("Error opening file in Notepad:", error);
                    }
            })
            default:
                break;
        }
    }

    run(filePath: string, ext: string) {
        const mode = this.config.executionMode[ext] || "direct";
        const runCommand = this.generateRunCommand(ext, filePath);

        switch (mode) {
            case "integrated":
                console.log(`Executing command: ${runCommand}`);
                exec(runCommand, (error) => {
                    if (error) {
                        console.error("Error executing command:", error);
                    }
                });
                break;
            case "newTerminal":
                exec(`start cmd /k "${runCommand}"`, (error) => {
                    if (error) {
                        console.error("Error executing command:", error);
                    }
                });
                break;
            default:
                break;
        }
    }

    private generateRunCommand(ext: string, filePath: string): string {
        switch (ext) {
            case "ts":
                return `bun run ${filePath}`;
            case "py":
                return `python ${filePath}`;
            case "js":
                return `node ${filePath}`;
            default:
                return filePath;
        }
    }
}
