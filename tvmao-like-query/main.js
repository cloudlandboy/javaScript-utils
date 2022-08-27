const got = require('got');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const baseUrl = "https://www.tvmao.com";
(async () => {
    if (!config.http) {
        let result = await run(config.url, config.keyWord);
        result = parse(result, 'txt', config.export);
        console.log(result);
    } else {
        const port = config.port || 5240;

        app.use('/', express.static(path.join(__dirname, 'public')));

        //解析post请求体
        app.use(express.urlencoded({ extended: true }))

        app.post('/tvmao', (req, res) => {
            const params = req.body;
            run(params.url, params.keyWord).then(async result => {
                res.header('Content-Type', 'text/html;charset=utf-8');
                const $ = await cheerio.load(parse(result, 'html'));
                $('head').append(`<title>${result.videoName}</title>`);
                res.end($.html());
            });
        });

        app.get('/favicon.ico', (req, res) => {
            res.redirect('/logo.svg');
            res.end();
        });

        app.listen(port, () => {
            console.log("服务已经启动：http://127.0.0.1:" + port);
        });

    }
})();

async function run(url, keyWord) {
    // 匹配完整的一句
    let regStr = '([^.?;!。？；！])*(' + keyWord + ')([^.?;!。？；！])*';

    const reg = new RegExp(regStr, "igm")
    const matchResult = {};
    var res = await got(url + "/episode");

    var $ = cheerio.load(res.body);

    //视频标题
    let videoName = $('.obj-summary-info strong').text();


    //获取每集链接
    var pageLis = $('.epipage li');

    // 获取每一集剧情
    for (let i = 0; i < pageLis.length; i++) {
        let pageLi = $(pageLis[i]);

        let page = pageLi.text();

        if (!config.http) {
            console.clear();
            console.log(page);
        }

        let pageA = pageLi.children('a')[0];
        pageA = $(pageA);
        if (pageA.hasClass('more')) {
            continue;
        }

        let path = pageA.attr('href');

        res = await got(baseUrl + path);
        $ = cheerio.load(res.body);
        let content = $('.epi_c').text();


        let result = content.match(reg);

        if (result) {
            matchResult[page] = Array.from(new Set(result));
        }
    }

    return { videoName, matchResult };
}

/**
 * 
 * @param {JSON} result 
 * @param {string} type : txt|html
 * @param {boolean} exportToFile 
 */
function parse(result, type, exportToFile) {

    let output = [];
    for (const key in result.matchResult) {

        let group;
        let pre;
        let post;
        let separator;

        switch (type) {
            case 'txt':
                group = `第${key}集：\r\n`;
                pre = '\t';
                post = '\r\n';
                separator = '\r\n';
                break;
            case 'html':
                group = `<h2>第${key}集</h2 > `;
                pre = "<p>";
                post = "</p>";
                separator = "<hr/>";
                break;
        }

        output.push(group);

        result.matchResult[key].forEach(txt => {
            output.push(pre + txt + post);
        })

        output.push(separator);
    }

    const parseResult = output.join('');

    if (exportToFile) {
        let seq = new Date().getTime();
        let exportFile = path.join(__dirname, `${result.videoName} - ${seq}.txt`);
        fs.writeFileSync(exportFile, parseResult);
        console.log("匹配结果已保存至目录：", exportFile);
    }

    return parseResult;
};