## picgo-plugin-dynamic-object-name

picgo上传时根据路径匹配配置动态重命名对象名称
> ClI only



1. 进入`picgo`  配置目录

   `~/.picgo/`。其中`~`为用户目录。不同系统的用户目录不太一样。

   linux 和 macOS 均为`~/.picgo/`。

   windows 则为`C:\Users\你的用户名\.picgo\`

2. 安装插件

   ```shell
   npm install picgo-plugin-dynamic-object-name
   ```



配置说明：

```json
{
  "picBed": {
    "current": "tcyun",
    "tcyun": {
      "secretId": "xxx",
      "secretKey": "xxx",
      "bucket": "xxx",
      "appId": "xxx",
      "area": "xxx",
      "path": "",
      "customUrl": "https://xxx.cn",
      "version": "v5"
    }
  },
  "picgoPlugins": {
    "picgo-plugin-dynamic-object-name": true
  },
  "picgo-plugin-dynamic-object-name": [
    {
      "condition": "**",
      "directory": "${YEAR}/",
      "fileNameMode": "FORMAT_TIME"
    }
  ]
}
```

`picgo-plugin-dynamic-object-name` 属性是插件的配置，为数组类型，数组元素为键值对象类型，有三个属性

- condition：glob匹配模式表达式，对上传文件的所在目录或文件名进行匹配，命中后会将文件上传到 `directory` 指定的目录(路径前缀)。
- directory：上传到的目录(路径前缀)，同picgo图床配置中的 `path` 属性，最终结果为 `path`+`directory`，可将`path` 定义为空字符串，完全由 `directory` 掌控。支持以下变量：
  - YEAR：当前年 `YYYY`
  - MONTH：当前月 `MM`
  - DATE：当前日期 `dd`
  - USER：当前操作系统用户
  - GIT_USERNAME：当前git全局配置的用户名  `git config --global user.name`
- fileNameMode：文件重命名模式，支持以下选项：
  - MILLISECONDS：当前毫秒数，1970年1月1日0时0分0 秒（UTC，即协调世界时）距离该日期对象所代表时间的毫秒数。`1662704833045`
  - FORMAT_TIME：当前时间戳。`YYYYMMddHHmmssSSS`
  - UUID：随机UUID，带 `-` 。 `f6510137-21b5-465b-b59f-ccad5f7d2fdf`
  - SIMPLE_UUID：随机UUID，不带 `-` 。 `f651013721b5465bb59fccad5f7d2fdf`
  - MD5：文件计算出的`md5` 值。`e21dc6967fd4285d961ae2b372d92eaf`
  - SHA1：文件计算出的`sha1` 值。`b4e874c165e731974c66003fe91c6b57d391ccfe`
  - SHA256：文件计算出的`sha256` 值。`b199b94d10838d3f286f5665b0a0b480ab4723697446b3e158d04404b6f86ce1`
  - SHA512：文件计算出的`sha512` 值。`e361e6547335987f72a1b578865d48cd724b09d8f0f41b2ad8693910112b6838af2e70343222a60d5df92cc690f30b43cbc13e6fe776dbd75b2877d2032498d6`

```json
{
  "condition": "**/*.png",
  "directory": "images/png/${YEAR}/",
  "fileNameMode": "FORMAT_TIME"
}
```

上面这表达式就会命中所有目录下以 `.png` 结尾的文件，最终会上传到 `images/png/${YEAR}/` 目录下，文件名为当前时间戳

`/home/clboy/Pictures/Wallpapers/abc-123.png`，上传到储存桶后的访问路径则为：`https://xxx.cn/images/png/2022/202201010000000.png`
