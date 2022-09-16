/*
 * @Author: clboy
 * @Date: 2022-09-11 12:51:10
 * @LastEditors: sunyunla
 * @LastEditTime: 2022-09-16 10:03:56
 * @Description: 笔记oss文件名称时间戳规范化目录迁移
 * 
 * Copyright (c) 2022 by clboy syl@clboy.cn, All Rights Reserved. 
 */
import fs from "fs";
import path from "path";

const replaceContentDir = "/media/clboy/Repository/workspace/openSource/myNote/docs";
const bucketDir = "/home/clboy/Desktop/note-1259193042";
const filterDir = ["/home/clboy/Desktop/note-1259193042/images/2022"];
const targetPrefix = "images/2021";
const matchContentFileExt = [".js", ".html", ".md", ".txt"];
const domain = "https://cdn.tencentfs.clboy.cn";

if (replaceContentDir) {
    assertIsDirectory(replaceContentDir);
}
assertIsDirectory(bucketDir);


async function nameSupplier() {
    await sleep(5);
    let date = new Date();
    return padStartZero(date.getFullYear())
        + padStartZero(date.getMonth() + 1)
        + padStartZero(date.getDate())
        + padStartZero(date.getHours())
        + padStartZero(date.getMinutes())
        + padStartZero(date.getSeconds())
        + padStartZero(date.getMilliseconds(), 3);
};


handle(bucketDir);


const record = {};
async function handle(dirPath) {
    const dirContent = fs.readdirSync(dirPath, { withFileTypes: true });
    for (let dirent of dirContent) {
        let filePath = path.join(dirPath, dirent.name)
        if (dirent.isFile()) {
            let newPath = path.join(bucketDir, targetPrefix, await nameSupplier()) + path.extname(dirent.name);
            record[filePath] = newPath;
            fs.writeFileSync('record.json', JSON.stringify(record, null, 4));
            fs.renameSync(filePath, newPath);
            if (replaceContentDir) {
                //文件内容替换
                replaceContentDirHandle(replaceContentDir,
                    domain + filePath.substring(bucketDir.length),
                    domain + newPath.substring(bucketDir.length));
            }
        } else if (dirent.isDirectory() && filterDir.indexOf(filePath) < 0) {
            handle(filePath);
        }
    }
}


function replaceContentDirHandle(dirPath, searchText, replaceText) {
    const dirContent = fs.readdirSync(dirPath, { withFileTypes: true });
    for (let dirent of dirContent) {
        let filePath = path.join(dirPath, dirent.name)
        if (dirent.isFile() && matchContentFileExt.indexOf(path.extname(dirent.name))) {
            let textContent = fs.readFileSync(filePath, { encoding: "utf-8" });
            if (textContent.indexOf(searchText) >= 0) {
                console.log(`替换文件：${filePath}`);
                console.log(`\t${searchText} ===> ${replaceText}`);
                fs.writeFileSync(filePath, replaceAll(searchText, replaceText, textContent))
            }
        } else if (dirent.isDirectory()) {
            replaceContentDirHandle(filePath, searchText, replaceText);
        }
    }
}


function assertIsDirectory(path) {
    const state = fs.statSync(path);
    if (!state.isDirectory()) {
        throw new Error(path + " 不是一个目录");
    }
}

function padStartZero(number, length) {
    if (isNaN(length)) {
        length = 2;
    }
    return (number + '').padStart(length, '0');
}

function sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}

function replaceAll(find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}