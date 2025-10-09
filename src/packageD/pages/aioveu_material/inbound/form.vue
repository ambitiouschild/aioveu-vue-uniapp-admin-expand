<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 入库单号 -->
      <view class="form-item">
        <text class="form-label">入库单号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入入库单号"
          v-model="formData.inboundNo"
        />
      </view>

      <!-- 物资 -->
      <view class="form-item">
        <text class="form-label">物资</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="materialOptions"
          range-key="materialName"
          :value="materialIndex"
          @change="onMaterialChange"
        >
          <view class="picker-view">
            {{ materialIndex >= 0 ? materialOptions[materialIndex].materialName : '请选择物资' }}
          </view>
        </picker>
      </view>

      <!-- 仓库 -->
      <view class="form-item">
        <text class="form-label">仓库</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="warehouseOptions"
          range-key="warehouseName"
          :value="warehouseIndex"
          @change="onWarehouseChange"
        >
          <view class="picker-view">
            {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].warehouseName : '请选择仓库' }}
          </view>
        </picker>
      </view>

      <!-- 入库数量 -->
      <view class="form-item">
        <text class="form-label">入库数量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入入库数量"
          v-model="formData.quantity"
        />
      </view>

      <!-- 入库单价 -->
      <view class="form-item">
        <text class="form-label">入库单价</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入入库单价"
          v-model="formData.unitPrice"
        />
      </view>

      <!-- 总金额 -->
      <view class="form-item">
        <text class="form-label">总金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入总金额"
          v-model="formData.totalAmount"
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

      <!-- 生产日期 -->
      <view class="form-item">
        <text class="form-label">生产日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.productionDate"
          @change="onProductionDateChange"
        >
          <view class="picker-view">
            {{ formData.productionDate || '请选择生产日期' }}
          </view>
        </picker>
      </view>

      <!-- 有效期至 -->
      <view class="form-item">
        <text class="form-label">有效期至</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.expiryDate"
          @change="onExpiryDateChange"
        >
          <view class="picker-view">
            {{ formData.expiryDate || '请选择有效期至' }}
          </view>
        </picker>
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

      <!-- 入库类型 -->
      <view class="form-item">
        <text class="form-label">入库类型</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="inboundTypeOptions"
          range-key="label"
          :value="inboundTypeIndex"
          @change="onInboundTypeChange"
        >
          <view class="picker-view">
            {{ inboundTypeIndex >= 0 ? inboundTypeOptions[inboundTypeIndex].label : '请选择入库类型' }}
          </view>
        </picker>
      </view>

      <!-- 入库时间 -->
      <view class="form-item">
        <text class="form-label">入库时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="datetime"
          :value="formData.inTime"
          :default-value="new Date()"
          @confirm="onInTimeChange"
        >
          <view class="picker-view">
            {{ formData.inTime ? formatDateTimeDisplay(formData.inTime) : '请选择入库时间' }}
          </view>
        </wd-datetime-picker>
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
import AioveuInboundAPI, {
  AioveuInboundForm
} from "@/packageD/api/aioveuInbound/aioveu-inbound";
import AioveuMaterialAPI, { MaterialOptionVO } from "@/packageD/api/aioveuMaterial/aioveu-material";
import AioveuWarehouseAPI, { WarehouseOptionVO } from "@/packageD/api/aioveuWarehouse/aioveu-warehouse";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageD/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增入库');
const inboundId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingInboundId = ref<number | undefined>(undefined);

const formData = reactive<AioveuInboundForm>({
  inboundNo: '',
  materialName: '',
  warehouseName: '',
  quantity: undefined,
  unitPrice: undefined,
  totalAmount: undefined,
  batchNumber: '',
  inboundType: undefined,
  operatorName: '',
  remark: ''
});

const materialOptions = ref<MaterialOptionVO[]>([]);
const warehouseOptions = ref<WarehouseOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const inboundTypeOptions = ref<DictItemOption[]>([]);

const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const employeeIndex = ref(-1);
const inboundTypeIndex = ref(-1);



onLoad( (options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadMaterialOptions();
  loadWarehouseOptions();
  loadEmployeeOptions();
  loadInboundTypeOptions();

  if (options.id) {
    inboundId.value = Number(options.id);
    formTitle.value = '编辑入库';
    loadInboundData();
  } else {
    formTitle.value = '新增入库';
  }

  // 存储编辑ID
  editingInboundId.value = inboundId.value;


});

