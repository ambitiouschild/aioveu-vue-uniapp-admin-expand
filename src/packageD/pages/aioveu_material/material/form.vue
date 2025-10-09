<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 物资名称 -->
      <view class="form-item">
        <text class="form-label">物资名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入物资名称"
          v-model="formData.name"
        />
      </view>

      <!-- 物资分类 -->
      <view class="form-item">
        <text class="form-label">物资分类</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="categoryOptions"
          range-key="categoryName"
          :value="categoryIndex"
          @change="onCategoryChange"
        >
          <view class="picker-view">
            {{ categoryIndex >= 0 ? categoryOptions[categoryIndex].categoryName : '请选择分类' }}
          </view>
        </picker>
      </view>

<!--      &lt;!&ndash; 单位 &ndash;&gt;-->
<!--      <view class="form-item">-->
<!--        <text class="form-label">单位</text>-->
<!--        <input-->
<!--          type="text"-->
<!--          class="form-input"-->
<!--          placeholder="请输入单位"-->
<!--          v-model="formData.unit"-->
<!--        />-->
<!--      </view>-->

<!--      &lt;!&ndash; 规格型号 &ndash;&gt;-->
<!--      <view class="form-item">-->
<!--        <text class="form-label">规格型号</text>-->
<!--        <input-->
<!--          type="text"-->
<!--          class="form-input"-->
<!--          placeholder="请输入规格型号"-->
<!--          v-model="formData.spec"-->
<!--        />-->
<!--      </view>-->

      <!-- 采购单价 -->
      <view class="form-item">
        <text class="form-label">采购单价</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入采购单价"
          v-model="formData.purchasePrice"
        />
      </view>

      <!-- 供应商ID -->
      <view class="form-item">
        <text class="form-label">供应商ID</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入供应商ID"
          v-model="formData.supplierId"
        />
      </view>

      <!-- 最低库存量 -->
      <view class="form-item">
        <text class="form-label">最低库存量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入最低库存量"
          v-model="formData.minStock"
        />
      </view>

      <!-- 最高库存量 -->
      <view class="form-item">
        <text class="form-label">最高库存量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入最高库存量"
          v-model="formData.maxStock"
        />
      </view>

      <!-- 启用状态 -->
      <view class="form-item">
        <text class="form-label">启用状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="isActiveOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? isActiveOptions[statusIndex].label : '请选择状态' }}
          </view>
        </picker>
      </view>

      <!-- 商品条码 -->
      <view class="form-item">
        <text class="form-label">商品条码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入商品条码"
          v-model="formData.barcode"
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
import AioveuMaterialAPI, {
  AioveuMaterialForm
} from "@/packageD/api/aioveuMaterial/aioveu-material";
import AioveuCategoryAPI, { CategoryOptionVO } from "@/packageD/api/aioveuCategory/aioveu-category";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增物资');
const materialId = ref<number | undefined>(undefined);
const loading = ref(false);

const formData = reactive<AioveuMaterialForm>({
  name: '',
  categoryName: '',
  // unit: '',
  // spec: '',
  purchasePrice: undefined,
  // supplierId: '',
  minStock: undefined,
  maxStock: undefined,
  isActive: undefined,
  barcode: ''
});

const categoryOptions = ref<CategoryOptionVO[]>([]);
const isActiveOptions = ref<DictItemOption[]>([]);

const categoryIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadCategoryOptions();
  loadIsActiveOptions();

  if (options.id) {
    materialId.value = Number(options.id);
    formTitle.value = '编辑物资';
    loadMaterialData();
  } else {
    formTitle.value = '新增物资';
  }


});

// 加载物资数据
const loadMaterialData = async () => {
  if (!materialId.value) return;

  try {
    loading.value = true;
    const data = await AioveuMaterialAPI.getFormData(materialId.value);
    Object.assign(formData, data);

    // 设置分类索引
    if (formData.categoryName) {
      const index = categoryOptions.value.findIndex(
        cat => cat.categoryName === formData.categoryName
      );
      categoryIndex.value = index;
    }

    // 设置状态索引
    if (formData.isActive !== undefined) {
      const index = isActiveOptions.value.findIndex(
        item => Number(item.value) === formData.isActive
      );
      statusIndex.value = index;
    }
  } catch (error) {
    console.error('加载物资数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const response = await AioveuCategoryAPI.getAllCategoryOptions();
    if (Array.isArray(response)) {
      categoryOptions.value = response.map(cat => ({
        categoryId: Number(cat.categoryId),
        categoryName: cat.categoryName
      }));
    }
  } catch (error) {
    console.error('加载分类列表失败:', error);
    uni.showToast({
      title: '加载分类列表失败',
      icon: 'none'
    });
  }
};

// 加载启用状态选项
const loadIsActiveOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('material_is_active');
    isActiveOptions.value = response;
  } catch (error) {
    console.error('加载启用状态失败:', error);
    uni.showToast({
      title: '加载启用状态失败',
      icon: 'none'
    });
  }
};

// 分类选择变化
const onCategoryChange = (e: any) => {
  const index = e.detail.value;
  categoryIndex.value = index;
  if (categoryOptions.value[index]) {
    formData.categoryName = categoryOptions.value[index].categoryName;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (isActiveOptions.value[index]) {
    formData.isActive = Number(isActiveOptions.value[index].value);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    if (materialId.value) {
      // 更新物资
      await AioveuMaterialAPI.update(materialId.value, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增物资
      await AioveuMaterialAPI.add(formData);
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
      title: "请输入物资名称",
      icon: "none"
    });
    return false;
  }

  if (!formData.categoryName) {
    uni.showToast({
      title: "请选择物资分类",
      icon: "none"
    });
    return false;
  }

  if (!formData.purchasePrice) {
    uni.showToast({
      title: "请输入采购单价",
      icon: "none"
    });
    return false;
  }

  if (formData.isActive === undefined) {
    uni.showToast({
      title: "请选择启用状态",
      icon: "none"
    });
    return false;
  }

  if (!formData.barcode) {
    uni.showToast({
      title: "请输入商品条码",
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
