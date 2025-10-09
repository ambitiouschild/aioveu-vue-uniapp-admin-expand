<template>
  <view class="feedback-container">
    <!-- 问题类型选择 -->
    <wd-cell-group title="问题类型" border>
      <view class="radio-group">
        <label v-for="item in feedbackTypes" :key="item.value" class="radio-item">
          <text class="radio-text">{{ item.label }}</text>
          <radio
            :value="item.value"
            :checked="feedbackType === item.value"
            color="#0083ff"
            class="radio-button"
            style="transform: scale(0.8)"
            @click="handleRadioChange(item.value)"
          />
        </label>
      </view>
    </wd-cell-group>

    <!-- 问题描述 -->
    <wd-cell-group title="问题描述" border>
      <wd-textarea
        v-model="description"
        placeholder="请详细描述您遇到的问题或建议..."
        :maxlength="500"
        show-count
        :rows="5"
      />
    </wd-cell-group>

    <!-- 图片上传 -->
    <wd-cell-group title="相关截图（选填）" border>
      <view class="upload-box">
        <wd-upload
          v-model="fileList"
          :max-count="3"
          :before-read="beforeRead"
          @delete="handleDelete"
        />
      </view>
    </wd-cell-group>

    <!-- 联系方式 -->
    <wd-cell-group title="联系方式（选填）" border>
      <wd-input v-model="contact" placeholder="请输入您的手机号或邮箱" clearable />
    </wd-cell-group>

    <!-- 提交按钮 -->
    <view class="submit-btn">
      <wd-button type="primary" block :loading="submitting" @click="handleSubmit">
        提交反馈
      </wd-button>
    </view>

    <wd-toast />
  </view>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useToast } from "wot-design-uni";
import { checkLogin } from "@/packageA/utils/auth";

const toast = useToast();

// 检查登录状态
onLoad(() => {
  if (!checkLogin()) return;
});

// 问题类型选项
const feedbackTypes = [
  { label: "功能异常", value: "bug" },
  { label: "优化建议", value: "suggestion" },
  { label: "其他问题", value: "other" },
];

// 表单数据
const feedbackType = ref("bug");
const description = ref("");
const fileList = ref<any[]>([]);
const contact = ref("");
const submitting = ref(false);

// 图片上传前的校验
const beforeRead = (file: any) => {
  // 验证文件类型
  const validTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validTypes.includes(file.type)) {
    toast.error("请上传 jpg、png 或 gif 格式的图片");
    return false;
  }
  // 验证文件大小（限制为 5MB）
  if (file.size > 5 * 1024 * 1024) {
    toast.error("图片大小不能超过 5MB");
    return false;
  }
  return true;
};

// 删除图片
const handleDelete = (detail: any) => {
  const index = detail.index;
  fileList.value.splice(index, 1);
};

// 处理单选框变化
const handleRadioChange = (value: string) => {
  feedbackType.value = value;
};

// 提交反馈
const handleSubmit = async () => {
  // 表单验证
  if (!description.value.trim()) {
    toast.error("请描述您遇到的问题");
    return;
  }

  submitting.value = true;
  try {
    // TODO: 调用提交反馈的接口
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 模拟提交
    toast.success("提交成功");
    // 重置表单
    description.value = "";
    fileList.value = [];
    contact.value = "";

    // 延迟返回上一页
    setTimeout(() => {
      uni.navigateBack();
    }, 1500);
  } catch {
    toast.error("提交失败，请重试");
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.feedback-container {
  min-height: 100vh;
  padding: 20rpx 0;
  background-color: #f5f5f5;

  :deep(.wd-cell-group__title) {
    padding: 20rpx 30rpx 10rpx;
    font-size: 28rpx;
    color: #666;
  }

  .radio-group {
    padding: 4rpx 0;
    background-color: #fff;
  }

  .radio-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 30rpx;
    border-bottom: 1px solid #eee;

    &:last-child {
      border-bottom: none;
    }
  }

  .radio-text {
    font-size: 22rpx;
    color: #333;
  }

  .upload-box {
    padding: 20rpx 30rpx;
  }

  .submit-btn {
    margin: 40rpx 30rpx;
  }

  :deep(.wd-textarea) {
    padding: 20rpx 30rpx;
    background-color: #fff;
  }

  .radio-button {
    margin-right: -8rpx;
  }
}
</style>
