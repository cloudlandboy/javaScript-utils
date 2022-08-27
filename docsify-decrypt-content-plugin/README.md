# docsify内容解密插件

使用方法

1. 将写好的md文件内容全选复制，粘贴到对称加密工具进行加密，然后复制加密结果替换md内容以下格式

   ```markdown
   ENCRYPTED.加密方式(加密结果)
   ```

   加密方式如：`DES`、`AES`

2. 在 `index.html` 引入 [crypto-js](https://github.com/brix/crypto-js)  和该插件

   ```html
   <body>
     <div id="app"></div>
     <script>
       window.$docsify = {
         name: 'clboy document', 
         repo: '',
         loadSidebar: true,
         subMaxLevel: 6
       }
     </script>
   
     <script src="https://cdnjs.cloudflare.com/ajax/libs/docsify/4.12.2/docsify.min.js"></script>
     <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
     <script src="./docsify-decrypt-content.js"></script>
   </body>
   ```

   