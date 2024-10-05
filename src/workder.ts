
// @ts-ignore
import ImageWorker from './imageWorker.worker.js';
import TinyPNG from './index'
export class CompressWorker {
    worker: Worker | null;
    constructor() {
        this.worker = new Worker(new URL('./imageWorker.worker.js', import.meta.url), { type: 'module' });

        // this.worker = new ImageWorker();
    }
    async compress(file: File, options: CompositeOperation) {
        // 获取图片信息
        const image = await TinyPNG.getImage(file);
        return new Promise((resolve, reject) => {
            if (!this.worker) return;
            // 监听worker的消息
            this.worker.onmessage = (e) => {
                const result = e.data;
                if (result.error && !result.success) {
                    console.error("Compression failed:", result.error);
                    reject(result.error);
                } else {
                    resolve(result);
                }
            };
            // Send the file to the worker for compression
            this.worker.postMessage({
                image,
                options
            });

        });
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }

    }
}
