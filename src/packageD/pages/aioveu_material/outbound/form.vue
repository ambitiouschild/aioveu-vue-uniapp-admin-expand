<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 出库单号 -->
      <view class="form-item">
        <text class="form-label required">出库单号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入出库单号"
          v-model="formData.outboundNo"
        />
      </view>

      <!-- 物资 -->
      <view class="form-item">
        <text class="form-label required">物资</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="materialOptions"
          range-key="text"
          :value="materialIndex"
          @change="onMaterialChange"
        >
          <view class="picker-view">
            {{ materialIndex >= 0 ? materialOptions[materialIndex].text : '请选择物资' }}
          </view>
        </picker>
      </view>

      <!-- 仓库 -->
      <view class="form-item">
        <text class="form-label required">仓库</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="warehouseOptions"
          range-key="text"
          :value="warehouseIndex"
          @change="onWarehouseChange"
        >
          <view class="picker-view">
            {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].text : '请选择仓库' }}
          </view>
        </picker>
      </view>

      <!-- 出库数量 -->
      <view class="form-item">
        <text class="form-label required">出库数量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入出库数量"
          v-model="formData.quantity"
        />
      </view>

      <!-- 批次号 -->
      <view class="form-item">
        <text class="form-label">批次号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入批次号"
          v-model="formData.batchNumber"
        />
      </view>

      <!-- 出库时间 -->
      <view class="form-item">
        <text class="form-label required">出库时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.outTime"
          :default-value="new Date()"
          @confirm="onOutTimeChange"
        >
          <view class="picker-view">
            {{ formData.outTime ? formatDateTimeDisplay(formData.outTime) : '请选择出库时间' }}
          </view>
        </wd-datetime-picker>
      </view>

      <!-- 操作员 -->
      <view class="form-item">
        <text class="form-label required">操作员</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="text"
          :value="operatorIndex"
          @change="onOperatorChange"
        >
          <view class="picker-view">
            {{ operatorIndex >= 0 ? employeeOptions[operatorIndex].text : '请选择操作员' }}
          </view>
        </picker>
      </view>

      <!-- 领用人 -->
      <view class="form-item">
        <text class="form-label required">领用人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="text"
          :value="recipientIndex"
          @change="onRecipientChange"
        >
          <view class="picker-view">
            {{ recipientIndex >= 0 ? employeeOptions[recipientIndex].text : '请选择领用人' }}
          </view>
        </picker>
      </view>

      <!-- 领用部门 -->
      <view class="form-item">
        <text class="form-label required">领用部门</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="deptOptions"
          range-key="text"
          :value="deptIndex"
          @change="onDeptChange"
        >
          <view class="picker-view">
            {{ deptIndex >= 0 ? deptOptions[deptIndex].text : '请选择领用部门' }}
          </view>
        </picker>
      </view>

      <!-- 用途说明 -->
      <view class="form-item">
        <text class="form-label">用途说明</text>
        <textarea
          class="form-textarea"
          placeholder="请输入用途说明"
          v-model="formData.purpose"
        />
      </view>

      <!-- 关联项目ID -->
      <view class="form-item">
        <text class="form-label">关联项目ID</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入关联项目ID"
          v-model="formData.projectId"
        />
      </view>

      <!-- 状态 -->
      <view class="form-item">
        <text class="form-label required">状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="statusOptions"
          range-key="text"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? statusOptions[statusIndex].text : '请选择状态' }}
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
import AioveuOutboundAPI, { AioveuOutboundForm } from '@/packageD/api/aioveuOutbound/aioveu-outbound';
import DictAPI, { DictItemOption } from '@/api/system/dict';
import AioveuMaterialAPI, { MaterialOptionVO } from '@/packageD/api/aioveuMaterial/aioveu-material';
import AioveuWarehouseAPI, { WarehouseOptionVO } from '@/packageD/api/aioveuWarehouse/aioveu-warehouse';
import AioveuDepartmentAPI, { DeptOptionVO } from '@/packageD/api/aioveuDepartment/aioveu-department';
import AioveuEmployeeAPI, { EmployeeOptionVO } from '@/packageD/api/aioveuEmployee/aioveu-employee';

const formTitle = ref('新增出库记录');
const editingOutboundId = ref<number | undefined>(undefined);

// 表单数据
const formData = reactive<AioveuOutboundForm>({
});

// 选项
const statusOptions = ref<{value: number, text: string}[]>([]);
const materialOptions = ref<{value: string, text: string}[]>([]);
const warehouseOptions = ref<{value: string, text: string}[]>([]);
const deptOptions = ref<{value: string, text: string}[]>([]);
const employeeOptions = ref<{value: string, text: string}[]>([]);

// 当前选中索引
const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const deptIndex = ref(-1);
const operatorIndex = ref(-1);
const recipientIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {
  // 加载选项数据
  loadStatusOptions();
  loadMaterialOptions();
  loadWarehouseOptions();
  loadDeptOptions();
  loadEmployeeOptions();

  if (options && options.id) {
    editingOutboundId.value = Number(options.id);
    formTitle.value = '编辑出库记录';
    loadFormData(Number(options.id));
  }else {
    formTitle.value = '新增出库记录';
  }


});

