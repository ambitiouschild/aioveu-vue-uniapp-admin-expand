<template>
  <view class="about-container">
    <!-- 顶部 Logo 区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/icons/logo.png" mode="aspectFit" />
      <text class="app-name">可我不敌可爱</text>
      <text class="version">版本 {{ version }}</text>
    </view>

    <!-- 公司信息区域 -->
    <view class="company-info">
      <text class="company-name">可我不敌可爱</text>
      <view class="divider" />
      <text class="company-desc">一万年太久，只争朝夕</text>
    </view>

    <!-- 信息列表 -->
    <view class="info-list">
      <view class="list-header">
        <text class="header-title">优质项目</text>
      </view>
      <view class="info-item">
        <view class="item-content">
          <text class="item-label">aioveu-vue3-element-admin</text>
          <text class="item-desc">
            基于 Vue3 + Vite5+ TypeScript5 + Element-Plus + Pinia
            等主流技术栈构建的免费开源的中后台管理的前端模板
          </text>
        </view>
      </view>
      <view class="info-item">
        <view class="item-content">
          <text class="item-label">aioveu-vue-uniapp-template</text>
          <text class="item-desc">
            基于 uni-app + Vue 3 + TypeScript 的项目，集成了 ESLint、Prettier、Stylelint、Husky 和
            Commitlint 等工具，确保代码规范与质量。
          </text>
        </view>
      </view>
      <view class="info-item">
        <view class="item-content">
          <text class="item-label">aioveu-boot</text>
          <text class="item-desc">
            基于 JDK 17、Spring Boot 3、Spring Security 6、JWT、Redis、Mybatis-Plus、Knife4j、Vue
            3、Element-Plus 构建的前后端分离单体权限管理系统
          </text>
        </view>
      </view>
    </view>

    <!-- 底部版权信息 -->
    <view class="copyright">
      <text>Copyright © {{ getYear() }} 可我不敌可爱</text>
      <text>All Rights Reserved</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
const version = ref("5.2.0");
const getYear = () => {
  return new Date().getFullYear();
};
onMounted(() => {
  // #ifdef MP-WEIXIN
  // version.value = uni.getSystemInfoSync().appVersion;
  // #endif
});
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;

  .logo {
    width: 80px;
    height: 80px;
    margin-bottom: 15px;
  }

  .app-name {
    margin-bottom: 8px;
    font-size: 20px;
    font-weight: bold;
  }

  .version {
    font-size: 14px;
    color: #666;
  }
}

.company-info {
  padding: 30px;
  margin: 20px 0;
  text-align: center;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .company-name {
    margin-bottom: 15px;
    font-size: 20px;
    font-weight: 600;
    color: #333;
  }

  .divider {
    width: 40px;
    height: 2px;
    margin: 15px auto;
    background-color: #409eff;
  }

  .company-desc {
    padding: 0 10px;
    margin-top: 15px;
    overflow: hidden;
    font-size: 15px;
    line-height: 1.6;
    color: #666;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.info-list {
  margin: 20px 0;
  background-color: #fff;
  border-radius: 8px;

  .list-header {
    padding: 15px 20px;
    border-bottom: 1px solid #eee;

    .header-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }

    .item-content {
      flex: 1;
      padding-right: 15px;
    }

    .item-label {
      display: block;
      margin-bottom: 4px;
      font-size: 16px;
      color: #333;
    }

    .item-desc {
      display: block;
      font-size: 13px;
      line-height: 1.4;
      color: #999;
    }

    .item-value {
      font-size: 16px;
      color: #999;
    }
  }
}

.copyright {
  padding: 20px 0;
  text-align: center;

  text {
    display: block;
    font-size: 12px;
    line-height: 1.5;
    color: #999;
  }
}
</style>
