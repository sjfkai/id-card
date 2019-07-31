## 开发与构建

需要安装 [node.js](https://nodejs.org/) v10.0 或以上环境。 

_`Linux`、 `MacOs` 系统可以考虑使用 [nvm](https://github.com/nvm-sh/nvm) 安装 `node.js`。(node.js版本管理更方便)_

### 开发

```sh
$ npm install # 安装依赖
$ npm start # 开发环境启动 启动后访问 localhost:3000
```

### 部署

```sh
$ npm install # 安装依赖
$ npm run build # 编译为静态文件
```

编译后的静态文件在 `build/` 目录下。使用任意 `web server` 托管此目录即可.
