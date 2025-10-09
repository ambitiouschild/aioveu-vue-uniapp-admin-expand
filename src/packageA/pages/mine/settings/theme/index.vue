<template>
  <view class="theme-settings-container">
    <view class="title">主题色设置</view>

    <view class="color-palette">
      <view class="subtitle">选择主题色</view>
      <view class="color-grid">
        <view
          v-for="(color, index) in themeColors"
          :key="index"
          class="color-item"
          :style="{ backgroundColor: color }"
          @click="handleSelectColor(color)"
        >
          <wd-icon v-if="themeStore.primaryColor === color" name="check" color="#fff" size="16" />
        </view>
      </view>
    </view>

    <view class="custom-color">
      <view class="subtitle">自定义主题色</view>
      <view class="color-picker">
        <view class="color-preview" :style="{ backgroundColor: customColor }"></view>
        <input
          v-model="customColor"
          type="text"
          placeholder="请输入十六进制颜色值，如 #165DFF"
          class="color-input"
          maxlength="7"
        />
      </view>
      <button class="apply-btn" @click="applyCustomColor">应用</button>
    </view>

    <view class="preview-section">
      <view class="subtitle">预览效果</view>
      <view class="preview-container">
        <view class="preview-item">
          <view class="preview-button" :style="{ backgroundColor: themeStore.primaryColor }">
            按钮
          </view>
        </view>
        <view class="preview-item">
          <view class="preview-text" :style="{ color: themeStore.primaryColor }">文本颜色</view>
        </view>
        <view class="preview-item">
          <view class="preview-border" :style="{ borderColor: themeStore.primaryColor }">边框</view>
        </view>
      </view>
    </view>

    <button class="reset-btn" @click="resetTheme">恢复默认主题色</button>
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onShow } from "@dcloudio/uni-app";
import { useThemeStore } from "@/store";
import { applyThemeOnPageShow } from "@/utils/theme";

const themeStore = useThemeStore();

// 预设主题色
const themeColors = [
  "#165DFF", // Arco蓝色
  "#0FC6C2", // 青绿色
  "#722ED1", // 紫色
  "#F5222D", // 红色
  "#FA8C16", // 橙色
  "#FADB14", // 黄色
  "#52C41A", // 绿色
  "#EB2F96", // 粉色
];

// 自定义颜色
const customColor = ref("#165DFF");

// 选择预设颜色
const handleSelectColor = (color: string) => {
  themeStore.setPrimaryColor(color);
  customColor.value = color;

  // 保存设置
  saveThemeSettings();

  // 提示
  uni.showToast({
    title: "主题色已更新",
    icon: "success",
  });
};

// 应用自定义颜色
const applyCustomColor = () => {
  // 验证颜色格式
  const colorRegex = /^#([0-9A-F]{6})$/i;
  if (!colorRegex.test(customColor.value)) {
    uni.showToast({
      title: "请输入有效的颜色值",
      icon: "none",
    });
    return;
  }

  themeStore.setPrimaryColor(customColor.value);

  // 保存设置
  saveThemeSettings();

  // 提示
  uni.showToast({
    title: "自定义主题色已应用",
    icon: "success",
  });
};

// 重置为默认主题色
const resetTheme = () => {
  const defaultColor = "#165DFF"; // Arco蓝色
  themeStore.setPrimaryColor(defaultColor);
  customColor.value = defaultColor;

  // 保存设置
  saveThemeSettings();

  // 提示
  uni.showToast({
    title: "已恢复默认主题色",
    icon: "success",
  });
};

// 保存主题设置
const saveThemeSettings = () => {
  // 主题store已经处理了持久化，这里不需要额外操作
};

onLoad(() => {
  // 初始化自定义颜色输入框
  customColor.value = themeStore.primaryColor;
});

// 页面显示时重新应用主题（解决小程序环境问题）
onShow(() => {
  // 在小程序环境中，页面显示时重新应用主题
  if (typeof document === "undefined") {
    applyThemeOnPageShow(themeStore.primaryColor);

    // 为了确保样式应用，我们可以在页面中设置内联样式
    // 这样可以绕过小程序的CSS变量限制
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage) {
      console.log("当前页面重新应用主题色");
    }
  }
});
</script>

<style lang="scss" scoped>
.theme-settings-container {
  padding: 30rpx;

  .title {
    margin-bottom: 30rpx;
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .subtitle {
    margin-bottom: 20rpx;
    font-size: 30rpx;
    font-weight: 500;
    color: #333;
  }

  .color-palette {
    padding: 30rpx;
    margin-bottom: 40rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .color-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;

      .color-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        height: 80rpx;
        border-radius: 12rpx;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }

  .custom-color {
    padding: 30rpx;
    margin-bottom: 40rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .color-picker {
      display: flex;
      align-items: center;
      margin-bottom: 30rpx;

      .color-preview {
        width: 60rpx;
        height: 60rpx;
        margin-right: 20rpx;
        border-radius: 8rpx;
        box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
      }

      .color-input {
        flex: 1;
        height: 80rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        border: 1px solid #e0e0e0;
        border-radius: 8rpx;
      }
    }

    .apply-btn {
      width: 100%;
      height: 80rpx;
      font-size: 28rpx;
      line-height: 80rpx;
      color: #fff;
      background-color: var(--primary-color);
      border: none;
      border-radius: 8rpx;
    }
  }

  .preview-section {
    padding: 30rpx;
    margin-bottom: 40rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

    .preview-container {
      display: flex;
      flex-direction: column;
      gap: 20rpx;

      .preview-item {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-button {
        width: 100%;
        height: 80rpx;
        line-height: 80rpx;
        color: #fff;
        text-align: center;
        border-radius: 8rpx;
      }

      .preview-text {
        font-size: 32rpx;
        font-weight: 500;
      }

      .preview-border {
        width: 100%;
        height: 80rpx;
        line-height: 80rpx;
        text-align: center;
        background-color: #f5f5f5;
        border: 2px solid;
        border-radius: 8rpx;
      }
    }
  }

  .reset-btn {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    line-height: 80rpx;
    color: #333;
    background-color: #f5f5f5;
    border: none;
    border-radius: 8rpx;
  }
}
</style>
