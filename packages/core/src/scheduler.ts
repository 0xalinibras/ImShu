import { TempService } from "./temp.service";
import { tempEvents } from "./events";

export class TempScheduler {
    private expireTimer: NodeJS.Timeout | null = null;
    private notifyTimer: NodeJS.Timeout | null = null;

    constructor(
        private tempService: TempService,
        private notifyBeforeMs: number
    ) {}

    start() {
        this.scheduleNext();

        tempEvents.on("temp:created", () => this.scheduleNext());
        tempEvents.on("temp:deleted", () => this.scheduleNext());
        tempEvents.on("temp:promoted", () => this.scheduleNext());
    }

    stop() {
        if (this.expireTimer) {
            clearTimeout(this.expireTimer);
            this.expireTimer = null;
        }
        if (this.notifyTimer) {
            clearTimeout(this.notifyTimer);
            this.notifyTimer = null;
        }
    }

    private scheduleNext() {
        this.stop();

        const temps = this.tempService.list(false);

        const next = temps
            .filter(temp => temp.status === "temp" && temp.expiresAt > Date.now())
            .sort((a, b) => a.expiresAt - b.expiresAt)[0];

        if (!next) return;

        const timeToExpire = next.expiresAt - Date.now();
        const notifyTime = timeToExpire - this.notifyBeforeMs;

        if (notifyTime > 0) {
            this.notifyTimer = setTimeout(() => {
                tempEvents.emit("temp:expiring_soon", next);
            }, notifyTime);
        }

        this.expireTimer = setTimeout(() => {
            this.tempService.deleteExpired();
            tempEvents.emit("temp:expired", next);
            this.scheduleNext();
        }, Math.max(timeToExpire, 0));
    }
}
