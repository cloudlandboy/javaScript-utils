import { IPicGo, PicGo, IPlugin } from 'picgo'
import micromatch from 'micromatch'
import VariableParser from './variable-parser'
import { sleep, fileNameConverters } from './utils'
import getImageCompressorInstance, { ImageCompressor } from "./image-compressor";


const pluginName = 'picgo-plugin-dynamic-object-name';

type SelfPluginConfig = {
  condition: string;
  directory: string;
  fileNameMode: string;
  imageCompressor: 'none' | 'tinify' | 'sharp' | 'imagemin';
  imageCompressorConfig: any;
}

abstract class DynamicObjectNamePlugin implements IPlugin {

  handle(ctx: IPicGo): Promise<IPicGo> {
    ctx.log.info(`${pluginName} do process, current node version: ${process.version}`);
    const configList = this.getSelfPluginConfig(ctx);
    for (let index = 0; index < ctx.input.length; index++) {
      let matchConfig = configList.find(conf => micromatch.isMatch(ctx.input[index], conf.condition));

      ctx.log.info(`match pattern: ${matchConfig.condition}`);

      if (!matchConfig) {
        ctx.log.warn(`skip, reason: ${pluginName} config not match ${ctx.input[index]}`);
        continue;
      }
      return this.matchHandle(ctx, index, matchConfig);
    }
  };

  abstract matchHandle(ctx: IPicGo, index: number, matchConfig: SelfPluginConfig): Promise<IPicGo>

  getSelfPluginConfig(ctx: IPicGo): SelfPluginConfig[] {
    return ctx.getConfig(pluginName) || [];
  }
}

/**
 * 设置上传文件名
 */
class RenameBeforeUploadPlugin extends DynamicObjectNamePlugin {

  private readonly compressPlugin: CompressBeforeUploadPlugin = new CompressBeforeUploadPlugin();

  async matchHandle(ctx: IPicGo, index: number, matchConfig: SelfPluginConfig): Promise<IPicGo> {
    const now = new Date();
    let directoryExpression = (matchConfig.directory && matchConfig.directory.trim()) || '';
    if (directoryExpression.length > 0) {
      let parser = new VariableParser(now);
      directoryExpression = parser.parse(directoryExpression);
      if (!directoryExpression.endsWith('/')) {
        directoryExpression += '/';
      }
    }

    const fileNameconvert = fileNameConverters[matchConfig.fileNameMode];

    if (fileNameconvert) {
      const fileName = fileNameconvert.convert(ctx.input[index], now);
      if (fileName) {
        ctx.output[index].fileName = fileName + ctx.output[index].extname;
      }
    }

    ctx.output[index].fileName = directoryExpression + ctx.output[index].fileName;

    ctx.log.info(`filename: ${ctx.output[index].fileName}`);

    await this.compressPlugin.matchHandle(ctx, index, matchConfig);

    //防止时间戳重复
    await sleep(5);
    return ctx;
  }
}

/**
 * 压缩图片
 */
class CompressBeforeUploadPlugin extends DynamicObjectNamePlugin {
  async matchHandle(ctx: IPicGo, index: number, matchConfig: SelfPluginConfig): Promise<IPicGo> {
    let imageCompressor: ImageCompressor = await getImageCompressorInstance(matchConfig.imageCompressor) || await getImageCompressorInstance('none');
    ctx.log.info(`config image compressor: ${matchConfig.imageCompressor}`);
    ctx.log.info(`to use image compressor: ${imageCompressor.getKey()}`);
    ctx.log.info(`extname: ${ctx.output[index].extname}`);

    ctx.output[index].buffer = await imageCompressor.compressBuffer(
      ctx.output[index].extname.substring(1).toLowerCase(),
      ctx.output[index].buffer,
      matchConfig.imageCompressorConfig || {}
    );

    return ctx;
  }

}

class DecodeImgUrlAfterUploadPlugins implements IPlugin {

  handle(ctx: IPicGo) {
    ctx.output.forEach(item => {
      item.imgUrl = decodeURIComponent(item.imgUrl);
    })
  }

}

export = (ctx: PicGo) => {
  return {
    register: () => {
      const noPreixName = pluginName.substring(13);
      ctx.helper.beforeUploadPlugins.register(noPreixName, new RenameBeforeUploadPlugin())
      ctx.helper.afterUploadPlugins.register(noPreixName, new DecodeImgUrlAfterUploadPlugins())
    }
  }
}
