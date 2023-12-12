/**
 * 变量解析
 * @author: clboy
 * @date: 2023-12-11 16:54:46
 * @Copyright (c) 2023 by syl@clboy.cn, All Rights Reserved. 
 */
import { padStartZero } from "./utils"
import childProcess from "child_process"



export interface IVariableParser {
  parse(text: string): string;
  support(variable: string): boolean;
}

/**
 * 变量解析器，${变量}，支持变量列表：
 * YEAR：当前年
 * MONTH：当前月
 * DATE：当前日期
 * USER：当前操作系统用户
 * GIT_USERNAME：git config user.name
 */
export default class VariableParser implements IVariableParser {
  private date: Date;
  constructor(date: Date) {
    this.date = date || new Date();
  }

  parse(text: string) {
    const regExp = /\$\{(\w+)\}/g;
    let matchResult = null;
    let nextSubStart = 0;
    let result = '';
    while ((matchResult = regExp.exec(text)) != null) {
      if (this.support(matchResult[1])) {
        result = result + text.substring(nextSubStart, matchResult.index)
          + VariableParser.variableMapping[matchResult[1]](this);
        nextSubStart = matchResult.index + matchResult[0].length;
      }
    }

    if (nextSubStart < text.length) {
      result += text.substring(nextSubStart);
    }
    return result;
  }

  support(variable: string) {
    return !!VariableParser.variableMapping[variable];
  }

  private static variableMapping: Record<string, (vm: VariableParser) => any> = {
    YEAR(vm: VariableParser) {
      return padStartZero(vm.date.getFullYear());
    },
    MONTH(vm: VariableParser) {
      return padStartZero(vm.date.getMonth() + 1);
    },
    DATE(vm: VariableParser) {
      return padStartZero(vm.date.getDate());
    },
    USER(vm: VariableParser) {
      return process.env.SUDO_USER ||
        process.env.C9_USER ||
        process.env.LOGNAME ||
        process.env.USER ||
        process.env.LNAME ||
        process.env.USERNAME;
    },
    GIT_USERNAME(vm: VariableParser) {
      try {
        return childProcess.execSync('git config user.name');
      } catch (err) {
        return '';
      }
    },
  }
}