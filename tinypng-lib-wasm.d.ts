declare module 'tinypng-lib-wasm' {
    /* tslint:disable */
    /* eslint-disable */
    /**
    */
    export class Imagequant {
        free(): void;
        /**
        */
        constructor();
        /**
        * Make an image from RGBA pixels.
        * Use 0.0 for gamma if the image is sRGB (most images are).
        * @param {Uint8Array} data
        * @param {number} width
        * @param {number} height
        * @param {number} gamma
        * @returns {ImagequantImage}
        */
        static new_image(data: Uint8Array, width: number, height: number, gamma: number): ImagequantImage;
        /**
        * It's better to use `set_quality()`
        * @param {number} max_colors
        */
        set_max_colors(max_colors: number): void;
        /**
        * Range 0-100, roughly like JPEG.
        *
        * If the minimum quality can't be met, the quantization will be aborted with an error.
        *
        * Default is min 0, max 100, which means best effort, and never aborts the process.
        *
        * If max is less than 100, the library will try to use fewer colors.
        * Images with fewer colors are not always smaller, due to increased dithering it causes.
        * @param {number} minimum
        * @param {number} target
        */
        set_quality(minimum: number, target: number): void;
        /**
        * 1-10.
        *
        * Faster speeds generate images of lower quality, but may be useful
        * for real-time generation of images.
        *
        * The default is 4.
        * @param {number} value
        */
        set_speed(value: number): void;
        /**
        * Number of least significant bits to ignore.
        *
        * Useful for generating palettes for VGA, 15-bit textures, or other retro platforms.
        * @param {number} value
        */
        set_min_posterization(value: number): void;
        /**
        * Create PNG based on specified settings Vec<u8>
        * @param {ImagequantImage} image
        * @returns {Uint8Array}
        */
        process(image: ImagequantImage): Uint8Array;
    }
    /**
    */
    export class ImagequantImage {
        free(): void;
        /**
        * Make an image from RGBA pixels.
        * Use 0.0 for gamma if the image is sRGB (most images are).
        * @param {Uint8Array} data
        * @param {number} width
        * @param {number} height
        * @param {number} gamma
        */
        constructor(data: Uint8Array, width: number, height: number, gamma: number);
    }

}