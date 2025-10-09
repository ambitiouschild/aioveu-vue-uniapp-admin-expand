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

      <!-- 衣物明细 -->
      <view class="form-item">
        <text class="form-label">衣物明细</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="itemOptions"
          range-key="problemDesc"
          :value="itemIndex"
          @change="onItemChange"
        >
          <view class="picker-view">
            {{ itemIndex >= 0 ? itemOptions[itemIndex].problemDesc : '请选择衣物明细' }}
          </view>
        </picker>
      </view>

      <!-- 图片类型 -->
      <view class="form-item">
        <text class="form-label">图片类型</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="imageTypeOptions"
          range-key="label"
          :value="imageTypeIndex"
          @change="onImageTypeChange"
        >
          <view class="picker-view">
            {{ imageTypeIndex >= 0 ? imageTypeOptions[imageTypeIndex].label : '请选择图片类型' }}
          </view>
        </picker>
      </view>

      <!-- 上传人 -->
      <view class="form-item">
        <text class="form-label">上传人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="employeeName"
          :value="employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="picker-view">
            {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择上传人' }}
          </view>
        </picker>
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="form-label">图片</text>
        <view class="image-upload-container">
          <image
            v-if="formData.imageUrl"
            :src="formData.imageUrl"
            mode="aspectFill"
            class="uploaded-image"
            @click="previewImage(formData.imageUrl)"
          />
          <view v-else class="upload-placeholder" @click="chooseImage">
            <text class="upload-icon">+</text>
            <text class="upload-text">点击上传图片</text>
          </view>
          <input type="file" ref="fileInput" style="display: none" @change="handleImageUpload" accept="image/*" />
        </view>
        <text class="upload-tip">支持格式：JPG、PNG，最大5MB</text>
      </view>

      <!-- 图片描述 -->
      <view class="form-item">
        <text class="form-label">图片描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入图片描述"
          v-model="formData.description"
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
import AioveuLaundryProcessImageAPI from "@/packageG/api/aioveuLaundryProcessImage/aioveu-laundry-process-image";
import AioveuLaundryOrderAPI from "@/packageG/api/aioveuLaundryOrder/aioveu-laundry-order";
import AioveuLaundryOrderItemAPI from "@/packageG/api/aioveuLaundryOrderItem/aioveu-laundry-order-item";
import AioveuEmployeeAPI from "@/packageG/api/aioveuEmployee/aioveu-employee";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryProcessImageForm",
  setup() {
    const formTitle = ref('新增图片记录');
    const imageId = ref(undefined);
    const isEditMode = ref(false);

    const formData = reactive({
      orderId: undefined,
      itemId: undefined,
      imageType: undefined,
      imageUrl: '',
      uploadUser: undefined,
      description: ''
    });

    const orderOptions = ref([]);
    const itemOptions = ref([]);
    const imageTypeOptions = ref([]);
    const employeeOptions = ref([]);

    const orderIndex = ref(-1);
    const itemIndex = ref(-1);
    const imageTypeIndex = ref(-1);
    const employeeIndex = ref(-1);

    const loading = ref(true);

    onLoad((options) => {
      // 加载订单选项
      loadOrderOptions();
      // 加载衣物明细选项
      loadItemOptions();
      // 加载图片类型选项
      loadImageTypeOptions();
      // 加载员工选项
      loadEmployeeOptions();

      if (options.id) {
        imageId.value = Number(options.id);
        formTitle.value = '编辑图片记录';
        isEditMode.value = true;
        loadImageData();
      } else {
        formTitle.value = '新增图片记录';
        isEditMode.value = false;
        loading.value = false;
      }
    });

    // 加载图片数据
    const loadImageData = async () => {
      if (!imageId.value) return;

      try {
        loading.value = true;
        const data = await AioveuLaundryProcessImageAPI.getFormData(imageId.value);
        Object.assign(formData, data);

        // 设置订单索引
        if (formData.orderId !== undefined) {
          const index = orderOptions.value.findIndex(
            item => item.orderId === formData.orderId
          );
          orderIndex.value = index;
        }

        // 设置衣物明细索引
        if (formData.itemId !== undefined) {
          const index = itemOptions.value.findIndex(
            item => item.itemId === formData.itemId
          );
          itemIndex.value = index;
        }

        // 设置图片类型索引
        if (formData.imageType !== undefined) {
          const index = imageTypeOptions.value.findIndex(
            item => Number(item.value) === formData.imageType
          );
          imageTypeIndex.value = index;
        }

        // 设置上传人索引
        if (formData.uploadUser !== undefined) {
          const index = employeeOptions.value.findIndex(
            item => item.employeeId === formData.uploadUser
          );
          employeeIndex.value = index;
        }
      } catch (error) {
        console.error('加载图片数据失败:', error);
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

    // 加载衣物明细选项
    const loadItemOptions = async () => {
      try {
        const response = await AioveuLaundryOrderItemAPI.getAllLaundryOrderItemOptions();
        if (Array.isArray(response)) {
          itemOptions.value = response;
        }
      } catch (error) {
        console.error('加载衣物明细选项失败:', error);
        uni.showToast({
          title: '加载衣物明细选项失败',
          icon: 'none'
        });
      }
    };

    // 加载图片类型选项
    const loadImageTypeOptions = async () => {
      try {
        const response = await DictAPI.getDictItems('laundry_process_image_image_type');
        imageTypeOptions.value = response;
      } catch (error) {
        console.error('加载图片类型选项失败:', error);
        uni.showToast({
          title: '加载图片类型选项失败',
          icon: 'none'
        });
      }
    };

    // 加载员工选项
    const loadEmployeeOptions = async () => {
      try {
        const response = await AioveuEmployeeAPI.getAllEmployeeOptions();
        if (Array.isArray(response)) {
          employeeOptions.value = response;
        }
      } catch (error) {
        console.error('加载员工选项失败:', error);
        uni.showToast({
          title: '加载员工选项失败',
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

    // 衣物明细选择变化
    const onItemChange = (e) => {
      const index = e.detail.value;
      itemIndex.value = index;
      if (itemOptions.value[index]) {
        formData.itemId = itemOptions.value[index].itemId;
      }
    };

    // 图片类型选择变化
    const onImageTypeChange = (e) => {
      const index = e.detail.value;
      imageTypeIndex.value = index;
      if (imageTypeOptions.value[index]) {
        formData.imageType = Number(imageTypeOptions.value[index].value);
      }
    };

    // 上传人选择变化
    const onEmployeeChange = (e) => {
      const index = e.detail.value;
      employeeIndex.value = index;
      if (employeeOptions.value[index]) {
        formData.uploadUser = employeeOptions.value[index].employeeId;
      }
    };

    // 选择图片
    const chooseImage = () => {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 这里应该上传图片到服务器
          // 模拟上传成功
          formData.imageUrl = tempFilePath;
          uni.showToast({
            title: '图片上传成功',
            icon: 'success'
          });
        },
        fail: (error) => {
          console.error('选择图片失败:', error);
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          });
        }
      });
    };

    // 预览图片
    const previewImage = (url) => {
      uni.previewImage({
        urls: [url],
        current: 0
      });
    };

    // 提交表单
    const handleSubmit = async () => {
      if (!validateForm()) return;

      try {
        uni.showLoading({ title: '提交中...' });

        if (imageId.value) {
          // 更新图片记录
          await AioveuLaundryProcessImageAPI.update(imageId.value, formData);
          uni.showToast({
            title: "修改成功",
            icon: "success"
          });
        } else {
          // 新增图片记录
          await AioveuLaundryProcessImageAPI.add(formData);
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

      if (!formData.itemId) {
        uni.showToast({
          title: "请选择衣物明细",
          icon: "none"
        });
        return false;
      }

      if (formData.imageType === undefined) {
        uni.showToast({
          title: "请选择图片类型",
          icon: "none"
        });
        return false;
      }

      if (!formData.imageUrl) {
        uni.showToast({
          title: "请上传图片",
          icon: "none"
        });
        return false;
      }

      if (!formData.uploadUser) {
        uni.showToast({
          title: "请选择上传人",
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
      itemOptions,
      imageTypeOptions,
      employeeOptions,
      orderIndex,
      itemIndex,
      imageTypeIndex,
      employeeIndex,
      isEditMode,
      onOrderChange,
      onItemChange,
      onImageTypeChange,
      onEmployeeChange,
      chooseImage,
      previewImage,
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

.image-upload-container {
  width: 100%;
  height: 300rpx;
  border: 1rpx dashed #e2e8f0;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f8f9fa;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #999;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.upload-text {
  font-size: 28rpx;
}

.upload-tip {
  display: block;
  font-size: 26rpx;
  color: #999;
  margin-top: 12rpx;
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
