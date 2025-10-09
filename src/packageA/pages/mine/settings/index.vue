<template>
  <view class="settings-container">
    <wd-cell-group>
      <wd-cell title="个人资料" icon="user" is-link @click="navigateToProfile" />
      <wd-cell title="账号和安全" icon="secured" is-link @click="navigateToAccount" />
      <wd-cell title="主题设置" icon="setting1" is-link @click="navigateToTheme" />
      <wd-cell title="用户协议" icon="user" is-link @click="navigateToUserAgreement" />
      <wd-cell title="隐私政策" icon="folder" is-link @click="navigateToPrivacy" />
      <wd-cell title="关于可我不敌可爱" icon="info" is-link @click="navigateToAbout" />
    </wd-cell-group>

    <wd-cell-group custom-style="margin-top:40rpx">
      <wd-cell title="网络测试" icon="wifi" is-link @click="navigateToNetworkTest" />
      <wd-cell
        title="清空缓存"
        icon="delete1"
        :value="cacheSize"
        clickable
        @click="handleClearCache"
      />
    </wd-cell-group>

    <view v-if="isLogin" class="logout-section">
      <wd-button class="logout-btn" @click="handleLogout">退出登录</wd-button>
    </view>

    <!-- 全屏 loading -->
    <view v-if="clearing" class="loading-mask">
      <view class="loading-content">
        <view class="loading-icon" />
        <text class="loading-text">正在清理...</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useUserStore } from "@/store/modules/user";
import { checkLogin } from "@/packageA/utils/auth";
import { computed, ref } from "vue";

const userStore = useUserStore();
const isLogin = computed(() => !!userStore.userInfo);

// 个人资料
const navigateToProfile = () => {
  if (checkLogin()) {
    uni.navigateTo({
      url: "/packageA/pages/mine/profile/index",
    });
  }
};

// 账号和安全
const navigateToAccount = () => {
  if (checkLogin()) {
    uni.navigateTo({
      url: "/packageA/pages/mine/settings/account/index",
    });
  }
};

// 主题设置
const navigateToTheme = () => {
  uni.navigateTo({
    url: "/packageA/pages/mine/settings/theme/index",
  });
};

// 用户协议
const navigateToUserAgreement = () => {
  uni.navigateTo({
    url: "/packageA/pages/mine/settings/agreements/index",
  });
};

// 隐私政策
const navigateToPrivacy = () => {
  uni.navigateTo({
    url: "/packageA/pages/mine/settings/agreements/privacy-policy",
  });
};

// 关于可我不敌可爱
const navigateToAbout = () => {
  uni.navigateTo({
    url: "/packageA/pages/mine/about/index",
  });
};

// 网络测试
const navigateToNetworkTest = () => {
  uni.navigateTo({ url: "/packageA/pages/mine/settings/network/index" });
};

// 是否正在清理
const clearing = ref(false);
// 缓存大小
const cacheSize = ref<any>("计算中...");
// 获取缓存大小
const getCacheSize = async () => {
  try {
    // #ifdef MP-WEIXIN
    const res = await uni.getStorageInfo();
    cacheSize.value = formatSize(res.currentSize);
    // #endif
    // #ifdef H5
    cacheSize.value = formatSize(
      Object.keys(localStorage).reduce((size, key) => size + localStorage[key].length, 0)
    );
    // #endif
    if (!cacheSize.value) {
      cacheSize.value = "0B";
    }
  } catch (error) {
    console.error("获取缓存大小失败:", error);
    cacheSize.value = "获取失败";
  }
};

// 格式化存储大小
const formatSize = (size: number) => {
  if (size < 1024) {
    return size + "B";
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(2) + "KB";
  } else {
    return (size / 1024 / 1024).toFixed(2) + "MB";
  }
};

// 处理清除缓存
const handleClearCache = async () => {
  if (cacheSize.value === "获取失败") {
    uni.showToast({
      title: "获取缓存信息失败，请稍后重试",
      icon: "none",
      duration: 2000,
    });
    return;
  }
  if (cacheSize.value === "0B") {
    uni.showToast({
      title: "暂无缓存需要清理",
      icon: "none",
      duration: 2000,
    });
    return;
  }
  if (clearing.value) {
    return;
  }

  try {
    clearing.value = true;
    // 模拟清理过程
    await new Promise((resolve) => setTimeout(resolve, 1500));
    // 清除缓存
    await uni.clearStorage();
    // 更新缓存大小显示
    await getCacheSize();
    // 提示清理成功
    uni.showToast({
      title: "清理成功",
      icon: "success",
    });
  } catch {
    uni.showToast({
      title: "清理失败",
      icon: "error",
    });
  } finally {
    clearing.value = false;
  }
};

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: "提示",
    content: "确定要退出登录吗？",
    success: function (res) {
      if (res.confirm) {
        userStore.logout();
        uni.showToast({
          title: "已退出登录",
          icon: "success",
        });
      }
    },
  });
};

// 检查登录状态
onLoad(() => {
  if (!checkLogin()) return;

  getCacheSize();
});
</script>
<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  padding: 20px;

  .loading-mask {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.4);

    .loading-content {
      padding: 30rpx 40rpx;
      text-align: center;
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 12rpx;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);

      .loading-icon {
        width: 60rpx;
        height: 60rpx;
        margin: 0 auto 20rpx;
        border: 4rpx solid #f3f3f3;
        border-top: 4rpx solid #409eff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
      }
    }
  }

  .logout-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 20rpx;
    margin-top: 60rpx;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 90rpx;
    font-size: 32rpx;
    font-weight: 500;
    color: #fff;
    background-color: var(--primary-color);
    border: none;
    border-radius: 45rpx;
    box-shadow: 0 4rpx 12rpx rgba(var(--primary-color-rgb), 0.3);
    transition: opacity 0.2s;

    &:active {
      opacity: 0.85;
    }
  }
}
</style>
