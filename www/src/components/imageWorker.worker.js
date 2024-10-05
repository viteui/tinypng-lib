// imageWorker.worker.js
import TinyPNG from 'tinypng-lib';

self.onmessage = async function (e) {
    const file = e.data;
    try {
        const result = await TinyPNG.compress(file, {
            minimumQuality: 35,
            quality: 88
        });
        self.postMessage(result);
    } catch (error) {
        self.postMessage({ error: error.message });
    }
};