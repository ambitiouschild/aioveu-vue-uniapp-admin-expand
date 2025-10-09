<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 类型代码 -->
      <view class="form-item">
        <text class="form-label">类型代码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入类型代码"
          v-model="formData.typeCode"
        />
      </view>

      <!-- 类型名称 -->
      <view class="form-item">
        <text class="form-label">类型名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入类型名称"
          v-model="formData.typeName"
        />
      </view>

      <!-- 衣物类别 -->
      <view class="form-item">
        <text class="form-label">衣物类别</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="categoryOptions"
          range-key="label"
          :value="categoryIndex"
          @change="onCategoryChange"
        >
          <view class="picker-view">
            {{ categoryIndex >= 0 ? categoryOptions[categoryIndex].label : '请选择衣物类别' }}
          </view>
        </picker>
      </view>

      <!-- 基础价格 -->
      <view class="form-item">
        <text class="form-label">基础价格</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入基础价格"
          v-model="formData.basePrice"
        />
      </view>

      <!-- 处理时间 -->
      <view class="form-item">
        <text class="form-label">处理时间(分钟)</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入标准处理时间"
          v-model="formData.processingTime"
        />
      </view>

      <!-- 特殊处理要求 -->
      <view class="form-item">
        <text class="form-label">特殊处理要求</text>
        <textarea
          class="form-textarea"
          placeholder="请输入特殊处理要求"
          v-model="formData.specialRequirements"
        />
      </view>

      <!-- 是否精细衣物 -->
      <view class="form-item">
        <text class="form-label">是否精细衣物</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="isDelicateOptions"
          range-key="label"
          :value="isDelicateIndex"
          @change="onIsDelicateChange"
        >
          <view class="picker-view">
            {{ isDelicateIndex >= 0 ? isDelicateOptions[isDelicateIndex].label : '请选择是否精细衣物' }}
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
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuLaundryClothingTypeAPI from "@/packageG/api/aioveuLaundryClothingType/aioveu-laundry-clothing-type";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryClothingTypeForm",
  setup() {
    const formTitle = ref('新增衣物类型');
    const clothingTypeId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      typeCode: '',
      typeName: '',
      category: undefined,
      basePrice: undefined,
      processingTime: undefined,
      specialRequirements: '',
      isDelicate: undefined,
      status: undefined
    });

    const categoryOptions = ref([]);
    const isDelicateOptions = ref([]);
    const statusOptions = ref([]);

    const categoryIndex = ref(-1);
    const isDelicateIndex = ref(-1);
    const statusIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载衣物类别选项
      loadCategoryOptions();
      // 加载是否精细衣物选项
      loadIsDelicateOptions();
      // 加载状态选项
      loadStatusOptions();

      if (options.id) {
        clothingTypeId.value = Number(options.id);
        formTitle.value = '编辑衣物类型';
        isEditMode.value = true;
        loadClothingTypeData();
      } else {
        formTitle.value = '新增衣物类型';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载衣物类型数据
    const loadClothingTypeData = async () => {
      if (!clothingTypeId.value) return;

      try {
        loading.value = true;
        const data = await AioveuLaundryClothingTypeAPI.getFormData(clothingTypeId.value);
        Object.assign(formData, data);

        // 设置衣物类别索引
        if (formData.category !== undefined) {
          const index = categoryOptions.value.findIndex(
            item => Number(item.value) === formData.category
          );
          categoryIndex.value = index;
        }

        // 设置是否精细衣物索引
        if (formData.isDelicate !== undefined) {
          const index = isDelicateOptions.value.findIndex(
            item => Number(item.value) === formData.isDelicate
          );
          isDelicateIndex.value = index;
        }

        // 设置状态索引
        if (formData.status !== undefined) {
          const index = statusOptions.value.findIndex(
            item => Number(item.value) === formData.status
          );
          statusIndex.value = index;
        }
      } catch (error) {
        console.error('加载衣物类型数据失败:', error);
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        loading.value = false;
      }
    };

    // 加载衣物类别选项
    const loadCategoryOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_clothing_type_category');
        categoryOptions.value = response;
      } catch (error) {
        console.error('加载衣物类别选项失败:', error);
        uni.showToast({
          title: '加载衣物类别选项失败',
          icon: 'none'
        });
      }
    };

    // 加载是否精细衣物选项
    const loadIsDelicateOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_clothing_type_is_delicate');
        isDelicateOptions.value = response;
      } catch (error) {
        console.error('加载是否精细衣物选项失败:', error);
        uni.showToast({
          title: '加载是否精细衣物选项失败',
          icon: 'none'
        });
      }
    };

    // 加载状态选项
    const loadStatusOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_clothing_type_status');
        statusOptions.value = response;
      } catch (error) {
        console.error('加载状态选项失败:', error);
        uni.showToast({
          title: '加载状态选项失败',
          icon: 'none'
        });
      }
    };

    // 衣物类别选择变化
    const onCategoryChange = (e) => {
      const index = e.detail.value;
      categoryIndex.value = index;
      if (categoryOptions.value[index]) {
        formData.category = Number(categoryOptions.value[index].value);
      }
    };

    // 是否精细衣物选择变化
    const onIsDelicateChange = (e) => {
      const index = e.detail.value;
      isDelicateIndex.value = index;
      if (isDelicateOptions.value[index]) {
        formData.isDelicate = Number(isDelicateOptions.value[index].value);
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

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (clothingTypeId.value) {
          // 更新衣物类型
          await AioveuLaundryClothingTypeAPI.update(clothingTypeId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增衣物类型
          await AioveuLaundryClothingTypeAPI.add(formData);
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
      if (!formData.typeCode) {
        uni.showToast({
          title: "请输入类型代码",
          icon: "none"
        });
        return false;
      }

      if (!formData.typeName) {
        uni.showToast({
          title: "请输入类型名称",
          icon: "none"
        });
        return false;
      }

      if (formData.category === undefined) {
        uni.showToast({
          title: "请选择衣物类别",
          icon: "none"
        });
        return false;
      }

      if (formData.basePrice === undefined) {
        uni.showToast({
          title: "请输入基础价格",
          icon: "none"
        });
        return false;
      }

      if (formData.processingTime === undefined) {
        uni.showToast({
          title: "请输入处理时间",
          icon: "none"
        });
        return false;
      }

      if (formData.isDelicate === undefined) {
        uni.showToast({
          title: "请选择是否精细衣物",
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
      categoryOptions,
      isDelicateOptions,
      statusOptions,
      categoryIndex,
      isDelicateIndex,
      statusIndex,
      isEditMode,
      onCategoryChange,
      onIsDelicateChange,
      onStatusChange,
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
