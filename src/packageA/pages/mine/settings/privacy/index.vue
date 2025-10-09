<template>
  <view class="privacy-container">
    <view class="privacy-header">
      <text class="header-title">隐私政策</text>
      <text class="header-date">更新日期：2024年3月15日</text>
    </view>

    <view class="privacy-content">
      <view v-for="(section, index) in privacyContent" :key="index" class="section">
        <text class="section-title">{{ section.title }}</text>
        <text class="section-text">{{ section.content }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const privacyContent = ref([
  {
    title: "1. 信息收集",
    content:
      "我们可能收集您的基本信息（如设备信息、操作日志等）以提供更好的服务体验。我们承诺对这些信息进行严格保密，并只用于改善产品服务。",
  },
  {
    title: "2. 信息使用",
    content:
      "收集的信息将用于：优化用户体验、提供客户支持、发送重要通知、保障账号安全等。未经您的同意，我们不会向第三方分享您的个人信息。",
  },
  {
    title: "3. 信息安全",
    content:
      "我们采用业界标准的安全技术和程序来保护您的个人信息，防止未经授权的访问、使用或泄露。我们定期审查信息收集、存储和处理实践。",
  },
  {
    title: "4. Cookie 使用",
    content:
      "我们使用 Cookie 和类似技术来提供、保护和改进我们的产品和服务。这些技术帮助我们了解用户行为，告诉我们哪些功能最受欢迎。",
  },
  {
    title: "5. 第三方服务",
    content:
      "我们的应用可能包含第三方服务。这些第三方服务有自己的隐私政策，我们建议您查看这些政策。我们不对第三方的隐私实践负责。",
  },
  {
    title: "6. 未成年人保护",
    content:
      "我们非常重视对未成年人个人信息的保护。若您是未成年人，请在监护人指导下使用我们的服务。如果您是监护人，当您对您所监护的未成年人的个人信息有疑问时，请联系我们。",
  },
  {
    title: "7. 隐私政策更新",
    content:
      "我们可能会不时更新本隐私政策。当我们更新隐私政策时，我们会在本页面上发布更新后的版本并修改更新日期。建议您定期查看本页面。",
  },
]);
</script>

<style lang="scss" scoped>
.privacy-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #fff;
}

.privacy-header {
  margin-bottom: 30px;
  text-align: center;

  .header-title {
    display: block;
    margin-bottom: 10px;
    font-size: 22px;
    font-weight: 600;
    color: #333;
  }

  .header-date {
    font-size: 14px;
    color: #999;
  }
}

.privacy-content {
  .section {
    margin-bottom: 25px;

    .section-title {
      display: block;
      margin-bottom: 12px;
      font-size: 17px;
      font-weight: 500;
      color: #333;
    }

    .section-text {
      display: block;
      font-size: 15px;
      line-height: 1.6;
      color: #666;
      text-align: justify;
    }
  }
}
</style>
