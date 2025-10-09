import { createSSRApp } from "vue";
import App from "./App.vue";
import setupPlugins from "@/plugins";
import "uno.css";
import "@/styles/global.scss";

import { setupStore } from "@/store";
import { setupDirective } from "@/directive";


//在Uniapp中，您导出的createApp函数会被框架自动调用，您无需手动调用。框架会处理应用的创建和挂载。
//
// 但是，如果用户是在其他地方使用这个createApp函数，那么需要手动调用。根据用户提供的上下文，这是Uniapp的入口文件，所以不需要手动调用。
//
// 另外，用户代码中createApp函数返回了{ app }，这是正确的，因为Uniapp框架要求返回一个包含app属性的对象。
//
// 所以，我们不需要修改代码，只需要向用户解释Uniapp的启动流程即可。

//1.后端权限传递流程：
// • 用户登录时，后端返回权限列表
// • 前端通过API接口获取权限数据
// •权限数据存储在Pinia状态管理中
// • 指令从状态管理中获取权限数据


export function createApp() {
  const app = createSSRApp(App);

  console.log('正在注册权限指令...')
  // // 1. 先注册指令
  // setupDirective(app)

  // 检查指令是否被正确应用
  console.log('hasPerm指令:', app.directive('hasPerm')); // 应该返回指令定义

  // 2. 再注册插件
  app.use(setupPlugins);

  // 3. 最后注册 store
  setupStore(app);

  return {
    app,
  };
}
