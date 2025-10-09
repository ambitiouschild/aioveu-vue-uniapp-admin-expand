<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 采购单号 -->
      <view class="form-item">
        <text class="form-label required">采购单号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入采购单号"
          v-model="formData.procurementNo"
        />
      </view>

      <!-- 供应商ID -->
      <view class="form-item">
        <text class="form-label required">供应商ID</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入供应商ID"
          v-model="formData.supplierId"
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

      <!-- 采购数量 -->
      <view class="form-item">
        <text class="form-label required">采购数量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入采购数量"
          v-model="formData.quantity"
        />
      </view>

      <!-- 采购单价 -->
      <view class="form-item">
        <text class="form-label required">采购单价</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入采购单价"
          v-model="formData.unitPrice"
        />
      </view>

      <!-- 总金额 -->
      <view class="form-item">
        <text class="form-label required">总金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入总金额"
          v-model="formData.totalAmount"
        />
      </view>

      <!-- 下单时间 -->
      <view class="form-item">
        <text class="form-label required">下单时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="datetime"
          :value="formData.orderDate"
          :default-value="new Date()"
          @confirm="onOrderDateChange"
        >
          <view class="picker-view">
            {{ formData.orderDate ? formatDateTimeDisplay(formData.orderDate) :'请选择下单时间' }}
          </view>
        </wd-datetime-picker>
      </view>

      <!-- 预计到货日期 -->
      <view class="form-item">
        <text class="form-label">预计到货日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.expectedDelivery"
          @change="onExpectedDeliveryChange"
        >
          <view class="picker-view">
            {{ formData.expectedDelivery || '请选择预计到货日期' }}
          </view>
        </picker>
      </view>

      <!-- 实际到货日期 -->
      <view class="form-item">
        <text class="form-label">实际到货日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.actualDelivery"
          @change="onActualDeliveryChange"
        >
          <view class="picker-view">
            {{ formData.actualDelivery || '请选择实际到货日期' }}
          </view>
        </picker>
      </view>

      <!-- 签收时间 -->
      <view class="form-item">
        <text class="form-label">签收时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.receiptDate"
          :default-value="new Date()"
          @confirm="onReceiptDateChange"
        >
          <view class="picker-view">
            {{ formData.receiptDate  ? formatDateTimeDisplay(formData.receiptDate) : '请选择签收时间' }}
          </view>
        </wd-datetime-picker>
      </view>

      <!-- 入库仓库 -->
      <view class="form-item">
        <text class="form-label required">入库仓库</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="warehouseOptions"
          range-key="text"
          :value="warehouseIndex"
          @change="onWarehouseChange"
        >
          <view class="picker-view">
            {{ warehouseIndex >= 0 ? warehouseOptions[warehouseIndex].text : '请选择入库仓库' }}
          </view>
        </picker>
      </view>

      <!-- 入库时间 -->
      <view class="form-item">
        <text class="form-label">入库时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.inboundDate"
          :default-value="new Date()"
          @confirm="onInboundDateChange"
        >
          <view class="picker-view">
            {{ formData.inboundDate ? formatDateTimeDisplay(formData.inboundDate) :  '请选择入库时间' }}
          </view>
        </wd-datetime-picker>
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

      <!-- 申请人 -->
      <view class="form-item">
        <text class="form-label required">申请人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="text"
          :value="applicantIndex"
          @change="onApplicantChange"
        >
          <view class="picker-view">
            {{ applicantIndex >= 0 ? employeeOptions[applicantIndex].text : '请选择申请人' }}
          </view>
        </picker>
      </view>

      <!-- 审核人 -->
      <view class="form-item">
        <text class="form-label">审核人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="text"
          :value="reviewerIndex"
          @change="onReviewerChange"
        >
          <view class="picker-view">
            {{ reviewerIndex >= 0 ? employeeOptions[reviewerIndex].text : '请选择审核人' }}
          </view>
        </picker>
      </view>

      <!-- 审核时间 -->
      <view class="form-item">
        <text class="form-label">审核时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.reviewTime"
          :default-value="new Date()"
          @confirm="onReviewTimeChange"
        >
          <view class="picker-view">
            {{ formData.reviewTime ? formatDateTimeDisplay(formData.reviewTime) : '请选择审核时间' }}
          </view>
        </wd-datetime-picker>
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
import AioveuProcurementAPI, {
  AioveuProcurementForm
} from '@/packageD/api/aioveuProcurement/aioveu-procurement';
import DictAPI, { DictItemOption } from '@/api/system/dict';
import AioveuMaterialAPI, { MaterialOptionVO } from '@/packageD/api/aioveuMaterial/aioveu-material';
import AioveuWarehouseAPI, { WarehouseOptionVO } from '@/packageD/api/aioveuWarehouse/aioveu-warehouse';
import AioveuEmployeeAPI, { EmployeeOptionVO } from '@/packageD/api/aioveuEmployee/aioveu-employee';

const formTitle = ref('新增采购流程');
const editingProcurementId = ref<number | undefined>(undefined);

// 表单数据
const formData = reactive<AioveuProcurementForm>({
  // procurementNo: '',
  // // supplierId: '',
  // materialName: '',
  // quantity: 0,
  // unitPrice: 0,
  // totalAmount: 0,
  // // orderDate: '',
  // // expectedDelivery: '',
  // // actualDelivery: '',
  // // receiptDate: '',
  // warehouseName: '',
  // // inboundDate: '',
  // status: undefined,
  // applicantName: '',
  // reviewerName: '',
  // // reviewTime: '',
  // remark: ''
});

