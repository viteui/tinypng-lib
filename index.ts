import { ImagequantImage, Imagequant } from 'tinypng-lib-wasm'

const canvastoFile = (
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
): Promise<Blob | null> => {
    return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob), type, quality)
    );
};



const dataURLToImage = (dataURL: string): Promise<HTMLImageElement> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = dataURL;
    });
};



function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (reader.result && typeof reader.result == "string") {
                resolve(reader.result);
            }
        };
        reader.onerror = function (e) {
            reject(e);
        };
        reader.readAsDataURL(file);
    });
}

const getImageData = (file: File): Promise<{
    buffer: ArrayBuffer,
    width: number,
    height: number,
    size: number
}> => {
    return new Promise((resolve, reject) => {

        // 创建一个 Image 对象
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // 创建一个 canvas 元素
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('无法获取 canvas 上下文'));
                return;
            }

            // 将图像绘制到 canvas 上
            ctx.drawImage(img, 0, 0);

            // 获取 ImageData
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data; // Uint8ClampedArray

            // 将 Uint8ClampedArray 转换为普通的 Uint8Array
            const buffer = new Uint8Array(data).buffer;

            // 确保缓冲区长度是 width * height * 4
            const expectedLength = img.width * img.height * 4;
            if (buffer.byteLength !== expectedLength) {
                reject(new Error(`缓冲区长度不匹配：期望 ${expectedLength} 字节，但得到 ${buffer.byteLength} 字节`));
                return;
            }

            resolve({
                buffer,
                width: img.width,
                height: img.height,
                size: file.size
            });

            // 释放对象 URL
            URL.revokeObjectURL(img.src);
        };

        img.onerror = () => {
            reject(new Error('图片加载失败'));
            URL.revokeObjectURL(img.src);
        };
    });
};
const uint8ArrayToFile = (uint8Array: BlobPart, fileName: string): { file: File, blob: Blob } => {
    const blob = new Blob([uint8Array], { type: 'image/png' });
    return {
        file: new File([blob], fileName || `${Date.now()}.png`, { type: 'image/png', lastModified: Date.now() }),
        blob,
    };
}


interface CompressOptions {
    minimumQuality?: number,
    quality?: number,
    fileName?: string, // 压缩后文件名
}
class TinyPNG {
    /**
     *  压缩图片(jpeg、jpg)
     * @param file 文件
     * @param { {quality: number}} options 
     * @returns 
     */
    async compressJpegImage(file: File, options: CompressOptions): Promise<{
        file: File,
        blob: Blob
    }> {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        const base64 = await fileToDataURL(file);
        const img = await dataURLToImage(base64);
        canvas.width = img.width;
        canvas.height = img.height;
        const blob = (await canvastoFile(
            canvas,
            file.type,
            (options?.quality || 50) / 100
        )); // quality:0.5可根据实际情况计算
        return {
            file: new File([blob as BlobPart], options.fileName || file.name, {
                type: file.type,
            }),
            blob: blob as Blob,
        };
    }
    /**
     *  压缩图片
     * @param file 文件
     * @param {{
     *   minimumQuality: number,
     *   quality: number
     * }} options
     * @returns 
     */
    async compress(file: File, options: CompressOptions = {}): Promise<{
        success: boolean,
        file: File,
        originalSize: number,
        compressedSize: number,
        rate: number,
        output: ArrayBuffer,
        blob: Blob,
        rateString: string,

    } | {
        success: boolean,
        error: Error
    }> {
        if (!file) throw new Error("file can not be null");
        if (!file.type.includes("image/")) throw new Error("file must be image");

        try {
            const {
                minimumQuality = 0,
                quality = 100,
                fileName, // 压缩后文件名
            } = options;
            if (["image/jpeg", "image/jpg"].includes(file.type)) {
                const {
                    file: compressFile,
                    blob,
                } = await this.compressJpegImage(file, options);
                return {
                    success: true,
                    file: compressFile,
                    originalSize: file.size,
                    compressedSize: compressFile.size,
                    rate: compressFile.size / file.size,
                    blob: blob,
                    output: await blob.arrayBuffer(),
                    rateString: `${(compressFile.size / file.size * 100).toFixed(2)}%`
                };
            } else {

                const {
                    buffer,
                    width: imageDataWidth,
                    height: imageDataHeight,
                    size: originalSize
                } = await getImageData(file);
                const uint8Array = new Uint8Array(buffer)
                const image = new ImagequantImage(uint8Array, imageDataWidth, imageDataHeight, 0);
                const imagequantnstance = new Imagequant()
                imagequantnstance.set_quality(minimumQuality, quality); // 设置压缩质量范围
                const output = imagequantnstance.process(image);
                const { file: outputFile, blob } = uint8ArrayToFile(output, fileName || file?.name);
                const rate = outputFile.size / originalSize;
                return {
                    success: true,
                    file: outputFile,
                    output,
                    originalSize,
                    compressedSize: outputFile.size,
                    rate: rate,
                    blob,
                    rateString: `${(rate * 100).toFixed(2)}%`
                }
            }

        } catch (error) {
            return {
                success: false,
                error
            }
        }

    }

}

export default new TinyPNG();