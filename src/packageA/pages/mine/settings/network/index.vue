<template>
  <view class="network-container">
    <!-- 网络状态展示 -->
    <view class="status-card">
      <view class="status-header">
        <text class="title">网络状态</text>
        <text :class="['status-badge', networkType ? 'online' : 'offline']">
          {{ networkType ? "在线" : "离线" }}
        </text>
      </view>
      <view class="status-info">
        <view class="info-item">
          <text class="label">网络类型：</text>
          <text class="value">{{ networkType || "未知" }}</text>
        </view>
        <view class="info-item">
          <text class="label">网络强度：</text>
          <text class="value">{{ signalStrength }}</text>
        </view>
      </view>
    </view>

    <!-- 网络测试 -->
    <view class="test-card">
      <view class="test-header">
        <text class="title">网络测试</text>
        <text class="subtitle">测试服务器连接情况</text>
      </view>

      <view class="test-content">
        <view class="test-item">
          <text class="label">延迟：</text>
          <text class="value">{{ pingResult.delay }}ms</text>
          <text :class="['status', getPingStatus]">{{ pingResult.status }}</text>
        </view>

        <view v-if="testing" class="progress-bar">
          <view class="progress" :style="{ width: `${progress}%` }" />
        </view>

        <button class="test-btn" :disabled="testing" @click="startTest">
          {{ testing ? "测试中..." : "开始测试" }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import request from "@/utils/request";

interface PingResult {
  delay: string | number;
  status: string;
}

// 声明全局 wx 对象
declare const wx: any;

// 响应式状态
const networkType = ref("");
const signalStrength = ref("获取中...");
const testing = ref(false);
const progress = ref(0);
const pingResult = ref<PingResult>({
  delay: "--",
  status: "未测试",
});
const networkListener = ref<any>(null);

// 计算属性
const getPingStatus = computed(() => {
  if (pingResult.value.delay === "--") return "";
  // 将 delay 转换为数字进行比较
  const delay = Number(pingResult.value.delay);
  if (isNaN(delay)) return "";
  if (delay < 100) return "good";
  if (delay < 300) return "normal";
  return "bad";
});

// 方法
const getNetworkType = async () => {
  try {
    const res = await uni.getNetworkType();
    networkType.value = res.networkType;

    // 微信小程序支持获取信号强度
    // #ifdef MP-WEIXIN
    if (wx?.getNetworkWeakness) {
      const weaknessRes = await wx.getNetworkWeakness();
      signalStrength.value = `${weaknessRes.weaknessLevel}%`;
    } else {
      signalStrength.value = "不支持";
    }
    // #endif

    // H5环境
    // #ifdef H5
    signalStrength.value = (navigator as any).connection
      ? `${(navigator as any).connection.effectiveType || "未知"}`
      : "不支持";
    // #endif
  } catch {
    networkType.value = "获取失败";
    signalStrength.value = "获取失败";
  }
};

// 监听网络状态变化
const listenNetworkStatus = () => {
  // #ifdef MP-WEIXIN
  networkListener.value = wx?.onNetworkStatusChange((res: any) => {
    networkType.value = res.networkType;
    getNetworkType();
  });
  // #endif

  // #ifdef H5
  window.addEventListener("online", getNetworkType);
  window.addEventListener("offline", () => {
    networkType.value = "";
    signalStrength.value = "离线";
  });
  // #endif
};

// 开始网络测试
const startTest = async () => {
  if (testing.value) return;

  testing.value = true;
  progress.value = 0;
  pingResult.value.delay = "--";
  pingResult.value.status = "测试中";

  const progressTimer = setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);

  try {
    const startTime = Date.now();
    // #ifdef H5
    await uni.request({
      url: "/api/v1/auth/captcha",
      timeout: 5000,
    });
    // #endif
    // #ifndef H5
    await request({
      url: "/api/v1/auth/captcha",
      timeout: 5000,
    });
    // #endif
    const endTime = Date.now();
    const delay = endTime - startTime;

    pingResult.value.delay = delay;
    pingResult.value.status = delay < 300 ? "正常" : "较慢";
  } catch {
    pingResult.value.delay = "--";
    pingResult.value.status = "连接失败";
  } finally {
    clearInterval(progressTimer);
    progress.value = 100;
    setTimeout(() => {
      testing.value = false;
      progress.value = 0;
    }, 500);
  }
};

// 生命周期钩子
onMounted(() => {
  getNetworkType();
  listenNetworkStatus();
});

onBeforeUnmount(() => {
  // #ifdef MP-WEIXIN
  if (networkListener.value?.clear) {
    networkListener.value.clear();
  }
  // #endif

  // #ifdef H5
  window.removeEventListener("online", getNetworkType);
  window.removeEventListener("offline", getNetworkType);
  // #endif
});
</script>

<style lang="scss" scoped>
.network-container {
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.status-card,
.test-card {
  padding: 20px;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.status-header,
.test-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
}

.status-badge {
  padding: 4px 12px;
  font-size: 14px;
  border-radius: 12px;

  &.online {
    color: #4caf50;
    background-color: #e8f5e9;
  }

  &.offline {
    color: #f44336;
    background-color: #ffebee;
  }
}

.status-info,
.test-content {
  .info-item,
  .test-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .label {
      width: 100px;
      font-size: 15px;
      color: #666;
    }

    .value {
      flex: 1;
      font-size: 15px;
      color: #333;
    }

    .status {
      padding: 2px 8px;
      font-size: 13px;
      border-radius: 4px;

      &.good {
        color: #4caf50;
        background-color: #e8f5e9;
      }

      &.normal {
        color: #ff9800;
        background-color: #fff3e0;
      }

      &.bad {
        color: #f44336;
        background-color: #ffebee;
      }
    }
  }
}

.test-header {
  .subtitle {
    font-size: 14px;
    color: #999;
  }
}

.progress-bar {
  height: 4px;
  margin: 20px 0;
  overflow: hidden;
  background-color: #f5f5f5;
  border-radius: 2px;

  .progress {
    height: 100%;
    background-color: #409eff;
    transition: width 0.2s ease-in-out;
  }
}

.test-btn {
  width: 100%;
  height: 44px;
  margin-top: 20px;
  font-size: 16px;
  line-height: 44px;
  color: #fff;
  text-align: center;
  background-color: #409eff;
  border: none;
  border-radius: 22px;

  &:active {
    opacity: 0.9;
  }

  &[disabled] {
    cursor: not-allowed;
    background-color: #a0cfff;
  }
}
</style>
