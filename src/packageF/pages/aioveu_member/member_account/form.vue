<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 会员卡号 -->
      <view class="form-item">
        <text class="form-label">会员卡号</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="memberOptions"
          range-key="memberNo"
          :value="memberIndex"
          @change="onMemberChange"
          :disabled="isEditMode"
        >
          <view class="picker-view">
            {{ memberIndex >= 0 ? memberOptions[memberIndex].memberNo : '请选择会员卡号' }}
          </view>
        </picker>
      </view>

      <!-- 现金余额 -->
      <view class="form-item">
        <text class="form-label">现金余额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入现金余额"
          v-model="formData.cashBalance"
        />
      </view>

      <!-- 赠送余额 -->
      <view class="form-item">
        <text class="form-label">赠送余额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入赠送余额"
          v-model="formData.giftBalance"
        />
      </view>

      <!-- 总余额 -->
      <view class="form-item">
        <text class="form-label">总余额</text>
        <input
          type="number"
          class="form-input"
          placeholder="自动计算"
          v-model="formData.totalBalance"
          disabled
        />
      </view>

      <!-- 最后充值时间 -->
      <view class="form-item">
        <text class="form-label">最后充值时间</text>
        <picker
          mode="datetime"
          :value="formData.lastRechargeTime"
          @change="onLastRechargeTimeChange"
        >
          <view class="picker-view">
            {{ formData.lastRechargeTime || '请选择最后充值时间' }}
          </view>
        </picker>
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

<script>
import { ref, reactive, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuMemberAccountAPI from "@/packageF/api/aioveuMemberAccount/aioveu-member-account";
import AioveuMemberAPI from "@/packageF/api/aioveuMember/aioveu-member";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuMemberAccountForm",
  setup() {
    const formTitle = ref('新增会员账户');
    const accountId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      memberId: undefined,
      cashBalance: undefined,
      giftBalance: undefined,
      totalBalance: undefined,
      lastRechargeTime: '',
      status: undefined
    });

    const memberOptions = ref([]);
    const statusOptions = ref([]);

    const memberIndex = ref(-1);
    const statusIndex = ref(-1);

    const loading = ref(true);

    // 计算总余额
    const totalBalance = computed(() => {
      const cash = parseFloat(formData.cashBalance) || 0;
      const gift = parseFloat(formData.giftBalance) || 0;
      return (cash + gift).toFixed(2);
    });

    onLoad((options) => {
      // 加载会员选项
      loadMemberOptions();
      // 加载状态选项
      loadStatusOptions();

      if (options.id) {
        accountId.value = Number(options.id);
        formTitle.value = '编辑会员账户';
        isEditMode.value = true;
        loadAccountData();
      } else {
        formTitle.value = '新增会员账户';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载账户数据
    const loadAccountData = async () => {
      if (!accountId.value) return;

      try {
        loading.value = true;
        const data = await AioveuMemberAccountAPI.getFormData(accountId.value);
        Object.assign(formData, data);

        // 设置会员索引
        if (formData.memberId !== undefined) {
          const index = memberOptions.value.findIndex(
            item => item.memberId === formData.memberId
          );
          memberIndex.value = index;
        }

        // 设置状态索引
        if (formData.status !== undefined) {
          const index = statusOptions.value.findIndex(
            item => Number(item.value) === formData.status
          );
          statusIndex.value = index;
        }
      } catch (error) {
        console.error('加载账户数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 加载会员选项
    const loadMemberOptions = async () => {
      try {
        const response = await AioveuMemberAPI.getAllMemberNoOptions();
        if (Array.isArray(response)) {
          memberOptions.value = response;
        }
      } catch (error) {
        console.error('加载会员选项失败:', error);
        uni.showToast({
          title: '加载会员选项失败',
          icon: 'none'
        });
      }
    };

    // 加载状态选项
    const loadStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('member_account_status');
        statusOptions.value = response;
      } catch (error) {
        console.error('加载状态选项失败:', error);
        uni.showToast({
          title: '加载状态选项失败',
          icon: 'none'
        });
      }
    };

    // 会员选择变化
    const onMemberChange = (e) => {
      const index = e.detail.value;
      memberIndex.value = index;
      if (memberOptions.value[index]) {
        formData.memberId = memberOptions.value[index].memberId;
      }
    };

    // 状态选择变化
    const onStatusChange = (e) => {
      const index = e.detail.value;
      statusIndex.value = index;
      if (statusOptions.value[index]) {
        formData.status = Number(statusOptions.value[index].value);
      }
    };

    // 最后充值时间选择
    const onLastRechargeTimeChange = (e) => {
      formData.lastRechargeTime = e.detail.value;
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        // 更新总余额
        formData.totalBalance = totalBalance.value;

        if (accountId.value) {
          // 更新账户
          await AioveuMemberAccountAPI.update(accountId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增账户
          await AioveuMemberAccountAPI.add(formData);
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
      if (!formData.memberId) {
        uni.showToast({
          title: "请选择会员卡号",
          icon: "none"
        });
        return false;
      }

      if (formData.cashBalance === undefined) {
        uni.showToast({
          title: "请输入现金余额",
          icon: "none"
        });
        return false;
      }

      if (formData.giftBalance === undefined) {
        uni.showToast({
          title: "请输入赠送余额",
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

    return {
      formTitle,
      formData,
      memberOptions,
      statusOptions,
      memberIndex,
      statusIndex,
      isEditMode,
      onMemberChange,
      onStatusChange,
      onLastRechargeTimeChange,
      handleSubmit,
      handleCancel
    };
  }
};
</script>

<style lang="scss">
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
