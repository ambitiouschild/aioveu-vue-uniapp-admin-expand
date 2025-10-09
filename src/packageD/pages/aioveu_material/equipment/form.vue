<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 资产编号 -->
      <view class="form-item">
        <text class="form-label">资产编号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入资产编号"
          v-model="formData.assetNo"
        />
      </view>

      <!-- 设备名称 -->
      <view class="form-item">
        <text class="form-label">设备名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入设备名称"
          v-model="formData.name"
        />
      </view>

      <!-- 设备分类 -->
      <view class="form-item">
        <text class="form-label">设备分类</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="categoryOptions"
          range-key="text"
          :value="categoryIndex"
          @change="onCategoryChange"
        >
          <view class="picker-view">
            {{ categoryIndex >= 0 ? categoryOptions[categoryIndex].text : '请选择设备分类' }}
          </view>
        </picker>
      </view>

      <!-- 设备型号 -->
      <view class="form-item">
        <text class="form-label">设备型号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入设备型号"
          v-model="formData.model"
        />
      </view>

      <!-- 序列号 -->
      <view class="form-item">
        <text class="form-label">序列号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入序列号"
          v-model="formData.serialNo"
        />
      </view>

      <!-- 所属部门 -->
      <view class="form-item">
        <text class="form-label">所属部门</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="deptOptions"
          range-key="text"
          :value="deptIndex"
          @change="onDeptChange"
        >
          <view class="picker-view">
            {{ deptIndex >= 0 ? deptOptions[deptIndex].text : '请选择所属部门' }}
          </view>
        </picker>
      </view>

      <!-- 责任人 -->
      <view class="form-item">
        <text class="form-label">责任人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="text"
          :value="employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="picker-view">
            {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].text : '请选择责任人' }}
          </view>
        </picker>
      </view>

      <!-- 采购日期 -->
      <view class="form-item">
        <text class="form-label">采购日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.purchaseDate"
          @change="onPurchaseDateChange"
        >
          <view class="picker-view">
            {{ formData.purchaseDate || '请选择采购日期' }}
          </view>
        </picker>
      </view>

      <!-- 采购价格 -->
      <view class="form-item">
        <text class="form-label">采购价格</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入采购价格"
          v-model="formData.purchasePrice"
        />
      </view>

      <!-- 保修期 -->
      <view class="form-item">
        <text class="form-label">保修期(月)</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入保修期"
          v-model="formData.warrantyPeriod"
        />
      </view>

      <!-- 维保周期 -->
      <view class="form-item">
        <text class="form-label">维保周期(月)</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入维保周期"
          v-model="formData.maintenanceCycle"
        />
      </view>

      <!-- 上次维保日期 -->
      <view class="form-item">
        <text class="form-label">上次维保日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.lastMaintenance"
          @change="onLastMaintenanceChange"
        >
          <view class="picker-view">
            {{ formData.lastMaintenance || '请选择上次维保日期' }}
          </view>
        </picker>
      </view>

      <!-- 下次维保日期 -->
      <view class="form-item">
        <text class="form-label">下次维保日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.nextMaintenance"
          @change="onNextMaintenanceChange"
        >
          <view class="picker-view">
            {{ formData.nextMaintenance || '请选择下次维保日期' }}
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
          range-key="text"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? statusOptions[statusIndex].text : '请选择状态' }}
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

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuEquipmentAPI, { AioveuEquipmentForm } from '@/packageD/api/aioveuEquipment/aioveu-equipment';
import DictAPI, { DictItemOption } from '@/api/system/dict';
import AioveuDepartmentAPI, { DeptOptionVO } from '@/packageD/api/aioveuDepartment/aioveu-department';
import AioveuCategoryAPI, { CategoryOptionVO } from '@/packageD/api/aioveuCategory/aioveu-category';
import AioveuEmployeeAPI, { EmployeeOptionVO } from '@/packageD/api/aioveuEmployee/aioveu-employee';

const formTitle = ref('新增设备');
const editingEquipmentId = ref<number | undefined>(undefined);

// 表单数据 - 完全匹配接口定义
const formData = reactive<AioveuEquipmentForm>({
  assetNo: '',
  name: '',
  categoryId: undefined,
  categoryName: '',
  model: '',
  serialNo: '',
  departmentId: undefined,
  departmentName: '',
  responsiblePerson: undefined,
  responsiblePersonName: '',
  purchaseDate: undefined,
  purchasePrice: undefined,
  warrantyPeriod: undefined,
  maintenanceCycle: undefined,
  lastMaintenance: undefined,
  nextMaintenance: undefined,
  status: undefined,
  remark: ''
});

// 选项数据
const categoryOptions = ref<{value: number, text: string}[]>([]);
const deptOptions = ref<{value: number, text: string}[]>([]);
const employeeOptions = ref<{value: number, text: string}[]>([]);
const statusOptions = ref<{value: number, text: string}[]>([]);

