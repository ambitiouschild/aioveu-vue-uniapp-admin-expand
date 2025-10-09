## 项目介绍

基于 uni-app + Vue 3 + TypeScript 移动端跨平台开发模板，集成了 ESLint、Prettier、Stylelint、Husky 和 Commitlint 等工具，确保代码规范与质量。

## 项目截图

![](https://www.youlai.tech/storage/blog/2025/04/30/app.jpg)

## 项目文档

[从0到1构建 UniApp + Vue3 + TypeScript 移动端跨平台开源脚手架](https://juejin.cn/post/7448963032993038376)

## 项目启动

安装依赖

```bash
pnpm install
```

h5启动

```bash
pnpm run dev:h5
```

访问 [http://localhost:4096](http://localhost:4096)


H5 部署
执行 pnpm run build:h5 命令来完成项目的打包：

```bash
pnpm run build:h5
```

打包后生成的静态文件位于 dist/build/h5 目录下。将该目录下的文件复制到服务器的 /usr/share/nginx/html/vue-uniapp-template 目录。


这样配置完成后，就可以通过 nginx 服务器来访问你的项目了。
