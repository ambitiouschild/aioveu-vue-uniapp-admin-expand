<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 分类名称 -->
      <view class="form-item">
        <text class="form-label">分类名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入分类名称"
          v-model="formData.name"
        />
      </view>

      <!-- 父分类 -->
      <view class="form-item">
        <text class="form-label">父分类</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="parentCategoryOptions"
          range-key="categoryName"
          :value="parentCategoryIndex"
          @change="onParentCategoryChange"
        >
          <view class="picker-view">
            {{ parentCategoryIndex >= 0 ? parentCategoryOptions[parentCategoryIndex].categoryName : '请选择父分类' }}
          </view>
        </picker>
      </view>

      <!-- 分类层级 -->
      <view class="form-item">
        <text class="form-label">分类层级</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入分类层级"
          v-model="formData.level"
        />
      </view>

      <!-- 分类描述 -->
      <view class="form-item">
        <text class="form-label">分类描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入分类描述"
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuCategoryAPI, {
  AioveuCategoryForm,
  CategoryOptionVO
} from "@/packageD/api/aioveuCategory/aioveu-category";

const formTitle = ref('新增分类');
const categoryId = ref<number | undefined>(undefined);
const loading = ref(false);

const formData = reactive<AioveuCategoryForm>({
  name: '',
  parentCategoryName: '',
  level: undefined,
  description: ''
});

const parentCategoryOptions = ref<CategoryOptionVO[]>([]);
const parentCategoryIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载父分类选项
  loadParentCategoryOptions();

  if (options.id) {
    categoryId.value = Number(options.id);
    formTitle.value = '编辑分类';
    loadCategoryData();
  } else {
    formTitle.value = '新增分类';
  }


});

// 加载分类数据
const loadCategoryData = async () => {
  if (!categoryId.value) return;

  try {
    loading.value = true;
    const data = await AioveuCategoryAPI.getFormData(categoryId.value);
    Object.assign(formData, data);

    // 设置父分类索引
    if (formData.parentCategoryName) {
      const index = parentCategoryOptions.value.findIndex(
        cat => cat.categoryName === formData.parentCategoryName
      );
      parentCategoryIndex.value = index;
    }
  } catch (error) {
    console.error('加载分类数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载父分类选项
const loadParentCategoryOptions = async () => {
  try {
    const response = await AioveuCategoryAPI.getAllCategoryOptions();
    if (Array.isArray(response)) {
      parentCategoryOptions.value = response.map(cat => ({
        categoryId: Number(cat.categoryId),
        categoryName: cat.categoryName
      }));
    }
  } catch (error) {
    console.error('加载父分类列表失败:', error);
    uni.showToast({
      title: '加载父分类列表失败',
      icon: 'none'
    });
  }
};

// 父分类选择变化
const onParentCategoryChange = (e: any) => {
  const index = e.detail.value;
  parentCategoryIndex.value = index;
  if (parentCategoryOptions.value[index]) {
    formData.parentCategoryName = parentCategoryOptions.value[index].categoryName;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    if (categoryId.value) {
      // 更新分类
      await AioveuCategoryAPI.update(categoryId.value, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增分类
      await AioveuCategoryAPI.add(formData);
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
  if (!formData.name) {
    uni.showToast({
      title: "请输入分类名称",
      icon: "none"
    });
    return false;
  }

  if (!formData.level) {
    uni.showToast({
      title: "请输入分类层级",
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
