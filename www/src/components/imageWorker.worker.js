// imageWorker.worker.js
import TinyPNG from 'tinypng-lib';

self.onmessage = async function (e) {
    const {
        image,
        options
    } = e.data;
    // console.log('imageWorker', image, options);
    // self.postMessage({ message: 'start' });
    try {
        const result = await TinyPNG.compressWorkerImage(image, options);
        self.postMessage(result);
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};