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

      <!-- 充值时间 -->
      <view class="form-item">
        <text class="form-label">充值时间</text>
        <picker
          mode="datetime"
          :value="formData.rechargeTime"
          @change="onRechargeTimeChange"
        >
          <view class="picker-view">
            {{ formData.rechargeTime || '请选择充值时间' }}
          </view>
        </picker>
      </view>

      <!-- 操作员 -->
      <view class="form-item">
        <text class="form-label">操作员</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="employeeName"
          :value="employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="picker-view">
            {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择操作员' }}
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
      <button class="form-btn confirm" @click="handleSubmit">提交</button>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuMemberRechargeRecordAPI from "@/packageF/api/aioveuMemberRechargeRecord/aioveu-member-recharge-record";
import AioveuMemberAPI from "@/packageF/api/aioveuMember/aioveu-member";
import DictAPI from '@/api/system/dict';
import AioveuEmployeeAPI from "@/packageF/api/aioveuEmployee/aioveu-employee";

export default {
  name: "AioveuMemberRechargeRecordForm",
  setup() {
    const formTitle = ref('新增充值记录');
    const recordId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      memberId: undefined,
      amount: undefined,
      giftAmount: undefined,
      paymentType: undefined,
      rechargeTime: '',
      operatorId: undefined,
      status: undefined,
      remark: ''
    });

    const memberOptions = ref([]);
    const paymentTypeOptions = ref([]);
    const employeeOptions = ref([]);
    const statusOptions = ref([]);

    const memberIndex = ref(-1);
    const paymentTypeIndex = ref(-1);
    const employeeIndex = ref(-1);
    const statusIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载会员选项
      loadMemberOptions();
      // 加载支付方式选项
      loadPaymentTypeOptions();
      // 加载操作员选项
      loadEmployeeOptions();
      // 加载状态选项
      loadStatusOptions();

      if (options.id) {
        recordId.value = Number(options.id);
        formTitle.value = '编辑充值记录';
        isEditMode.value = true;
        loadRecordData();
      } else {
        formTitle.value = '新增充值记录';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载记录数据
    const loadRecordData = async () => {
      if (!recordId.value) return;

      try {
        loading.value = true;
        const data = await AioveuMemberRechargeRecordAPI.getFormData(recordId.value);
        Object.assign(formData, data);

        // 设置会员索引
        if (formData.memberId !== undefined) {
          const index = memberOptions.value.findIndex(
            item => item.memberId === formData.memberId
          );
          memberIndex.value = index;
        }

        // 设置支付方式索引
        if (formData.paymentType !== undefined) {
          const index = paymentTypeOptions.value.findIndex(
            item => Number(item.value) === formData.paymentType
          );
          paymentTypeIndex.value = index;
        }

        // 设置操作员索引
        if (formData.operatorId !== undefined) {
          const index = employeeOptions.value.findIndex(
            item => item.employeeId === formData.operatorId
          );
          employeeIndex.value = index;
        }

        // 设置状态索引
        if (formData.status !== undefined) {
          const index = statusOptions.value.findIndex(
            item => Number(item.value) === formData.status
          );
          statusIndex.value = index;
        }
      } catch (error) {
        console.error('加载记录数据失败:', error);
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

    // 加载操作员选项
    const loadEmployeeOptions = async () => {
      try {
        const response = await AioveuEmployeeAPI.getAllEmployeeOptions();
        if (Array.isArray(response)) {
          employeeOptions.value = response;
        }
      } catch (error) {
        console.error('加载操作员选项失败:', error);
        uni.showToast({
          title: '加载操作员选项失败',
          icon: 'none'
        });
      }
    };

    // 加载状态选项
    const loadStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('member_recharge_record_status');
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

    // 支付方式选择变化
    const onPaymentTypeChange = (e) => {
      const index = e.detail.value;
      paymentTypeIndex.value = index;
      if (paymentTypeOptions.value[index]) {
        formData.paymentType = Number(paymentTypeOptions.value[index].value);
      }
    };

    // 操作员选择变化
    const onEmployeeChange = (e) => {
      const index = e.detail.value;
      employeeIndex.value = index;
      if (employeeOptions.value[index]) {
        formData.operatorId = employeeOptions.value[index].employeeId;
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

    // 充值时间选择
    const onRechargeTimeChange = (e) => {
      formData.rechargeTime = e.detail.value;
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (recordId.value) {
          // 更新记录
          await AioveuMemberRechargeRecordAPI.update(recordId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增记录
          await AioveuMemberRechargeRecordAPI.add(formData);
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
      paymentTypeOptions,
      employeeOptions,
      statusOptions,
      memberIndex,
      paymentTypeIndex,
      employeeIndex,
      statusIndex,
      isEditMode,
      onMemberChange,
      onPaymentTypeChange,
      onEmployeeChange,
      onStatusChange,
      onRechargeTimeChange,
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
