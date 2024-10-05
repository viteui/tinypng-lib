import ImageWorker from './imageWorker1.worker.js';
import TinyPNG from 'tinypng-lib';
export class CompressWorker {
    worker = null;
    constructor() {
        this.worker = new ImageWorker();
    }
    async compress(file, options) {
        // 获取图片信息
        const image = await TinyPNG.getImage(file);
        return new Promise((resolve, reject) => {
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
