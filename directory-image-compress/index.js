/*
 * @Author: clboy
 * @Date: 2022-09-22 16:45:56
 * @LastEditors: sunyunla
 * @LastEditTime: 2022-09-22 20:04:42
 * @Description: 
 * 
 * Copyright (c) 2022 by clboy syl@clboy.cn, All Rights Reserved. 
 */
import fs from 'fs';
import path from 'path';
import { argv } from 'process';
import imagemin from 'imagemin';
import imageminSvgo from 'imagemin-svgo';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';

const SOURCE_DIR = argv[2];
const DESTINATION_DIR = argv[3];

(async function handle(dir) {
    const files = await imagemin([`${dir}/*`], {
        destination: path.join(DESTINATION_DIR, dir.substring(SOURCE_DIR.length)),
        plugins: [
            imageminSvgo(),
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8]
            }),
            imageminGifsicle()
        ]
    });
    files.forEach(item => console.log(item.sourcePath + ' ===> ' + item.destinationPath))
    const dirContent = fs.readdirSync(dir, { withFileTypes: true });
    for (let dirent of dirContent) {
        if (dirent.isDirectory()) {
            handle(path.join(dir, dirent.name));
        }
    }
})(SOURCE_DIR);