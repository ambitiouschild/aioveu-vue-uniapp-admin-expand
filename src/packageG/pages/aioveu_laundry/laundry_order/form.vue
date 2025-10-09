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

      <!-- 客户姓名 -->
      <view class="form-item">
        <text class="form-label">客户姓名</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入客户姓名"
          v-model="formData.customerName"
        />
      </view>

      <!-- 客户电话 -->
      <view class="form-item">
        <text class="form-label">客户电话</text>
        <input
          type="tel"
          class="form-input"
          placeholder="请输入客户电话"
          v-model="formData.customerPhone"
        />
      </view>

      <!-- 订单状态 -->
      <view class="form-item">
        <text class="form-label">订单状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="orderStatusOptions"
          range-key="label"
          :value="orderStatusIndex"
          @change="onOrderStatusChange"
        >
          <view class="picker-view">
            {{ orderStatusIndex >= 0 ? orderStatusOptions[orderStatusIndex].label : '请选择订单状态' }}
          </view>
        </picker>
      </view>

      <!-- 订单总额 -->
      <view class="form-item">
        <text class="form-label">订单总额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入订单总额"
          v-model="formData.totalAmount"
        />
      </view>

      <!-- 折扣金额 -->
      <view class="form-item">
        <text class="form-label">折扣金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入折扣金额"
          v-model="formData.discountAmount"
        />
      </view>

      <!-- 实付金额 -->
      <view class="form-item">
        <text class="form-label">实付金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入实付金额"
          v-model="formData.actualAmount"
        />
      </view>

      <!-- 支付状态 -->
      <view class="form-item">
        <text class="form-label">支付状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentStatusOptions"
          range-key="label"
          :value="paymentStatusIndex"
          @change="onPaymentStatusChange"
        >
          <view class="picker-view">
            {{ paymentStatusIndex >= 0 ? paymentStatusOptions[paymentStatusIndex].label : '请选择支付状态' }}
          </view>
        </picker>
      </view>

      <!-- 收衣时间 -->
      <view class="form-item">
        <text class="form-label">收衣时间</text>
        <picker
          mode="datetime"
          :value="formData.receiveTime"
          @change="onReceiveTimeChange"
        >
          <view class="picker-view">
            {{ formData.receiveTime || '请选择收衣时间' }}
          </view>
        </picker>
      </view>

      <!-- 完成时间 -->
      <view class="form-item">
        <text class="form-label">完成时间</text>
        <picker
          mode="datetime"
          :value="formData.finishTime"
          @change="onFinishTimeChange"
        >
          <view class="picker-view">
            {{ formData.finishTime || '请选择完成时间' }}
          </view>
        </picker>
      </view>

      <!-- 交付时间 -->
      <view class="form-item">
        <text class="form-label">交付时间</text>
        <picker
          mode="datetime"
          :value="formData.deliveryTime"
          @change="onDeliveryTimeChange"
        >
          <view class="picker-view">
            {{ formData.deliveryTime || '请选择交付时间' }}
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
import AioveuLaundryOrderAPI from "@/packageG/api/aioveuLaundryOrder/aioveu-laundry-order";
import AioveuMemberAPI from "@/packageG/api/aioveuMember/aioveu-member";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryOrderForm",
  setup() {
    const formTitle = ref('新增洗衣订单');
    const orderId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      memberId: undefined,
      customerName: '',
      customerPhone: '',
      status: undefined,
      totalAmount: undefined,
      discountAmount: undefined,
      actualAmount: undefined,
      paymentStatus: undefined,
      receiveTime: '',
      finishTime: '',
      deliveryTime: '',
      remark: ''
    });

    const memberOptions = ref([]);
    const orderStatusOptions = ref([]);
    const paymentStatusOptions = ref([]);

    const memberIndex = ref(-1);
    const orderStatusIndex = ref(-1);
    const paymentStatusIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载会员选项
      loadMemberOptions();
      // 加载订单状态选项
      loadOrderStatusOptions();
      // 加载支付状态选项
      loadPaymentStatusOptions();

      if (options.id) {
        orderId.value = Number(options.id);
        formTitle.value = '编辑洗衣订单';
        isEditMode.value = true;
        loadOrderData();
      } else {
        formTitle.value = '新增洗衣订单';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载订单数据
    const loadOrderData = async () => {
      if (!orderId.value) return;

      try {
        loading.value = true;
        const data = await AioveuLaundryOrderAPI.getFormData(orderId.value);
        Object.assign(formData, data);

        // 设置会员索引
        if (formData.memberId !== undefined) {
          const index = memberOptions.value.findIndex(
            item => item.memberId === formData.memberId
          );
          memberIndex.value = index;
        }

        // 设置订单状态索引
        if (formData.status !== undefined) {
          const index = orderStatusOptions.value.findIndex(
            item => Number(item.value) === formData.status
          );
          orderStatusIndex.value = index;
        }

        // 设置支付状态索引
        if (formData.paymentStatus !== undefined) {
          const index = paymentStatusOptions.value.findIndex(
            item => Number(item.value) === formData.paymentStatus
          );
          paymentStatusIndex.value = index;
        }
      } catch (error) {
        console.error('加载订单数据失败:', error);
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

    // 加载订单状态选项
    const loadOrderStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_order_status');
        orderStatusOptions.value = response;
      } catch (error) {
        console.error('加载订单状态选项失败:', error);
        uni.showToast({
          title: '加载订单状态选项失败',
          icon: 'none'
        });
      }
    };

    // 加载支付状态选项
    const loadPaymentStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_order_payment_status');
        paymentStatusOptions.value = response;
      } catch (error) {
        console.error('加载支付状态选项失败:', error);
        uni.showToast({
          title: '加载支付状态选项失败',
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

    // 订单状态选择变化
    const onOrderStatusChange = (e) => {
      const index = e.detail.value;
      orderStatusIndex.value = index;
      if (orderStatusOptions.value[index]) {
        formData.status = Number(orderStatusOptions.value[index].value);
      }
    };

    // 支付状态选择变化
    const onPaymentStatusChange = (e) => {
      const index = e.detail.value;
      paymentStatusIndex.value = index;
      if (paymentStatusOptions.value[index]) {
        formData.paymentStatus = Number(paymentStatusOptions.value[index].value);
      }
    };

    // 收衣时间选择
    const onReceiveTimeChange = (e) => {
      formData.receiveTime = e.detail.value;
    };

    // 完成时间选择
    const onFinishTimeChange = (e) => {
      formData.finishTime = e.detail.value;
    };

    // 交付时间选择
    const onDeliveryTimeChange = (e) => {
      formData.deliveryTime = e.detail.value;
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (orderId.value) {
          // 更新订单
          await AioveuLaundryOrderAPI.update(orderId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增订单
          await AioveuLaundryOrderAPI.add(formData);
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
      if (!formData.customerName) {
        uni.showToast({
          title: "请输入客户姓名",
          icon: "none"
        });
        return false;
      }

      if (!formData.customerPhone) {
        uni.showToast({
          title: "请输入客户电话",
          icon: "none"
        });
        return false;
      }

      if (formData.status === undefined) {
        uni.showToast({
          title: "请选择订单状态",
          icon: "none"
        });
        return false;
      }

      if (formData.totalAmount === undefined) {
        uni.showToast({
          title: "请输入订单总额",
          icon: "none"
        });
        return false;
      }

      if (formData.paymentStatus === undefined) {
        uni.showToast({
          title: "请选择支付状态",
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
      orderStatusOptions,
      paymentStatusOptions,
      memberIndex,
      orderStatusIndex,
      paymentStatusIndex,
      isEditMode,
      onMemberChange,
      onOrderStatusChange,
      onPaymentStatusChange,
      onReceiveTimeChange,
      onFinishTimeChange,
      onDeliveryTimeChange,
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
