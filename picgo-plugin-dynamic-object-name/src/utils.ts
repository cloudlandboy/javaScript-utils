/**
 * 工具类
 * @author: clboy
 * @date: 2023-12-11 16:29:52
 * @Copyright (c) 2023 by syl@clboy.cn, All Rights Reserved. 
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';


/**
 * 不足长度前补0
 * @param {number} number 数字
 * @param {number} [length] 长度，默认2
 * @return {string} 补足位数后字符串
 */
export function padStartZero(number: number, length?: number): string {
    if (isNaN(length)) {
        length = 2;
    }
    return (number + '').padStart(length, '0');
}

/**
 * 获取时间字符串：年(2022)月(01)日(02)时(03)分(04)秒(05)毫秒(006)
 * @param {Date} date 日期
 * @return {string} 时间字符串：20220102030405006
 */
export function getTimeString(date: Date): string {
    return padStartZero(date.getFullYear())
        + padStartZero(date.getMonth() + 1)
        + padStartZero(date.getDate())
        + padStartZero(date.getHours())
        + padStartZero(date.getMinutes())
        + padStartZero(date.getSeconds())
        + padStartZero(date.getMilliseconds(), 3)
}

/**
 * 眠指定毫秒
 * @param {number} millis 毫秒
 */
export function sleep(millis: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, millis))
}

/**
 * 获取文件hash值
 * @param {string} filePath 文件路径
 * @param {string} algorithm hash算法
 * @return {string} hash后16进制值
 */
export function getFileHash(filePath: string, algorithm: string): string {
    if (!path.isAbsolute(filePath) || !fs.existsSync(filePath)) {
        return '';
    }
    let stat = fs.statSync(filePath);
    if (!stat.isFile()) {
        return '';
    }
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash(algorithm);
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

export interface FileNameConverter {
    convert(input: string, date: Date): string;
}

/**
 * 文件名模式对应处理，参数是传入的input和当前时间
 * @return {string} 文件名，不包含后缀
 */
export const fileNameConverters: Record<string, FileNameConverter> = {
    MILLISECONDS: {
        convert(input, date) {
            return date.getTime() + '';
        }
    },
    FORMAT_TIME: {
        convert(input, date) {
            return getTimeString(date);
        }
    },
    UUID: {
        convert(input: string, date: Date) {
            return uuidv4();
        }
    },
    SIMPLE_UUID: {
        convert(input, date) {
            return uuidv4().replace(/\-/g, '');
        }
    },
    MD5: {
        convert(input, date) {
            return getFileHash(input, 'md5');
        }
    },
    SHA1: {
        convert(input, date) {
            return getFileHash(input, 'sha1');
        }
    },
    SHA256: {
        convert(input, date) {
            return getFileHash(input, 'sha256');
        }
    },
    SHA512: {
        convert(input, date) {
            return getFileHash(input, 'sha512');
        }
    }
}