# 电视猫剧情模糊匹配脚本

> 由于业余时间喜欢剪辑一些影视剧的人物镜头片段，而看过的剧情又不记得想要剪的人物镜头出现在哪几集。
>
> 最开始就是一集一集的去快进看，久而久之发现很浪费时间，看个几集就头晕了。
>
> 记得以前在电视猫网站上看文字版的剧情，就想到在那个网站上去搜索角色名称，能够快速的定位到人物大概出现在哪几集。
>
> 但是，同样需要一集一集的点进去，然后用F5搜索，很不方便。
>
> 于是写了这个脚本。
>
> 脚本很简单，用nodejs写的，没有什么技术含量
>
> 使用`got`模块发送请求获取响应
>
> 使用`cheerio` 模块将响应体解析成dom，能够向jQuery一样去操控。



## 主要代码

```js
const got = require('got');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const baseUrl = "https://www.tvmao.com";
(async () => {

    // 匹配完整的一句
    let regStr = '([^.?;!。？；！])*(' + config.keyWord + ')([^.?;!。？；！])*';

    const reg = new RegExp(regStr, "igm")
    const matchResult = {};
    var res = await got(config.url + "/episode");

    var $ = cheerio.load(res.body);

    //视频标题
    let videoName = $('.obj-summary-info strong').text();


    //获取每集链接
    var pageLis = $('.epipage li');

    // 获取每一集剧情
    for (let i = 0; i < pageLis.length; i++) {
        let pageLi = $(pageLis[i]);

        let page = pageLi.text();

        console.log(page);

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
        console.clear();
    }

    if (config.export) {
        exportToFile(videoName, matchResult);
    } else {
        console.log(videoName);
        console.log(matchResult);
    }


})();

function exportToFile(videoName, matchResult) {
    let seq = new Date().getTime();
    let exportFile = path.join(__dirname, `${videoName}-${seq}.txt`);

    let output = [];
    for (const key in matchResult) {
        output.push(`第${key}集：\r\n`);

        matchResult[key].forEach(txt => {
            output.push("\t"+txt.slice(1));
        })

        output.push('\r\n');
    }

    fs.writeFileSync(exportFile, output.join('\r\n'));

    console.log("匹配结果已保存至目录：", exportFile);
};
```



## config.json

```json
{
    "http":false,
    "url":"https://www.tvmao.com/drama/YmBkailb",
    "keyWord":"师姐|江厌离",
    "export":true
}
```

- `http`：以http服务器的形式运行，其他设置失效
- `url`：剧情页的地址
- `keyWord`：匹配关键字，能够被`RegExp`解析的正则表达式
- `export`：将匹配结果输出到文件

## keyWord特殊字符

- `括号`：代表一组
- `|`：或者关系，多个关键词
- `?`：表示前面的字符或者表达式(多个字符用括号括起来) 可有(1次)可无，0至1
- `.`：任意字符，不包括换行符
- `*`  ：示前面的字符或者表达式(多个字符用括号括起来) 有任意个，0到无穷大

## 匹配结果

```txt
第2集：
	直到众人都散去，魏无羡才悄悄走出来，几个路过的闲散人等说着闲话，称金凌从小父母双亡，母亲江厌离虽然是魏无羡的师姐，最后却死在魏无羡手里，也难怪江澄对魏无羡痛恨入骨
	魏无羡呆呆地听着，这才反应过来，金凌是师姐的儿子，他忍不住抽了自己一巴掌，这天下之大，自己唯独不能抢金凌的东西

第3集：
	
    遥远的十六年前，江家姐弟俩带着魏无羡前往姑苏蓝氏的云深不知处求学，那时的魏无羡尚且是个天真无邪的少年，他年幼时便父母双亡，被父母故人、江氏家主江枫眠带回云梦江氏莲花坞，收为大弟子，与其女江厌离、其子江澄一同生活修习，三人关系极好，江厌离十分呵护魏无羡，而江澄也是与魏无羡自小玩闹长大的伙伴
	金子轩豪气地包下客栈，盛气凌人地让魏无羡等人退掉客房，江厌离生性温柔，不愿多惹事端与金家人起争执，收拾了行李便要离开，结果匆忙之中将姑苏蓝氏的拜帖遗落在客栈中
	江厌离等人自我介绍一番，希望蓝忘机通融一下，可蓝忘机不讲情面地拒绝了，还让叽叽喳喳的魏无羡禁了言
	魏无羡索性趁着夜色下山买了两坛天子笑，还顺路找回了拜帖，没想到当他回去时，江厌离和江澄都不见了，其实，他们刚刚被蓝忘机接去了云深不知处
	在长辈面前，蓝忘机解了魏无羡的禁言，魏无羡开始大吐苦水，不过当他得知是蓝忘机接了师姐和江澄，这才喜笑颜开，觉得蓝忘机也不是不讲情面，开始向他郑重道歉

第4集：
	江澄觉得魏无羡这些天来一直不得安宁，忍不住向姐姐抱怨，江厌离却仍是笑眯眯的模样，她打心眼里觉得魏无羡可爱，把他当做亲弟弟来呵护
	这时，魏无羡兴冲冲地举着烤鱼回来，大方地分一条给江澄一起吃，江厌离看着两个整日斗嘴却互相关爱的弟弟，觉得分外温暖

第5集：
	......
```



