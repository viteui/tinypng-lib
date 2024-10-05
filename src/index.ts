import { ImagequantImage, Imagequant } from 'tinypng-lib-wasm'
// import { CompressOptions, CompressResult, ImageData } from './type';
import CompressorJpeg from 'compressorjs';


/**
 *  压缩配置
 */
export interface CompressOptions {
    minimumQuality?: number,
    quality?: number,
    fileName?: string, // 压缩后文件名
}

/**
 * 压缩图片结果
 */
export interface CompressResult {
    success: boolean, // 是否成功
    file: File, // 压缩后的文件
    originalSize: number, // 原始文件大小
    compressedSize: number, // 压缩后文件大小
    rate: number, // 压缩率（压缩为原来的%）
    output?: ArrayBuffer, // 压缩后的 ArrayBuffer
    blob?: Blob, // 压缩后的 Blob
    rateString: string, // 压缩率字符串

}

export interface ImageData {
    width: number,
    height: number,
    size: number,
    buffer: ArrayBuffer,
    type: string,
    name?: string,
}


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

const getImageData = (file: File): Promise<ImageData> => {
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
                size: file.size,
                name: file.name,
                type: file.type,
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
const uint8ArrayToFile = (uint8Array: BlobPart, fileName?: string): { file: File, blob: Blob } => {
    const blob = new Blob([uint8Array], { type: 'image/png' });
    return {
        file: new File([blob], fileName || `${Date.now()}.png`, { type: 'image/png', lastModified: Date.now() }),
        blob,
    };
}

const bolbToFile = (blob: Blob, fileName?: string): File => {
    return new File([blob], fileName || `${Date.now()}.png`, { type: 'image/png', lastModified: Date.now() })
}

const fileToBlob = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const result = e.target?.result;
            if (result && typeof result == "object") {
                resolve(new Blob([result], { type: file.type }));
            } else {
                reject(new Error("文件转换失败"));
            }
        };
        reader.onerror = function (e) {
            reject(e);
        }
    })
};


export const compressJpeg = async (file: File, options: CompressOptions = {}): Promise<{
    bolb: Blob,
}> => {
    return new Promise(async (resolve) => {
        new CompressorJpeg(file, {
            quality: options.quality,
            convertSize: Number.MAX_SAFE_INTEGER,
            // The compression process is asynchronous,
            // which means you have to access the `result` in the `success` hook function.
            success(result) {
                resolve({
                    bolb: result as Blob,
                })
            },
            error(err) {
                resolve({
                    bolb: file,
                })
            },
        });
    })
}


class TinyPNG {
    /**
     *  压缩图片(jpeg、jpg)
     * @param file 文件
     * @param { {quality: number}} options 
     * @returns 
     */
    async _compressJpegImage(file: File, options: CompressOptions): Promise<{
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
     * 
     * @param file 图片文件
     * @param options 
     * @returns 
     */
    async compressJpegImage(file: File, options: CompressOptions = {}) {
        if (!file) throw new Error("file can not be null");
        if (!["image/jpeg", "image/jpg"].includes(file.type)) {
            throw new Error("file must be jpeg or jpg")
        }
        // 计算质量 1-100 转化成 0-1
        const quality = (options?.quality || 88) / 100;
        const {
            bolb,
        } = await compressJpeg(file, {
            quality,
        });
        const compressFile = bolbToFile(bolb, options.fileName || file.name);
        return {
            success: true,
            file: compressFile,
            originalSize: file.size,
            compressedSize: compressFile.size,
            rate: compressFile.size / file.size,
            rateString: `${(compressFile.size / file.size * 100).toFixed(2)}%`,
            bolb,
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
    async compress(file: File, options: CompressOptions = {}): Promise<CompressResult | {
        success: boolean,
        error: Error
    }> {
        if (!file) throw new Error("file can not be null");
        if (!file.type.includes("image/")) throw new Error("file must be image");

        try {
            if (["image/jpeg", "image/jpg"].includes(file.type)) {
                return await this.compressJpegImage(file, options)
            } else {
                return this.compressPngImage(await getImageData(file), {
                    ...options,
                    fileName: options.fileName || file.name
                });
            }
        } catch (error) {
            return {
                success: false,
                error: error as Error
            }
        }

    }

    async compressPngImage(imageData: ImageData, options: CompressOptions) {
        if (!imageData) throw new Error("imageData can not be null");
        if (!imageData.type.includes("image/png")) throw new Error("imageData must be png");
        const {
            buffer,
            width: imageDataWidth,
            height: imageDataHeight,
            size: originalSize
        } = imageData;
        const uint8Array = new Uint8Array(buffer)
        const imagequant = new ImagequantImage(uint8Array, imageDataWidth, imageDataHeight, 0);
        const imagequantnstance = new Imagequant()
        imagequantnstance.set_quality(options?.minimumQuality || 0, options?.quality || 88); // 设置压缩质量范围
        const output = imagequantnstance.process(imagequant);
        const { file: outputFile, blob } = uint8ArrayToFile(output, options?.fileName || "compressed.png");
        const rate = outputFile.size / originalSize;
        return {
            success: true,
            file: outputFile,
            // output,
            originalSize,
            compressedSize: outputFile.size,
            rate: rate,
            blob,
            rateString: `${(rate * 100).toFixed(2)}%`

        }
    }


    /**
     *  压缩png图片
     * @param image 图片对象
     * @param options 
     * @returns 
     */
    async compressWorkerImage(image: ImageData, options: CompressOptions) {
        // 只支持png
        if (image.type !== "image/png") {
            throw new Error("只支持png格式, jpeg，jpg请在主线程使用compressJpegImage方法")
        }
        return this.compressPngImage(image, {
            ...options,
            fileName: options.fileName || image.name
        })
    }
    /**
     * 获取图片信息
     */
    getImage = getImageData

}

export default new TinyPNG();