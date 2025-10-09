<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 订单号 -->
      <view class="form-item">
        <text class="form-label">订单号</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="orderOptions"
          range-key="orderNo"
          :value="orderIndex"
          @change="onOrderChange"
          :disabled="isEditMode"
        >
          <view class="picker-view">
            {{ orderIndex >= 0 ? orderOptions[orderIndex].orderNo : '请选择订单号' }}
          </view>
        </picker>
      </view>

      <!-- 衣物类型 -->
      <view class="form-item">
        <text class="form-label">衣物类型</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="clothingTypeOptions"
          range-key="clothingTypeName"
          :value="clothingTypeIndex"
          @change="onClothingTypeChange"
        >
          <view class="picker-view">
            {{ clothingTypeIndex >= 0 ? clothingTypeOptions[clothingTypeIndex].clothingTypeName : '请选择衣物类型' }}
          </view>
        </picker>
      </view>

      <!-- 自定义衣物类型 -->
      <view class="form-item">
        <text class="form-label">自定义衣物类型</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入自定义衣物类型"
          v-model="formData.customType"
        />
      </view>

      <!-- 问题描述 -->
      <view class="form-item">
        <text class="form-label">问题描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入问题描述"
          v-model="formData.problemDesc"
        />
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <text class="form-label">价格</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入价格"
          v-model="formData.price"
        />
      </view>

      <!-- 处理状态 -->
      <view class="form-item">
        <text class="form-label">处理状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="processStatusOptions"
          range-key="label"
          :value="processStatusIndex"
          @change="onProcessStatusChange"
        >
          <view class="picker-view">
            {{ processStatusIndex >= 0 ? processStatusOptions[processStatusIndex].label : '请选择处理状态' }}
          </view>
        </picker>
      </view>

      <!-- 特殊要求 -->
      <view class="form-item">
        <text class="form-label">特殊要求</text>
        <textarea
          class="form-textarea"
          placeholder="请输入特殊要求"
          v-model="formData.specialInstruction"
        />
      </view>

      <!-- 开始处理时间 -->
      <view class="form-item">
        <text class="form-label">开始处理时间</text>
        <picker
          mode="datetime"
          :value="formData.startTime"
          @change="onStartTimeChange"
        >
          <view class="picker-view">
            {{ formData.startTime || '请选择开始处理时间' }}
          </view>
        </picker>
      </view>

      <!-- 完成处理时间 -->
      <view class="form-item">
        <text class="form-label">完成处理时间</text>
        <picker
          mode="datetime"
          :value="formData.endTime"
          @change="onEndTimeChange"
        >
          <view class="picker-view">
            {{ formData.endTime || '请选择完成处理时间' }}
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
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuLaundryOrderItemAPI from "@/packageG/api/aioveuLaundryOrderItem/aioveu-laundry-order-item";
import AioveuLaundryOrderAPI from "@/packageG/api/aioveuLaundryOrder/aioveu-laundry-order";
import AioveuLaundryClothingTypeAPI from "@/packageG/api/aioveuLaundryClothingType/aioveu-laundry-clothing-type";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryOrderItemForm",
  setup() {
    const formTitle = ref('新增衣物明细');
    const itemId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      orderId: undefined,
      clothingTypeId: undefined,
      customType: '',
      problemDesc: '',
      price: undefined,
      processStatus: undefined,
      specialInstruction: '',
      startTime: '',
      endTime: ''
    });

    const orderOptions = ref([]);
    const clothingTypeOptions = ref([]);
    const processStatusOptions = ref([]);

    const orderIndex = ref(-1);
    const clothingTypeIndex = ref(-1);
    const processStatusIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载订单选项
      loadOrderOptions();
      // 加载衣物类型选项
      loadClothingTypeOptions();
      // 加载处理状态选项
      loadProcessStatusOptions();

      if (options.id) {
        itemId.value = Number(options.id);
        formTitle.value = '编辑衣物明细';
        isEditMode.value = true;
        loadItemData();
      } else {
        formTitle.value = '新增衣物明细';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载衣物明细数据
    const loadItemData = async () => {
      if (!itemId.value) return;

      try {
        loading.value = true;
        const data = await AioveuLaundryOrderItemAPI.getFormData(itemId.value);
        Object.assign(formData, data);

        // 设置订单索引
        if (formData.orderId !== undefined) {
          const index = orderOptions.value.findIndex(
            item => item.orderId === formData.orderId
          );
          orderIndex.value = index;
        }

        // 设置衣物类型索引
        if (formData.clothingTypeId !== undefined) {
          const index = clothingTypeOptions.value.findIndex(
            item => item.clothingTypeId === formData.clothingTypeId
          );
          clothingTypeIndex.value = index;
        }

        // 设置处理状态索引
        if (formData.processStatus !== undefined) {
          const index = processStatusOptions.value.findIndex(
            item => Number(item.value) === formData.processStatus
          );
          processStatusIndex.value = index;
        }
      } catch (error) {
        console.error('加载衣物明细数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 加载订单选项
    const loadOrderOptions = async () => {
      try {
        const response = await AioveuLaundryOrderAPI.getAllLaundryOrderOptions();
        if (Array.isArray(response)) {
          orderOptions.value = response;
        }
      } catch (error) {
        console.error('加载订单选项失败:', error);
        uni.showToast({
          title: '加载订单选项失败',
          icon: 'none'
        });
      }
    };

    // 加载衣物类型选项
    const loadClothingTypeOptions = async () => {
      try {
        const response = await AioveuLaundryClothingTypeAPI.getAllLaundryClothingTypeOptions();
        if (Array.isArray(response)) {
          clothingTypeOptions.value = response;
        }
      } catch (error) {
        console.error('加载衣物类型选项失败:', error);
        uni.showToast({
          title: '加载衣物类型选项失败',
          icon: 'none'
        });
      }
    };

    // 加载处理状态选项
    const loadProcessStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_order_item_process_status');
        processStatusOptions.value = response;
      } catch (error) {
        console.error('加载处理状态选项失败:', error);
        uni.showToast({
          title: '加载处理状态选项失败',
          icon: 'none'
        });
      }
    };

    // 订单选择变化
    const onOrderChange = (e) => {
      const index = e.detail.value;
      orderIndex.value = index;
      if (orderOptions.value[index]) {
        formData.orderId = orderOptions.value[index].orderId;
      }
    };

    // 衣物类型选择变化
    const onClothingTypeChange = (e) => {
      const index = e.detail.value;
      clothingTypeIndex.value = index;
      if (clothingTypeOptions.value[index]) {
        formData.clothingTypeId = clothingTypeOptions.value[index].clothingTypeId;
      }
    };

    // 处理状态选择变化
    const onProcessStatusChange = (e) => {
      const index = e.detail.value;
      processStatusIndex.value = index;
      if (processStatusOptions.value[index]) {
        formData.processStatus = Number(processStatusOptions.value[index].value);
      }
    };

    // 开始处理时间选择
    const onStartTimeChange = (e) => {
      formData.startTime = e.detail.value;
    };

    // 完成处理时间选择
    const onEndTimeChange = (e) => {
      formData.endTime = e.detail.value;
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (itemId.value) {
          // 更新衣物明细
          await AioveuLaundryOrderItemAPI.update(itemId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增衣物明细
          await AioveuLaundryOrderItemAPI.add(formData);
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
      if (!formData.orderId) {
        uni.showToast({
          title: "请选择订单号",
          icon: "none"
        });
        return false;
      }

      if (!formData.clothingTypeId && !formData.customType) {
        uni.showToast({
          title: "请选择衣物类型或输入自定义类型",
          icon: "none"
        });
        return false;
      }

      if (formData.price === undefined) {
        uni.showToast({
          title: "请输入价格",
          icon: "none"
        });
        return false;
      }

      if (formData.processStatus === undefined) {
        uni.showToast({
          title: "请选择处理状态",
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
      orderOptions,
      clothingTypeOptions,
      processStatusOptions,
      orderIndex,
      clothingTypeIndex,
      processStatusIndex,
      isEditMode,
      onOrderChange,
      onClothingTypeChange,
      onProcessStatusChange,
      onStartTimeChange,
      onEndTimeChange,
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
