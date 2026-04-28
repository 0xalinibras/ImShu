import { Command } from "commander";
import { TempService, storage, TempScheduler } from "@imshu/core";
import { exec, spawn } from "child_process";
import { tempEvents } from "../../packages/core/src/events";
import readline from "readline";


//TODO:

/*
temp config
*/
const config = {
    makeTempWithoutExt: true,
    defultExt: "txt",
    defultDirPath: "tempFiles",
    defultExpiresIn: 60000,
    notifyBeforeMs: 10000,
    openAfterCreate: true,
    openIn: {
        txt: "notepad",
        ts: "vscode",
        json: "vscode",
        md: "popout",
    },
    runAfterCreate: true,
    executionMode: {
        ts: "direct",
        js: "direct",
        py: "cmd",
    },
    defultSavedDirPath: "savedFiles",
}


const tempService = new TempService(new storage.TempRepository());
const scheduler = new TempScheduler(tempService, config.notifyBeforeMs);

scheduler.start();



const program = new Command();

program
    .name("imshu")
    .description("A simple temporary file service")
    .version("1.0.0");

program
    .command("create")
    .description("Create a temporary file")

    .argument("[name]", "The name of the file")
    .argument(`${config.makeTempWithoutExt ? "[ext]" : "<ext>"}`, "The extension of the file")
    .argument("[dirPath]", "The directory path to save the file")
    .argument("[expiresIn]", "The expiration time in milliseconds")
    .argument("[tags]", "The tags of the file, separated by comma")
    .argument("[content]", "The content of the file")

    .action((name: string, ext: string, dirPath: string, expiresIn: number, tags, content: string) => {
        name = name || "temp";
        ext = ext || config.defultExt;
        dirPath = dirPath || config.defultDirPath;
        expiresIn = Number(expiresIn ?? config.defultExpiresIn);
        tags = tags ? tags.split(",") : [];

        const filePath = tempService.create(name, ext, dirPath, expiresIn, tags, content);

        console.log(filePath);

        if (config.openAfterCreate) {
            const openIn = config.openIn[ext as keyof typeof config.openIn] || "notepad";
            if (openIn === "vscode") {
                exec(`code -n ${filePath}`, (error) => {
                    if (error) {
                        console.error("Error opening file in VSCode:", error);
                    }
                });
            } else if (openIn === "notepad") {
                exec(`notepad ${filePath}`, (error) => {
                    if (error) {
                        console.error("Error opening file in Notepad:", error);
                    }
                });
            }
        }

        if (config.runAfterCreate) {
            const em = config.executionMode[ext as keyof typeof config.executionMode];

            if (em === "direct") {
                const runCommand = generateRunCommand(ext, filePath);
                console.log(`Executing command: ${runCommand}`);
                exec(runCommand, (error) => {
                    if (error) {
                        console.error("Error executing command:", error);
                    }
                });
            } else if (em === "cmd") {
                const runCommand = generateRunCommand(ext, filePath);
                console.log(`Executing command: ${runCommand}`);
                exec(`start cmd.exe /k "${runCommand.replace(/"/g, '\\"')}"`);
            }
        }
    });

program
    .command("list")
    .description("List all temporary files")
    .action(() => {
        const temps = tempService.list();
        if (temps.length === 0) {
            console.log("No temp files found");
            return;
        }

        console.table(temps.map(temp => ({
            id: temp.id,
            name: temp.name,
            ext: temp.ext,
            dirPath: temp.dirPath,
            createdAt: new Date(temp.createdAt).toLocaleString(),
            expiresAt: new Date(temp.expiresAt).toLocaleString(),
            tags: temp.tags.join(", "),
            status: temp.status
        })));
    });

program
    .command("delete")
    .description("Delete a temporary file")
    .argument("<id>", "The id of the temp file")
    .action((id) => {
        tempService.delete(id);
        console.log(`Temp file with id ${id} deleted`);
    });

program
    .command("promote")
    .description("Promote a temporary file to a permanent file")
    .argument("<id>", "The id of the temp file")
    .argument("[newDirPath]", "The new directory path to save the file")
    .argument("[newName]", "The new name of the file")
    .action((id, newDirPath, newName) => {
        newDirPath = newDirPath || config.defultSavedDirPath;
        tempService.promote(id, newDirPath, newName);
        console.log(`Temp file with id ${id} promoted to permanent file at ${newDirPath}`);
    });

program
    .command("demote")
    .description("Demote a permanent file back to a temporary file")
    .argument("<id>", "The id of the temp file")
    .argument("[newDirPath]", "The new directory path to save the file")
    .argument("[newName]", "The new name of the file")
    .action((id, newDirPath, newName) => {
        newDirPath = newDirPath || config.defultDirPath;
        tempService.demote(id, newDirPath, newName);
        console.log(`Permanent file with id ${id} demoted back to temp file at ${newDirPath}`);
    });

tempEvents.on("temp:expiring_soon", (temp) => {
    console.log(`Temp file "${temp.name}.${temp.ext}" is expiring soon!`);
});

tempEvents.on("temp:expired", (temp) => {
    console.log(`Temp file "${temp.name}.${temp.ext}" has expired and been deleted.`);
});

function generateRunCommand(ext: string, filePath: string): string {

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


// =====================================
// 🧠 REPL
// =====================================

function parseInput(input: string): string[] {
    const regex = /"([^"]+)"|'([^']+)'|(\S+)/g;

    const args: string[] = [];
    let match;

    while ((match = regex.exec(input)) !== null) {
        args.push(match[1] || match[2] || match[3]);
    }

    return args;
}

function startREPL(program: Command) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "imshu> "
    });

    console.log("🚀 ImShu REPL started");
    console.log("Type 'exit' to quit\n");

    rl.prompt();

    rl.on("line", async (input) => {
        const line = input.trim();

        if (!line) {
            rl.prompt();
            return;
        }

        if (line === "exit" || line === "quit") {
            rl.close();
            return;
        }

        try {
            const args = parseInput(line);

            // 🔥 PASS TO COMMANDER
            await program.parseAsync(args, { from: "user" });
        } catch (err) {
            console.error("❌ Error:", err);
        }

        rl.prompt();
    });

    rl.on("close", () => {
        console.log("\n👋 REPL closed");
        process.exit(0);
    });
}

const args = process.argv.slice(2);

if (args.length === 0) {
    startREPL(program);
} else {
    program.parse(process.argv);
}
