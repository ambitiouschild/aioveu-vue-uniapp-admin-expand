<template>
  <view class="login-container">
    <!-- 背景图 -->
    <image src="/static/images/login-bg.svg" mode="aspectFill" class="login-bg" />

    <!-- Logo和标题区域 -->
    <view class="header">
      <image src="/static/icons/logo.png" class="logo" />
      <text class="title">可我不敌可爱</text>
      <text class="subtitle">恰同学少年，风华正茂；书生意气，挥斥方遒</text>
    </view>

    <!-- 登录表单区域 -->
    <view class="login-card">
      <view class="form-wrap">
        <wd-form ref="loginFormRef" :model="loginFormData">
          <!-- 用户名输入框 -->
          <view class="form-item">
            <wd-icon name="user" size="22" color="#165DFF" class="input-icon" />
            <input v-model="loginFormData.username" class="form-input" placeholder="请输入用户名" />
            <wd-icon
              v-if="loginFormData.username"
              name="close-fill"
              size="18"
              color="#9ca3af"
              class="clear-icon"
              @click="loginFormData.username = ''"
            />
          </view>
          <view class="divider"></view>

          <!-- 密码输入框 -->
          <view class="form-item">
            <wd-icon name="lock-on" size="22" color="#165DFF" class="input-icon" />
            <input
              v-model="loginFormData.password"
              class="form-input"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              placeholder-style="color: #9ca3af; font-weight: normal;"
            />
            <wd-icon
              :name="showPassword ? 'eye-open' : 'eye-close'"
              size="18"
              color="#9ca3af"
              class="eye-icon"
              @click="showPassword = !showPassword"
            />
          </view>
          <view class="divider"></view>

          <!-- 登录按钮 -->
          <button
            class="login-btn"
            :disabled="loading"
            :style="loading ? 'opacity: 0.7;' : ''"
            @click="handleLogin"
          >
            登录
          </button>
        </wd-form>

        <!-- 微信登录 -->
        <view class="other-login">
          <view class="other-login-title">
            <view class="line"></view>
            <text class="text">其他登录方式</text>
            <view class="line"></view>
          </view>

          <view class="wechat-login" @click="handleWechatLogin">
            <view class="wechat-icon-wrapper">
              <image src="/static/icons/weixin.png" class="wechat-icon" />
            </view>
          </view>
        </view>

        <!-- 底部协议 -->
        <view class="agreement">
          <text class="text">登录即同意</text>
          <text class="link" @click="navigateToUserAgreement">《用户协议》</text>
          <text class="text">和</text>
          <text class="link" @click="navigateToPrivacy">《隐私政策》</text>
        </view>
      </view>
    </view>

    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { onLoad } from "@dcloudio/uni-app";
import { type LoginFormData } from "@/api/auth";
import { useUserStore } from "@/store/modules/user";
import { useToast } from "wot-design-uni";
import { ref } from "vue";

const loginFormRef = ref();
const toast = useToast();
const loading = ref(false);
const userStore = useUserStore();
const showPassword = ref(false);

// 登录表单数据
const loginFormData = ref<LoginFormData>({
  username: "aioveu",
  password: "aioveu",
});

// 获取重定向参数
const redirect = ref("");
onLoad((options) => {
  if (options) {
    redirect.value = options.redirect ? decodeURIComponent(options.redirect) : "/pages/index/index";
  } else {
    redirect.value = "/pages/index/index";
  }
});

// 登录处理
const handleLogin = () => {
  if (loading.value) return;
  loading.value = true;

  userStore
    .login(loginFormData.value)
    .then(() => userStore.getInfo())
    .then(() => {
      toast.success("登录成功");

      // 检查用户信息是否完整
      if (!userStore.isUserInfoComplete()) {
        // 信息不完整，跳转到完善信息页面
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/login/complete-profile?redirect=${encodeURIComponent(redirect.value)}`,
          });
        }, 1000);
      } else {
        // 否则直接跳转到重定向页面
        setTimeout(() => {
          uni.reLaunch({
            url: redirect.value,
          });
        }, 1000);
      }
    })
    .catch((error) => {
      toast.error(error?.message || "登录失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

// 微信登录处理
const handleWechatLogin = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    // #ifdef MP-WEIXIN
    // 获取微信登录的临时 code
    const { code } = await uni.login({
      provider: "weixin",
    });

    // 调用后端接口进行登录认证
    const result = await userStore.loginByWechat(code);

    if (result) {
      // 获取用户信息
      await userStore.getInfo();
      toast.success("登录成功");

      // 检查用户信息是否完整
      if (!userStore.isUserInfoComplete()) {
        // 如果信息不完整，跳转到完善信息页面
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/login/complete-profile?redirect=${encodeURIComponent(redirect.value)}`,
          });
        }, 1000);
      } else {
        // 否则直接跳转到重定向页面
        setTimeout(() => {
          uni.reLaunch({
            url: redirect.value,
          });
        }, 1000);
      }
    }
    // #endif

    // #ifndef MP-WEIXIN
    toast.error("当前环境不支持微信登录");
    // #endif
  } catch (error: any) {
    toast.error(error?.message || "微信登录失败");
  } finally {
    loading.value = false;
  }
};

// 跳转到用户协议页面
const navigateToUserAgreement = () => {
  uni.navigateTo({
    url: "/pages/mine/user-agreement/index",
  });
};

// 跳转到隐私政策页面
const navigateToPrivacy = () => {
  uni.navigateTo({
    url: "/pages/mine/privacy/index",
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.header {
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
}

.title {
  margin-bottom: 10rpx;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 28rpx;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.login-card {
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-top: 80rpx;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-wrap {
  padding: 40rpx;
}

.form-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24rpx 0;
}

.input-icon {
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  line-height: 60rpx;
  color: #333;
}

.clear-icon,
.eye-icon {
  padding: 10rpx;
}

.divider {
  height: 1px;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.06);
}

.login-btn {
  width: 100%;
  height: 90rpx;
  margin-top: 60rpx;
  font-size: 32rpx;
  line-height: 90rpx;
  color: #fff;
  background: linear-gradient(90deg, #165dff, #4080ff);
  border: none;
  border-radius: 45rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 93, 255, 0.3);
  transition: all 0.3s;
}

.login-btn:active {
  box-shadow: 0 4rpx 10rpx rgba(22, 93, 255, 0.2);
  transform: translateY(2rpx);
}

.other-login {
  margin-top: 60rpx;
}

.other-login-title {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.line {
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.08);
}

.text {
  padding: 0 30rpx;
  font-size: 26rpx;
  color: #9ca3af;
}

.wechat-login {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.wechat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.wechat-icon {
  width: 60rpx;
  height: 60rpx;
}

.agreement {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
  font-size: 24rpx;
}

.agreement .text {
  padding: 0 4rpx;
  color: #9ca3af;
}

.agreement .link {
  color: #165dff;
}
</style>