// 选项
const statusOptions = ref<{value: number, text: string}[]>([]);
const materialOptions = ref<{value: string, text: string}[]>([]);
const warehouseOptions = ref<{value: string, text: string}[]>([]);
const employeeOptions = ref<{value: string, text: string}[]>([]);

// 当前选中索引
const materialIndex = ref(-1);
const warehouseIndex = ref(-1);
const statusIndex = ref(-1);
const applicantIndex = ref(-1);
const reviewerIndex = ref(-1);

onLoad((options: any) => {


  // 加载选项数据
  loadStatusOptions();
  loadMaterialOptions();
  loadWarehouseOptions();
  loadEmployeeOptions();


  if (options && options.id) {
    editingProcurementId.value = Number(options.id);
    formTitle.value = '编辑采购流程';
    loadFormData(Number(options.id));
  }else {
    formTitle.value = '新增采购流程';
  }


});

// 加载表单数据
const loadFormData = async (id: number) => {
  try {

    uni.showLoading({ title: '加载中...' });


    const data = await AioveuProcurementAPI.getFormData(id);
    Object.assign(formData, {

      ...data,
      // 将后端字符串转换为 Date 对象
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
      receiptDate: data.receiptDate ? new Date(data.receiptDate) : new Date(),
      inboundDate: data.inboundDate ? new Date(data.inboundDate) : new Date(),

      reviewTime: data.reviewTime ? new Date(data.reviewTime) : new Date(),


    });
    setSelectedIndexes();
  } catch (error) {
    console.error('加载采购数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  }finally {
    uni.hideLoading();
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

  // 状态
  if (formData.status !== undefined) {
    const index = statusOptions.value.findIndex(
      item => item.value === formData.status
    );
    statusIndex.value = index;
  }

  // 申请人
  if (formData.applicantName) {
    const index = employeeOptions.value.findIndex(
      item => item.value === formData.applicantName
    );
    applicantIndex.value = index;
  }

  // 审核人
  if (formData.reviewerName) {
    const index = employeeOptions.value.findIndex(
      item => item.value === formData.reviewerName
    );
    reviewerIndex.value = index;
  }
};

// 加载字典
const loadStatusOptions = () => {
  DictAPI.getDictItems('procurement_status').then(response => {
    statusOptions.value = response.map(item => ({
      value: Number(item.value),
      text: item.label
    }));
  });
};

// 加载物资选项
const loadMaterialOptions = () => {
  AioveuMaterialAPI.getAllMaterialOptions().then(response => {
    materialOptions.value = response.map(item => ({
      value: item.materialName,
      text: item.materialName
    }));
  });
};

// 加载仓库选项
const loadWarehouseOptions = () => {
  AioveuWarehouseAPI.getAllWarehouseOptions().then(response => {
    warehouseOptions.value = response.map(item => ({
      value: item.warehouseName,
      text: item.warehouseName
    }));
  });
};

// 加载员工选项
const loadEmployeeOptions = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions().then(response => {
    employeeOptions.value = response.map(item => ({
      value: item.employeeName,
      text: item.employeeName
    }));
  });
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

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (statusOptions.value[index]) {
    formData.status = statusOptions.value[index].value;
  }
};

// 申请人选择变化
const onApplicantChange = (e: any) => {
  const index = e.detail.value;
  applicantIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.applicantName = employeeOptions.value[index].value;
  }
};

// 审核人选择变化
const onReviewerChange = (e: any) => {
  const index = e.detail.value;
  reviewerIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.reviewerName = employeeOptions.value[index].value;
  }
};

// 日期选择变化
const onOrderDateChange = (e: any) => {
  formData.orderDate = new Date(e.value);
};

const onExpectedDeliveryChange = (e: any) => {
  formData.expectedDelivery = e.detail.value;
};

const onActualDeliveryChange = (e: any) => {
  formData.actualDelivery = e.detail.value;
};

const onReceiptDateChange = (e: any) => {
  formData.receiptDate = new Date(e.value);
};

const onInboundDateChange = (e: any) => {
  formData.inboundDate = new Date(e.value);
};

const onReviewTimeChange = (e: any) => {
  formData.reviewTime = new Date(e.value);
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


// 发送无时区标识的本地时间字符串，将 Date 转换为后端需要的格式: yyyy-MM-dd'T'HH:mm:ss
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
    orderDate: formatDateToBackendString(formData.orderDate),
    receiptDate: formatDateToBackendString(formData.receiptDate),
    inboundDate: formatDateToBackendString(formData.inboundDate),
    reviewTime: formatDateToBackendString(formData.reviewTime),
  };
});

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    const id = editingProcurementId.value;
    const formData = backendFormData.value;

    if (id) {
      // 更新采购流程
      await AioveuProcurementAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增采购流程
      await AioveuProcurementAPI.add(formData);
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
  if (!formData.procurementNo) {
    uni.showToast({
      title: "请输入采购单号",
      icon: "none"
    });
    return false;
  }

  if (!formData.supplierId) {
    uni.showToast({
      title: "请输入供应商ID",
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

  if (!formData.quantity) {
    uni.showToast({
      title: "请输入采购数量",
      icon: "none"
    });
    return false;
  }

  if (!formData.unitPrice) {
    uni.showToast({
      title: "请输入采购单价",
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

  if (!formData.orderDate) {
    uni.showToast({
      title: "请选择下单时间",
      icon: "none"
    });
    return false;
  }

  if (!formData.warehouseName) {
    uni.showToast({
      title: "请选择入库仓库",
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

  if (!formData.applicantName) {
    uni.showToast({
      title: "请选择申请人",
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
