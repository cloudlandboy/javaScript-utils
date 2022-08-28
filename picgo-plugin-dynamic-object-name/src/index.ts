/*
 * @Author: clboy
 * @Date: 2022-08-28 21:02:48
 * @LastEditors: clboy
 * @LastEditTime: 2022-08-29 00:16:55
 * @Description: 
 * 
 * Copyright (c) 2022 by clboy syl@clboy.cn, All Rights Reserved. 
 */
import picgo from 'picgo'
import micromatch from 'micromatch'
import VariableParser from './variable-parser'
import { sleep, fileNameModeHandler } from './utils'
import { IPicGo } from 'picgo/dist/src/types'


/**
 * @description: 上传前处理插件逻辑
 * @param {object} ctx picgo
 * @return {object} ctx
 */
const handle = async (ctx: IPicGo) => {
  const configList: any[] = ctx.getConfig('picgo-plugin-dynamic-object-name') || [];
  for (let i = 0; i < ctx.input.length; i++) {
    let matchConfig = configList.find(conf => micromatch.isMatch(ctx.input[i], conf.condition));
    if (!matchConfig) {
      continue;
    }
    let now = new Date();
    let directory = (matchConfig.directory && matchConfig.directory.trim()) || '';
    //目录
    if (directory.length > 0) {
      let parser = new VariableParser(now);
      directory = parser.parse(directory);
      if (!directory.endsWith('/')) {
        directory += '/';
      }
    }

    //文件名
    if (matchConfig.fileNameMode && fileNameModeHandler[matchConfig.fileNameMode]) {
      let fileName = fileNameModeHandler[matchConfig.fileNameMode](ctx.input[i], now);
      if (fileName) {
        ctx.output[i].fileName = fileName + ctx.output[i].extname;
      }
    }
    ctx.output[i].fileName = directory + ctx.output[i].fileName;
    //防止时间戳重复
    await sleep(100);
  }
}

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.beforeUploadPlugins.register('dynamic-object-name', { handle })
  }
  return {
    register
  }
}
