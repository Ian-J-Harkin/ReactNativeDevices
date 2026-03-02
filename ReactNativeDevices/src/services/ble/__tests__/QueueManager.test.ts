// ============================================================
// __tests__/QueueManager.test.ts — Write queue timing tests
// ============================================================

import { QueueManager } from '../utils/QueueManager';

describe('QueueManager', () => {
    it('executes 5 simultaneous enqueues sequentially with ≥200ms gaps', async () => {
        const queue = new QueueManager(200);
        const timestamps: number[] = [];

        // Enqueue 5 writes simultaneously
        const promises = Array.from({ length: 5 }, (_, i) =>
            queue.enqueue(async () => {
                timestamps.push(Date.now());
            })
        );

        await Promise.all(promises);

        expect(timestamps.length).toBe(5);

        // Verify each subsequent write has ≥200ms gap from the previous
        // (with a small tolerance of 10ms for timer imprecision)
        for (let i = 1; i < timestamps.length; i++) {
            const gap = timestamps[i] - timestamps[i - 1];
            expect(gap).toBeGreaterThanOrEqual(190); // 200ms - 10ms tolerance
        }
    }, 15000); // 5 * 200ms = ~1s + overhead

    it('executes single task immediately', async () => {
        const queue = new QueueManager(200);
        let executed = false;

        await queue.enqueue(async () => {
            executed = true;
        });

        expect(executed).toBe(true);
    });

    it('reports correct pending count', async () => {
        const queue = new QueueManager(200);

        // Enqueue 3 tasks
        const p1 = queue.enqueue(async () => { });
        const p2 = queue.enqueue(async () => { });
        const p3 = queue.enqueue(async () => { });

        // After first starts processing, 2 should be pending
        // (exact timing is tricky, just verify it resolves)
        await Promise.all([p1, p2, p3]);
        expect(queue.pending).toBe(0);
    }, 10000);

    it('flush() waits for all pending tasks', async () => {
        const queue = new QueueManager(200);
        const results: number[] = [];

        queue.enqueue(async () => { results.push(1); });
        queue.enqueue(async () => { results.push(2); });
        queue.enqueue(async () => { results.push(3); });

        await queue.flush();
        expect(results).toEqual([1, 2, 3]);
    }, 10000);

    it('clear() rejects pending tasks', async () => {
        const queue = new QueueManager(200);
        const results: number[] = [];

        queue.enqueue(async () => { results.push(1); });
        const p2 = queue.enqueue(async () => { results.push(2); });

        // Clear after first starts
        await new Promise((r) => setTimeout(() => r(undefined), 50));
        queue.clear();

        // p2 should reject
        await expect(p2).rejects.toThrow('Queue cleared');
    }, 5000);

    it('handles errors without stopping the queue', async () => {
        const queue = new QueueManager(200);
        const results: number[] = [];

        const p1 = queue.enqueue(async () => {
            throw new Error('Write failed');
        });
        const p2 = queue.enqueue(async () => {
            results.push(2);
        });

        await expect(p1).rejects.toThrow('Write failed');
        await p2;
        expect(results).toEqual([2]);
    }, 5000);
});
