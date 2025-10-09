<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">会员充值</text>
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
        >
          <view class="picker-view">
            {{ memberIndex >= 0 ? memberOptions[memberIndex].memberNo : '请选择会员卡号' }}
          </view>
        </picker>
      </view>

      <!-- 充值金额 -->
      <view class="form-item">
        <text class="form-label">充值金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入充值金额"
          v-model="formData.amount"
        />
      </view>

      <!-- 赠送金额 -->
      <view class="form-item">
        <text class="form-label">赠送金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入赠送金额"
          v-model="formData.giftAmount"
        />
      </view>

      <!-- 支付方式 -->
      <view class="form-item">
        <text class="form-label">支付方式</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentTypeOptions"
          range-key="label"
          :value="paymentTypeIndex"
          @change="onPaymentTypeChange"
        >
          <view class="picker-view">
            {{ paymentTypeIndex >= 0 ? paymentTypeOptions[paymentTypeIndex].label : '请选择支付方式' }}
          </view>
        </picker>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          placeholder="请输入备注"
          v-model="formData.remark"
        />
      </view>
    </scroll-view>

    <view class="form-footer">
      <button class="form-btn cancel" @click="handleCancel">取消</button>
      <button class="form-btn confirm" @click="handleSubmit">充值</button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import AioveuMemberRechargeRecordAPI from "@/packageF/api/aioveuMemberRechargeRecord/aioveu-member-recharge-record";
import AioveuMemberAPI from "@/packageF/api/aioveuMember/aioveu-member";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuMemberRecharge",
  setup() {
    const formData = reactive({
      memberId: undefined,
      amount: undefined,
      giftAmount: undefined,
      paymentType: undefined,
      remark: ''
    });

    const memberOptions = ref([]);
    const paymentTypeOptions = ref([]);

    const memberIndex = ref(-1);
    const paymentTypeIndex = ref(-1);

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

    // 加载支付方式选项
    const loadPaymentTypeOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('member_recharge_record_payment_type');
        paymentTypeOptions.value = response;
      } catch (error) {
        console.error('加载支付方式选项失败:', error);
        uni.showToast({
          title: '加载支付方式选项失败',
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

    // 支付方式选择变化
    const onPaymentTypeChange = (e) => {
      const index = e.detail.value;
      paymentTypeIndex.value = index;
      if (paymentTypeOptions.value[index]) {
        formData.paymentType = Number(paymentTypeOptions.value[index].value);
      }
    };

    // 提交充值
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '充值中...' });

        // 执行充值操作
        await AioveuMemberRechargeRecordAPI.saveAioveuMemberRechargeRecordandexecuteRecharge(formData);

        uni.showToast({
          title: "充值成功",
          icon: "success"
        });

        // 返回列表页
        uni.navigateBack();
      } catch (error) {
        console.error('充值失败:', error);
        uni.showToast({
          title: "充值失败",
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

      if (formData.amount === undefined) {
        uni.showToast({
          title: "请输入充值金额",
          icon: "none"
        });
        return false;
      }

      if (formData.paymentType === undefined) {
        uni.showToast({
          title: "请选择支付方式",
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

    onMounted(() => {
      loadMemberOptions();
      loadPaymentTypeOptions();
    });

    return {
      formData,
      memberOptions,
      paymentTypeOptions,
      memberIndex,
      paymentTypeIndex,
      onMemberChange,
      onPaymentTypeChange,
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
