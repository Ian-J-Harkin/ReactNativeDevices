// ============================================================
// utils/QueueManager.ts — Promise-based FIFO write queue
// ============================================================
//
// All BLE .write() operations MUST go through this queue.
// Enforces a minimum 200ms delay between writes to prevent
// Android Bluetooth stack crashes.
// ============================================================

/**
 * A write task is a function that returns a Promise (the actual BLE write).
 */
type WriteTask = () => Promise<void>;

export class QueueManager {
    private queue: Array<{
        task: WriteTask;
        resolve: () => void;
        reject: (err: Error) => void;
    }> = [];
    private processing = false;
    private minDelayMs: number;
    private lastWriteTime = 0;

    /**
     * @param minDelayMs Minimum milliseconds between writes. Default: 200.
     */
    constructor(minDelayMs = 200) {
        this.minDelayMs = minDelayMs;
    }

    /**
     * Enqueue a write operation. Returns a Promise that resolves
     * when the write has actually been executed (after waiting its turn).
     */
    enqueue(task: WriteTask): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.processNext();
        });
    }

    /**
     * Drain the queue — wait for all pending writes to complete.
     * Used during teardown to ensure clean disconnection.
     */
    async flush(): Promise<void> {
        if (this.queue.length === 0 && !this.processing) return;
        return new Promise<void>((resolve) => {
            const check = setInterval(() => {
                if (this.queue.length === 0 && !this.processing) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
        });
    }

    /**
     * Clear all pending tasks without executing them.
     */
    clear(): void {
        const pending = this.queue.splice(0);
        for (const item of pending) {
            item.reject(new Error('Queue cleared'));
        }
    }

    /**
     * Current number of pending tasks in the queue.
     */
    get pending(): number {
        return this.queue.length;
    }

    // ------- Internal -------

    private async processNext(): Promise<void> {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;

        // Enforce minimum delay before grabbing the item
        const elapsed = Date.now() - this.lastWriteTime;
        if (elapsed < this.minDelayMs) {
            await this.delay(this.minDelayMs - elapsed);
        }

        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        const item = this.queue.shift()!;

        try {
            await item.task();
            this.lastWriteTime = Date.now();
            item.resolve();
        } catch (err) {
            item.reject(err instanceof Error ? err : new Error(String(err)));
        } finally {
            this.processing = false;
            // Process next item in the queue (if any)
            this.processNext();
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

/** Shared singleton instance for use across the BLE service layer. */
export const writeQueue = new QueueManager(200);
