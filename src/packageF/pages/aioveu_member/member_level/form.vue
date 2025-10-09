<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 等级名称 -->
      <view class="form-item">
        <text class="form-label">等级名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入等级名称"
          v-model="formData.levelName"
        />
      </view>

      <!-- 最低消费额 -->
      <view class="form-item">
        <text class="form-label">最低消费额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入最低消费额"
          v-model="formData.minAmount"
        />
      </view>

      <!-- 折扣率 -->
      <view class="form-item">
        <text class="form-label">折扣率</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入折扣率"
          v-model="formData.discount"
        />
      </view>

      <!-- 权益描述 -->
      <view class="form-item">
        <text class="form-label">权益描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入权益描述"
          v-model="formData.benefits"
        />
      </view>

      <!-- 状态 -->
      <view class="form-item">
        <text class="form-label">状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="statusOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? statusOptions[statusIndex].label : '请选择状态' }}
          </view>
        </picker>
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="form-btn cancel" @click="handleCancel">取消</button>
      <button class="form-btn confirm" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuMemberLevelAPI, {
  AioveuMemberLevelForm
} from "@/packageF/api/aioveuMemberLevel/aioveu-member-level";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增会员等级');
const warehouseId = ref<number | undefined>(undefined);

const formData = reactive<AioveuMemberLevelForm>({
  levelName: '',
  minAmount: undefined,
  discount: undefined,
  benefits: '',
  status: undefined
});

const statusOptions = ref<DictItemOption[]>([]);
const statusIndex = ref(-1);

const loading = ref(true);

onLoad((options: any) => {
  // 加载状态选项
  loadStatusOptions();

  if (options.id) {
    warehouseId.value = Number(options.id);
    formTitle.value = '编辑会员等级';
    loadMemberLevelData();
  } else {
    formTitle.value = '新增会员等级';
    loading.value = false;
  }
});

// 加载会员等级数据
const loadMemberLevelData = async () => {
  if (!warehouseId.value) return;

  try {
    loading.value = true;
    const data = await AioveuMemberLevelAPI.getFormData(warehouseId.value);
    Object.assign(formData, data);

    // 设置状态索引
    if (formData.status !== undefined) {
      const index = statusOptions.value.findIndex(
        item => Number(item.value) === formData.status
      );
      statusIndex.value = index;
    }
  } catch (error) {
    console.error('加载会员等级数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载状态选项
const loadStatusOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('member_level_status');
    statusOptions.value = response;
  } catch (error) {
    console.error('加载状态选项失败:', error);
    uni.showToast({
      title: '加载状态选项失败',
      icon: 'none'
    });
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    formData.status = Number(statusOptions.value[index].value);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    if (warehouseId.value) {
      // 更新会员等级
      await AioveuMemberLevelAPI.update(warehouseId.value, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增会员等级
      await AioveuMemberLevelAPI.add(formData);
      uni.showToast({
        title: "新增成功",
        icon: "success"
      });
    }

    // 返回列表页
    uni.navigateBack();
  } catch (error) {
    console.error('提交表单失败:', error);
    uni.showToast({
      title: "提交失败",
      icon: "none"
    });
  } finally {
    uni.hideLoading();
  }
};

// 表单验证
const validateForm = () => {
  if (!formData.levelName) {
    uni.showToast({
      title: "请输入等级名称",
      icon: "none"
    });
    return false;
  }

  if (formData.minAmount === undefined) {
    uni.showToast({
      title: "请输入最低消费额",
      icon: "none"
    });
    return false;
  }

  if (formData.discount === undefined) {
    uni.showToast({
      title: "请输入折扣率",
      icon: "none"
    });
    return false;
  }

  if (formData.status === undefined) {
    uni.showToast({
      title: "请选择状态",
      icon: "none"
    });
    return false;
  }

  return true;
};

// 取消
const handleCancel = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.form-header {
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;

  .form-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1a1a1a;
    text-align: center;
  }
}

.form-body {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  padding: 24rpx;
  max-height: 70vh;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 30rpx;
  color: #666;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input, .form-picker, .form-textarea {
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
}

.form-textarea {
  height: 200rpx;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

/* 表单底部按钮容器 */
.form-footer {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  background: #f8f9fa;
  gap: 24rpx;
  margin-top: 24rpx;
  border-top: 1rpx solid #eaeaea;

  .form-btn {
    flex: 1;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 30rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;

    &.cancel {
      background: #f5f5f5;
      color: #666;
    }

    &.confirm {
      background: #5e72e4;
      color: white;
    }
  }
}
</style>