// 当前选中索引
const categoryIndex = ref(-1);
const deptIndex = ref(-1);
const employeeIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {

  // 加载选项数据
  loadCategoryOptions();
  loadDeptOptions();
  loadEmployeeOptions();
  loadStatusOptions();


  if (options && options.id) {
    editingEquipmentId.value = Number(options.id);
    formTitle.value = '编辑设备';
    loadFormData(Number(options.id));
  }else {
    formTitle.value = '新增设备';
  }

});

// 加载表单数据
const loadFormData = async (id: number) => {
  try {
    const data = await AioveuEquipmentAPI.getFormData(id);
    Object.assign(formData, data);

    // 设置选中索引
    setSelectedIndexes();
  } catch (error) {
    console.error('加载设备数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  }
};

// 设置选中索引
const setSelectedIndexes = () => {
  // 设备分类
  if (formData.categoryId) {
    const index = categoryOptions.value.findIndex(
      item => item.value === formData.categoryId
    );
    categoryIndex.value = index;
  }

  // 所属部门
  if (formData.departmentId) {
    const index = deptOptions.value.findIndex(
      item => item.value === formData.departmentId
    );
    deptIndex.value = index;
  }

  // 责任人
  if (formData.responsiblePerson) {
    const index = employeeOptions.value.findIndex(
      item => item.value === formData.responsiblePerson
    );
    employeeIndex.value = index;
  }

  // 状态
  if (formData.status !== undefined) {
    const index = statusOptions.value.findIndex(
      item => item.value === formData.status
    );
    statusIndex.value = index;
  }
};

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const response = await AioveuCategoryAPI.getAllCategoryOptions();
    categoryOptions.value = response.map(item => ({
      value: item.categoryId,
      text: item.categoryName
    }));
  } catch (error) {
    console.error('加载分类选项失败:', error);
    uni.showToast({
      title: '加载分类选项失败',
      icon: 'none'
    });
  }
};

// 加载部门选项
const loadDeptOptions = async () => {
  try {
    const response = await AioveuDepartmentAPI.getAllDepartmentOptions();
    deptOptions.value = response.map(item => ({
      value: item.deptId,
      text: item.deptName
    }));
  } catch (error) {
    console.error('加载部门选项失败:', error);
    uni.showToast({
      title: '加载部门选项失败',
      icon: 'none'
    });
  }
};

// 加载员工选项
const loadEmployeeOptions = async () => {
  try {
    const response = await AioveuEmployeeAPI.getAllEmployeeOptions();
    employeeOptions.value = response.map(item => ({
      value: item.employeeId,
      text: item.employeeName
    }));
  } catch (error) {
    console.error('加载员工选项失败:', error);
    uni.showToast({
      title: '加载员工选项失败',
      icon: 'none'
    });
  }
};

// 加载状态选项
const loadStatusOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('equipment_status');
    statusOptions.value = response.map(item => ({
      value: Number(item.value),
      text: item.label
    }));
  } catch (error) {
    console.error('加载状态选项失败:', error);
    uni.showToast({
      title: '加载状态选项失败',
      icon: 'none'
    });
  }
};

// 设备分类选择变化
const onCategoryChange = (e: any) => {
  const index = e.detail.value;
  categoryIndex.value = index;
  if (categoryOptions.value[index]) {
    formData.categoryId = categoryOptions.value[index].value;
    formData.categoryName = categoryOptions.value[index].text;
  }
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    formData.departmentId = deptOptions.value[index].value;
    formData.departmentName = deptOptions.value[index].text;
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.responsiblePerson = employeeOptions.value[index].value;
    formData.responsiblePersonName = employeeOptions.value[index].text;
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

// 采购日期选择变化
const onPurchaseDateChange = (e: any) => {
  formData.purchaseDate = e.detail.value;
};

// 上次维保日期选择变化
const onLastMaintenanceChange = (e: any) => {
  formData.lastMaintenance = e.detail.value;
};

// 下次维保日期选择变化
const onNextMaintenanceChange = (e: any) => {
  formData.nextMaintenance = e.detail.value;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    const id = editingEquipmentId.value;

    if (id) {
      // 更新设备
      await AioveuEquipmentAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增设备
      await AioveuEquipmentAPI.add(formData);
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
  if (!formData.assetNo) {
    uni.showToast({
      title: "请输入资产编号",
      icon: "none"
    });
    return false;
  }

  if (!formData.name) {
    uni.showToast({
      title: "请输入设备名称",
      icon: "none"
    });
    return false;
  }

  if (!formData.categoryId) {
    uni.showToast({
      title: "请选择设备分类",
      icon: "none"
    });
    return false;
  }

  if (!formData.departmentId) {
    uni.showToast({
      title: "请选择所属部门",
      icon: "none"
    });
    return false;
  }

  if (!formData.responsiblePerson) {
    uni.showToast({
      title: "请选择责任人",
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
