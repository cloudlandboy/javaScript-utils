/**
 * 图片压缩器
 * @author: clboy
 * @date: 2023-12-12 00:04:42
 * @Copyright (c) 2023 by syl@clboy.cn, All Rights Reserved. 
 */
export interface ImageCompressor {

    getKey(): string;
    compressBuffer(extname: string, buffer: Buffer, config: any): Promise<Buffer>;

}

export class NoneImageCompressor implements ImageCompressor {

    static readonly key = 'none';

    getKey(): string {
        return 'none';
    }

    async compressBuffer(extname: string, buffer: Buffer, config: any): Promise<Buffer> {
        return buffer;
    }

}

export class TinifyImageCompressor implements ImageCompressor {

    private static tinify: any;
    static readonly key = 'tinify';


    getKey(): string {
        return TinifyImageCompressor.key;
    }

    async compressBuffer(extname: string, buffer: Buffer, config: any): Promise<Buffer> {
        TinifyImageCompressor.tinify.key = config.key;
        const data = await TinifyImageCompressor.tinify.fromBuffer(buffer).toBuffer()
        return Buffer.from(data);
    }

    static async getInstance(): Promise<TinifyImageCompressor> {
        if (!TinifyImageCompressor.tinify) {
            TinifyImageCompressor.tinify = (await import("tinify")).default;
        }
        return new TinifyImageCompressor();
    }

}

export class SharpImageCompressor implements ImageCompressor {

    private static sharp: any;
    static readonly key = 'sharp';

    getKey(): string {
        return SharpImageCompressor.key;
    }

    async compressBuffer(extname: string, buffer: Buffer, config: any): Promise<Buffer> {
        const format = SharpImageCompressor.sharp.format[extname];
        if (!format) {
            return buffer;
        }
        const quality = Number(config.quality);
        return SharpImageCompressor.sharp(buffer, { animated: true, limitInputPixels: false })
            .toFormat(format, { quality: (isNaN(quality) || quality < 1 || quality > 100) ? 80 : quality })
            .toBuffer();
    }

    static async getInstance(): Promise<SharpImageCompressor> {
        if (!SharpImageCompressor.sharp) {
            SharpImageCompressor.sharp = (await import("sharp")).default;
        }
        return new SharpImageCompressor();
    }


}

export class ImageminImageCompressor implements ImageCompressor {

    private static imagemin: any;
    private static optionsSupplier: (quality: number) => any;
    static readonly key = 'imagemin';

    getKey(): string {
        return ImageminImageCompressor.key;
    }

    async compressBuffer(extname: string, buffer: Buffer, config: any): Promise<Buffer> {
        return ImageminImageCompressor.imagemin.buffer(buffer, ImageminImageCompressor.optionsSupplier(Number(config.quality)));
    }

    static async getInstance(): Promise<TinifyImageCompressor> {
        if (!ImageminImageCompressor.imagemin) {
            ImageminImageCompressor.imagemin = (await import("imagemin")).default;
            const imageminSvgo = (await import("imagemin-svgo")).default;
            const imageminMozjpeg = (await import("imagemin-mozjpeg")).default;
            const imageminOptipng = (await import("imagemin-optipng")).default;
            const imageminGifsicle = (await import("imagemin-gifsicle")).default;
            ImageminImageCompressor.optionsSupplier = (quality: number) => {
                if (isNaN(quality) || quality < 0) {
                    quality = 50;
                }

                quality = Math.min(100, quality);

                return {
                    plugins: [
                        imageminSvgo(),
                        imageminMozjpeg({
                            quality: quality
                        }),
                        imageminOptipng({
                            optimizationLevel: Math.round((100 - quality) * 0.07)
                        }),
                        imageminGifsicle({
                            optimizationLevel: Math.max(1, Math.round((100 - quality) * 0.03))
                        })
                    ]
                }
            }
        }
        return new ImageminImageCompressor();
    }

}


const loaders: Record<string, () => Promise<SharpImageCompressor>> = {
}
loaders[TinifyImageCompressor.key] = TinifyImageCompressor.getInstance;
loaders[SharpImageCompressor.key] = SharpImageCompressor.getInstance;
loaders[ImageminImageCompressor.key] = ImageminImageCompressor.getInstance;


const INSTANCES: Record<string, ImageCompressor> = {}
INSTANCES[NoneImageCompressor.key] = new NoneImageCompressor();

export default async function getInstance(name: string): Promise<ImageCompressor> {
    if (INSTANCES[name]) {
        return INSTANCES[name];
    }

    const loader = loaders[name];

    if (!loader) {
        return null;
    }
    INSTANCES[name] = await loader();
    return INSTANCES[name];
}

