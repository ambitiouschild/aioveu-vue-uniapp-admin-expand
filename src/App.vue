<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useThemeStore } from "@/store";

import { useUserStore } from "@/store/modules/user"; // 添加用户store

// 主题初始化
const themeStore = useThemeStore();
const userStore = useUserStore(); // 添加用户store实例

onLaunch(async() => {
  console.log("App Launch");
  // 初始化主题
  themeStore.initTheme();

  // // 2. 加载用户权限数据
  // try {
  //   // 加载用户信息（包含权限数据）
  //   await userStore.getInfo();
  //   console.log("用户信息和权限数据加载成功");
  // } catch (error) {
  //   console.error("加载用户信息失败", error);
  //   uni.showToast({
  //     title: "加载用户信息失败",
  //     icon: "none"
  //   });
  // }

});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
/* H5 环境样式变量设置 */
:root {
  --primary-color: #165dff;
  --primary-color-light: #94bfff;
  --primary-color-dark: #0e3c9b;
}

/* 小程序环境样式变量设置 */
page {
  --primary-color: #165dff;
  --primary-color-light: #94bfff;
  --primary-color-dark: #0e3c9b;
  background: #f8f8f8;
}

/* 动态加载小程序主题色的钩子 */
/* 用于通过小程序原生API获取主题色并应用 */
.theme-container {
  display: none;
}
</style>