// 加载表单数据
const loadFormData = async (id: number) => {
  try {
    const data = await AioveuOutboundAPI.getFormData(id);
    Object.assign(formData, {

      ...data,
      // 将后端字符串转换为 Date 对象
      outTime: data.outTime ? new Date(data.outTime) : new Date(),

    });
    setSelectedIndexes();
  } catch (error) {
    console.error('加载出库数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  }
};

// 设置选中索引
const setSelectedIndexes = () => {
  // 物资
  if (formData.materialName) {
    const index = materialOptions.value.findIndex(
      item => item.value === formData.materialName
    );
    materialIndex.value = index;
  }

  // 仓库
  if (formData.warehouseName) {
    const index = warehouseOptions.value.findIndex(
      item => item.value === formData.warehouseName
    );
    warehouseIndex.value = index;
  }

  // 领用部门
  if (formData.departmentName) {
    const index = deptOptions.value.findIndex(
      item => item.value === formData.departmentName
    );
    deptIndex.value = index;
  }

  // 操作员
  if (formData.operatorName) {
    const index = employeeOptions.value.findIndex(
      item => item.value === formData.operatorName
    );
    operatorIndex.value = index;
  }

  // 领用人
  if (formData.recipientName) {
    const index = employeeOptions.value.findIndex(
      item => item.value === formData.recipientName
    );
    recipientIndex.value = index;
  }

  // 状态
  if (formData.status !== undefined) {
    const index = statusOptions.value.findIndex(
      item => item.value === formData.status
    );
    statusIndex.value = index;
  }
};

// 加载字典
const loadStatusOptions = () => {
  DictAPI.getDictItems('outbound_status').then(response => {
    statusOptions.value = response.map(item => ({
      value: Number(item.value),
      text: item.label
    }));
  });
};

// 加载选项
const loadMaterialOptions = () => {
  AioveuMaterialAPI.getAllMaterialOptions().then(response => {
    materialOptions.value = response.map(item => ({
      value: item.materialName,
      text: item.materialName
    }));
  });
};

const loadWarehouseOptions = () => {
  AioveuWarehouseAPI.getAllWarehouseOptions().then(response => {
    warehouseOptions.value = response.map(item => ({
      value: item.warehouseName,
      text: item.warehouseName
    }));
  });
};

const loadDeptOptions = () => {
  AioveuDepartmentAPI.getAllDepartmentOptions().then(response => {
    deptOptions.value = response.map(item => ({
      value: item.deptName,
      text: item.deptName
    }));
  });
};

const loadEmployeeOptions = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions().then(response => {
    employeeOptions.value = response.map(item => ({
      value: item.employeeName,
      text: item.employeeName
    }));
  });
};


// 时间显示格式化函数
const formatDateTimeDisplay = (date: Date | undefined) => {
  if (!date) return ''; // 处理 undefined 和 null
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 物资选择变化
const onMaterialChange = (e: any) => {
  const index = e.detail.value;
  materialIndex.value = index;
  if (materialOptions.value[index]) {
    formData.materialName = materialOptions.value[index].value;
  }
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    formData.warehouseName = warehouseOptions.value[index].value;
  }
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    formData.departmentName = deptOptions.value[index].value;
  }
};

// 操作员选择变化
const onOperatorChange = (e: any) => {
  const index = e.detail.value;
  operatorIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.operatorName = employeeOptions.value[index].value;
  }
};

// 领用人选择变化
const onRecipientChange = (e: any) => {
  const index = e.detail.value;
  recipientIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.recipientName = employeeOptions.value[index].value;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    formData.status = statusOptions.value[index].value;
  }
};

// 出库时间选择变化
const onOutTimeChange = (e: any) => {
  formData.outTime = new Date(e.value);
};

const formatDateToBackendString = (date: Date | undefined) => {
  if (!date) return ''; // 处理 undefined 和 null

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  //const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 计算属性：转换为后端需要的字符串格式
const backendFormData = computed(() => {
  return {
    ...formData,
    outTime: formatDateToBackendString(formData.outTime),
  };
});

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    const id = editingOutboundId.value;
    const formData = backendFormData.value;

    if (id) {
      // 更新出库记录
      await AioveuOutboundAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增出库记录
      await AioveuOutboundAPI.add(formData);
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
  if (!formData.outboundNo) {
    uni.showToast({
      title: "请输入出库单号",
      icon: "none"
    });
    return false;
  }

  if (!formData.materialName) {
    uni.showToast({
      title: "请选择物资",
      icon: "none"
    });
    return false;
  }

  if (!formData.warehouseName) {
    uni.showToast({
      title: "请选择仓库",
      icon: "none"
    });
    return false;
  }

  if (!formData.quantity) {
    uni.showToast({
      title: "请输入出库数量",
      icon: "none"
    });
    return false;
  }

  if (!formData.outTime) {
    uni.showToast({
      title: "请选择出库时间",
      icon: "none"
    });
    return false;
  }

  if (!formData.operatorName) {
    uni.showToast({
      title: "请选择操作员",
      icon: "none"
    });
    return false;
  }

  if (!formData.recipientName) {
    uni.showToast({
      title: "请选择领用人",
      icon: "none"
    });
    return false;
  }

  if (!formData.departmentName) {
    uni.showToast({
      title: "请选择领用部门",
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
</script>

<style lang="scss" scoped>
.form-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.form-header {
  padding: 30rpx;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  text-align: center;
  border-radius: 16rpx 16rpx 0 0;

  .form-title {
    font-size: 36rpx;
    font-weight: 600;
  }
}

.form-body {
  padding: 24rpx;
  background-color: #fff;
  border-radius: 0 0 16rpx 16rpx;
  max-height: 70vh;
  overflow-y: auto;
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

  &.required::after {
    content: '*';
    color: #e74c3c;
    margin-left: 8rpx;
  }
}

.form-input, .form-picker, .form-textarea {
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  background-color: #fff;
}

.form-textarea {
  height: 200rpx;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  padding: 24rpx;
  background: #f8f9fa;
  border-top: 1rpx solid #eaeaea;
  margin-top: 24rpx;
  border-radius: 16rpx;

  .form-btn {
    flex: 1;
    margin: 0 12rpx;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 28rpx;
    text-align: center;
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
