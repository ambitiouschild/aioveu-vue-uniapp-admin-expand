<template>
  <view class="agreement-container">
    <view class="agreement-header">
      <text class="header-title">隐私政策</text>
      <text class="header-date">更新日期：2025年9月9日</text>
    </view>

    <view class="agreement-content">
      <view v-for="(section, index) in agreementContent" :key="index" class="section">
        <text class="section-title">{{ section.title }}</text>
        <text class="section-text">{{ section.content }}</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
const agreementContent = [
  {
    title: "1. 协议的范围",
    content:
      "本协议是您与我们之间关于使用本应用服务所订立的协议。您在使用本应用服务时，须完全接受本协议所有条款。",
  },
  {
    title: "2. 服务内容",
    content:
      "本应用向您提供以下服务：网络状态检测、网络性能测试以及其他相关服务。我们将持续优化和更新服务内容，为您提供更好的使用体验。",
  },
  {
    title: "3. 用户隐私",
    content:
      "我们重视用户的隐私保护，收集信息仅用于提供网络测试服务、改善用户体验和必要的系统维护。我们承诺对您的信息进行严格保密。",
  },
  {
    title: "4. 用户行为规范",
    content:
      "您在使用本服务时必须遵守中华人民共和国相关法律法规。您不得利用本服务从事违法违规活动。如发现违规行为，我们有权终止服务。",
  },
  {
    title: "5. 免责声明",
    content:
      "由于网络服务的特殊性，本应用不保证服务一定能满足用户的所有要求。对于因网络状态、通信线路等不可控因素导致的服务中断或其他缺陷，本应用不承担任何责任。",
  },
  {
    title: "6. 协议修改",
    content:
      "我们保留随时修改本协议的权利。协议修改后，如果您继续使用本应用服务，即视为您已接受修改后的协议。我们建议您定期查看本协议以了解任何变更。",
  },
];
</script>

<style lang="scss" scoped>
.agreement-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #fff;
}

.agreement-header {
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

.agreement-content {
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