// 加载入库数据
const loadInboundData = async () => {
  if (!inboundId.value) return;

  try {
    loading.value = true;
    const data = await AioveuInboundAPI.getFormData(inboundId.value);
    Object.assign(formData, data);

    // 设置物资索引
    if (formData.materialName) {
      const index = materialOptions.value.findIndex(
        mat => mat.materialName === formData.materialName
      );
      materialIndex.value = index;
    }

    // 设置仓库索引
    if (formData.warehouseName) {
      const index = warehouseOptions.value.findIndex(
        wh => wh.warehouseName === formData.warehouseName
      );
      warehouseIndex.value = index;
    }

    // 设置操作员索引
    if (formData.operatorName) {
      const index = employeeOptions.value.findIndex(
        emp => emp.employeeName === formData.operatorName
      );
      employeeIndex.value = index;
    }

    // 设置入库类型索引
    if (formData.inboundType !== undefined) {
      const index = inboundTypeOptions.value.findIndex(
        item => Number(item.value) === formData.inboundType
      );
      inboundTypeIndex.value = index;
    }
  } catch (error) {
    console.error('加载入库数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载物资选项
const loadMaterialOptions = async () => {
  try {
    const response = await AioveuMaterialAPI.getAllMaterialOptions();
    if (Array.isArray(response)) {
      materialOptions.value = response.map(mat => ({
        materialId: Number(mat.materialId),
        materialName: mat.materialName
      }));
    }
  } catch (error) {
    console.error('加载物资列表失败:', error);
    uni.showToast({
      title: '加载物资列表失败',
      icon: 'none'
    });
  }
};

// 加载仓库选项
const loadWarehouseOptions = async () => {
  try {
    const response = await AioveuWarehouseAPI.getAllWarehouseOptions();
    if (Array.isArray(response)) {
      warehouseOptions.value = response.map(wh => ({
        warehouseId: Number(wh.warehouseId),
        warehouseName: wh.warehouseName
      }));
    }
  } catch (error) {
    console.error('加载仓库列表失败:', error);
    uni.showToast({
      title: '加载仓库列表失败',
      icon: 'none'
    });
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

// 加载入库类型选项
const loadInboundTypeOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('inbound_type');
    inboundTypeOptions.value = response;
  } catch (error) {
    console.error('加载入库类型失败:', error);
    uni.showToast({
      title: '加载入库类型失败',
      icon: 'none'
    });
  }
};

// 物资选择变化
const onMaterialChange = (e: any) => {
  const index = e.detail.value;
  materialIndex.value = index;
  if (materialOptions.value[index]) {
    formData.materialName = materialOptions.value[index].materialName;
  }
};

// 仓库选择变化
const onWarehouseChange = (e: any) => {
  const index = e.detail.value;
  warehouseIndex.value = index;
  if (warehouseOptions.value[index]) {
    formData.warehouseName = warehouseOptions.value[index].warehouseName;
  }
};

// 操作员选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.operatorName = employeeOptions.value[index].employeeName;
  }
};

// 入库类型选择变化
const onInboundTypeChange = (e: any) => {
  const index = e.detail.value;
  inboundTypeIndex.value = index;
  if (inboundTypeOptions.value[index]) {
    formData.inboundType = Number(inboundTypeOptions.value[index].value);
  }
};

// 生产日期选择变化
const onProductionDateChange = (e: any) => {
  formData.productionDate = e.detail.value;
};

// 有效期至选择变化
const onExpiryDateChange = (e: any) => {
  console.log(e.detail.value);
  formData.expiryDate = e.detail.value;
};

// 时间显示格式化函数
const formatDateTimeDisplay = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 入库时间选择变化
const onInTimeChange = (e: any) => {
  // 时间选择器返回的是对象 {value: 1420041600000},时间选择器不同，返回值不同
  //Wot Design Uni 的 datetime-picker 组件在 @confirm事件中返回的是一个对象，包含 value属性。但错误提示 e是 undefined，这意味着事件对象可能没有被正确传递。
  console.log(e.value);
  console.log('最后出库时间选择事件对象:', e.value);
  formData.inTime = new Date(e.value);
};

// 修改 formatDateToBackendString 函数，允许 undefined
// 发送无时区标识的本地时间字符串，将 Date 转换为后端需要的格式: yyyy-MM-dd'T'HH:mm:ss.SSS
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


  // 1. 获取转换后的时间值
  const inTimeValue = formatDateToBackendString(formData.inTime);

  // 2. 打印原始值和转换后的值
  console.log('原始 inTime (Date):', formData.inTime);
  console.log('转换后的 inTime (string):', inTimeValue);

  // 3. 创建结果对象
  const result = {
    ...formData,
    inTime: inTimeValue,
  };

  // 4. 打印整个结果对象
  console.log('backendFormData 对象:', JSON.stringify(result, null, 2));

  return result;
});





// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingInboundId.value;
    const formData  = backendFormData.value;

    if (id) {
      // 更新入库
      await AioveuInboundAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增入库
      await AioveuInboundAPI.add(formData);
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
  if (!formData.inboundNo) {
    uni.showToast({
      title: "请输入入库单号",
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
      title: "请输入入库数量",
      icon: "none"
    });
    return false;
  }

  if (!formData.unitPrice) {
    uni.showToast({
      title: "请输入入库单价",
      icon: "none"
    });
    return false;
  }

  if (!formData.totalAmount) {
    uni.showToast({
      title: "请输入总金额",
      icon: "none"
    });
    return false;
  }

  if (!formData.inTime) {
    uni.showToast({
      title: "请选择入库时间",
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
