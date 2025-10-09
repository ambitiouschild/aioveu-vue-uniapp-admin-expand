<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 仓库名称 -->
      <view class="form-item">
        <text class="form-label">仓库名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入仓库名称"
          v-model="formData.name"
        />
      </view>

      <!-- 仓库编码 -->
      <view class="form-item">
        <text class="form-label">仓库编码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入仓库编码"
          v-model="formData.code"
        />
      </view>

      <!-- 仓库位置 -->
      <view class="form-item">
        <text class="form-label">仓库位置</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入仓库位置"
          v-model="formData.location"
        />
      </view>

      <!-- 仓库面积 -->
      <view class="form-item">
        <text class="form-label">仓库面积</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入仓库面积"
          v-model="formData.area"
        />
      </view>

      <!-- 存储容量 -->
      <view class="form-item">
        <text class="form-label">存储容量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入存储容量"
          v-model="formData.capacity"
        />
      </view>

      <!-- 负责人 -->
      <view class="form-item">
        <text class="form-label">负责人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="employeeName"
          :value="employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="picker-view">
            {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择负责人' }}
          </view>
        </picker>
      </view>

      <!-- 联系电话 -->
      <view class="form-item">
        <text class="form-label">联系电话</text>
        <input
          type="tel"
          class="form-input"
          placeholder="请输入联系电话"
          v-model="formData.contactPhone"
        />
      </view>

      <!-- 仓库描述 -->
      <view class="form-item">
        <text class="form-label">仓库描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入仓库描述"
          v-model="formData.description"
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
import AioveuWarehouseAPI, {
  AioveuWarehouseForm
} from "@/packageD/api/aioveuWarehouse/aioveu-warehouse";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageD/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增仓库');
const warehouseId = ref<number | undefined>(undefined);

// 在组件中添加一个变量存储当前编辑的ID
const editingWarehouseId = ref<number | undefined>(undefined);

const formData = reactive<AioveuWarehouseForm>({
  name: '',
  code: '',
  location: '',
  area: undefined,
  capacity: undefined,
  managerName: '',
  contactPhone: '',
  description: '',
  isActive: undefined
});

const employeeOptions = ref<EmployeeOptionVO[]>([]);
const isActiveOptions = ref<DictItemOption[]>([]);

const employeeIndex = ref(-1);
const statusIndex = ref(-1);

const loading = ref(true); // 添加加载状态变量

//在onLoad中加载数据可以更早开始，可能减少用户等待时间。
//表单是直接展示的，所以不能隐藏表单内容。那么我们可以使用一个遮罩层覆盖在表单上方，显示加载状态，直到所有数据加载完成再移除遮罩层。这样用户就不会看到表单数据的变化过程。
onLoad((options: any) => {
  console.log('页面参数:', options);

  // 隐藏表单内容，显示加载状态
  loading.value = true;


  // 并行加载所有必需数
     loadEmployeeOptions();
     loadIsActiveOptions();

  if (options.id) {
    // 加载选项数据
    warehouseId.value = Number(options.id);
    formTitle.value = '编辑仓库';
    loadWarehouseData();
  } else {
    formTitle.value = '新增仓库';
  }

  // 存储编辑ID
  editingWarehouseId.value = warehouseId.value;

  // 隐藏加载状态，显示表单
  loading.value = false;
});

// 加载仓库数据
const loadWarehouseData = async () => {
  if (!warehouseId.value) return;

  try {
    loading.value = true;
    const data = await AioveuWarehouseAPI.getFormData(warehouseId.value);
    Object.assign(formData, data);

    // 设置负责人索引
    if (formData.managerName) {
      const index = employeeOptions.value.findIndex(
        emp => emp.employeeName === formData.managerName
      );
      employeeIndex.value = index;
    }

    // 设置状态索引
    if (formData.isActive !== undefined) {
      const index = isActiveOptions.value.findIndex(
        item => Number(item.value) === formData.isActive
      );
      statusIndex.value = index;
    }
  } catch (error) {
    console.error('加载仓库数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载员工选项
const loadEmployeeOptions = async () => {
  try {
    const response = await AioveuEmployeeAPI.getAllEmployeeOptions();
    if (Array.isArray(response)) {
      employeeOptions.value = response.map(emp => ({
        employeeId: Number(emp.employeeId),
        employeeName: emp.employeeName
      }));
    }
  } catch (error) {
    console.error('加载员工列表失败:', error);
    uni.showToast({
      title: '加载员工列表失败',
      icon: 'none'
    });
  }
};

// 加载启用状态选项
const loadIsActiveOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('warehouse_is_active');
    isActiveOptions.value = response;
  } catch (error) {
    console.error('加载启用状态失败:', error);
    uni.showToast({
      title: '加载启用状态失败',
      icon: 'none'
    });
  }
};

// 负责人选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.managerName = employeeOptions.value[index].employeeName;
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

    // 使用存储的ID
    const id = editingWarehouseId.value;

    if (id) {
      // 更新仓库
      await AioveuWarehouseAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增仓库
      await AioveuWarehouseAPI.add(formData);
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
      title: "请输入仓库名称",
      icon: "none"
    });
    return false;
  }

  if (!formData.code) {
    uni.showToast({
      title: "请输入仓库编码",
      icon: "none"
    });
    return false;
  }

  if (!formData.location) {
    uni.showToast({
      title: "请输入仓库位置",
      icon: "none"
    });
    return false;
  }

  if (!formData.managerName) {
    uni.showToast({
      title: "请选择负责人",
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
