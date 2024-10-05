
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
    output: ArrayBuffer, // 压缩后的 ArrayBuffer
    blob: Blob, // 压缩后的 Blob
    rateString: string, // 压缩率字符串

}

export interface Image {
    width: number,
    height: number,
    size: number,
    buffer: ArrayBuffer,
    type: string,
    name?: string,
}