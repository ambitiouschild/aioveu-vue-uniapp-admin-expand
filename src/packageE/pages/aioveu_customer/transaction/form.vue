<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 交易编号 -->
      <view class="form-item">
        <text class="form-label">交易编号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入交易编号"
          v-model="formData.transactionNo"
        />
      </view>

      <!-- 客户 -->
      <view class="form-item">
        <text class="form-label">客户</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="customerOptions"
          range-key="customerName"
          :value="customerIndex"
          @change="onCustomerChange"
        >
          <view class="picker-view">
            {{ customerIndex >= 0 ? customerOptions[customerIndex].customerName : '请选择客户' }}
          </view>
        </picker>
      </view>

      <!-- 联系人 -->
      <view class="form-item">
        <text class="form-label">联系人</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="contactOptions"
          range-key="contactName"
          :value="contactIndex"
          @change="onContactChange"
        >
          <view class="picker-view">
            {{ contactIndex >= 0 ? contactOptions[contactIndex].contactName : '请选择联系人' }}
          </view>
        </picker>
      </view>

      <!-- 交易日期 -->
      <view class="form-item">
        <text class="form-label">交易日期</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.transactionDate"
          :default-value="new Date()"
          @confirm="onTransactionDateChange"
        >
          <view class="picker-view">
            {{ formData.transactionDate ? formatDateTimeDisplay(formData.transactionDate) : '请选择交易日期' }}
          </view>
        </wd-datetime-picker>
      </view>

      <!-- 交易金额 -->
      <view class="form-item">
        <text class="form-label">交易金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入交易金额"
          v-model="formData.amount"
        />
      </view>

      <!-- 货币代码 -->
      <view class="form-item">
        <text class="form-label">货币代码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入货币代码"
          v-model="formData.currency"
        />
      </view>

      <!-- 支付方式 -->
      <view class="form-item">
        <text class="form-label">支付方式</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentMethodOptions"
          range-key="label"
          :value="paymentMethodIndex"
          @change="onPaymentMethodChange"
        >
          <view class="picker-view">
            {{ paymentMethodIndex >= 0 ? paymentMethodOptions[paymentMethodIndex].label : '请选择支付方式' }}
          </view>
        </picker>
      </view>

      <!-- 支付状态 -->
      <view class="form-item">
        <text class="form-label">支付状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentStatusOptions"
          range-key="label"
          :value="paymentStatusIndex"
          @change="onPaymentStatusChange"
        >
          <view class="picker-view">
            {{ paymentStatusIndex >= 0 ? paymentStatusOptions[paymentStatusIndex].label : '请选择支付状态' }}
          </view>
        </picker>
      </view>

      <!-- 交易类型 -->
      <view class="form-item">
        <text class="form-label">交易类型</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="transactionTypeOptions"
          range-key="label"
          :value="transactionTypeIndex"
          @change="onTransactionTypeChange"
        >
          <view class="picker-view">
            {{ transactionTypeIndex >= 0 ? transactionTypeOptions[transactionTypeIndex].label : '请选择交易类型' }}
          </view>
        </picker>
      </view>

      <!-- 发票号码 -->
      <view class="form-item">
        <text class="form-label">发票号码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入发票号码"
          v-model="formData.invoiceNo"
        />
      </view>

      <!-- 产品ID -->
      <view class="form-item">
        <text class="form-label">产品ID</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入产品ID"
          v-model="formData.productId"
        />
      </view>

      <!-- 数量 -->
      <view class="form-item">
        <text class="form-label">数量</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入数量"
          v-model="formData.quantity"
        />
      </view>

      <!-- 单价 -->
      <view class="form-item">
        <text class="form-label">单价</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入单价"
          v-model="formData.unitPrice"
        />
      </view>

      <!-- 折扣率 -->
      <view class="form-item">
        <text class="form-label">折扣率</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入折扣率"
          v-model="formData.discount"
        />
      </view>

      <!-- 税率 -->
      <view class="form-item">
        <text class="form-label">税率</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入税率"
          v-model="formData.taxRate"
        />
      </view>

      <!-- 税额 -->
      <view class="form-item">
        <text class="form-label">税额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入税额"
          v-model="formData.taxAmount"
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

      <!-- 交易状态 -->
      <view class="form-item">
        <text class="form-label">交易状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="transactionStatusOptions"
          range-key="label"
          :value="transactionStatusIndex"
          @change="onTransactionStatusChange"
        >
          <view class="picker-view">
            {{ transactionStatusIndex >= 0 ? transactionStatusOptions[transactionStatusIndex].label : '请选择交易状态' }}
          </view>
        </picker>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="form-label">备注</text>
        <textarea
          class="form-textarea"
          placeholder="请输入备注"
          v-model="formData.notes"
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
import AioveuTransactionAPI, {
  AioveuTransactionForm
} from "@/packageE/api/aioveuTransaction/aioveu-transaction";
import AioveuCustomerAPI, { CustomerOptionVO } from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuContactAPI, { ContactOptionVO } from "@/packageE/api/aioveuContact/aioveu-contact";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageE/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增交易记录');
const transactionId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingTransactionId = ref<number | undefined>(undefined);

const formData = reactive<AioveuTransactionForm>({});

const customerOptions = ref<CustomerOptionVO[]>([]);
const contactOptions = ref<ContactOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const paymentMethodOptions = ref<DictItemOption[]>([]);
const paymentStatusOptions = ref<DictItemOption[]>([]);
const transactionTypeOptions = ref<DictItemOption[]>([]);
const transactionStatusOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const contactIndex = ref(-1);
const employeeIndex = ref(-1);
const paymentMethodIndex = ref(-1);
const paymentStatusIndex = ref(-1);
const transactionTypeIndex = ref(-1);
const transactionStatusIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadCustomerOptions();
  loadContactOptions();
  loadEmployeeOptions();
  loadDictOptions();



  if (options.id) {
    transactionId.value = Number(options.id);
    formTitle.value = '编辑交易记录';
    loadTransactionData();
  } else {
    formTitle.value = '新增交易记录';
  }

  // 存储编辑ID
  editingTransactionId.value = transactionId.value;


});

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

// 加载交易记录数据
const loadTransactionData = async () => {
  if (!transactionId.value) return;

  try {
    loading.value = true;
    const data = await AioveuTransactionAPI.getFormData(transactionId.value);
    Object.assign(formData, {
      ...data,
      // 将后端字符串转换为 Date 对象
      transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
    });

    // 设置选项索引
    if (formData.customerName) {
      const custIdx = customerOptions.value.findIndex(cust => cust.customerName === formData.customerName);
      customerIndex.value = custIdx;
    }

    if (formData.contactName) {
      const contactIdx = contactOptions.value.findIndex(contact => contact.contactName === formData.contactName);
      contactIndex.value = contactIdx;
    }

    if (formData.salesRepName) {
      const empIdx = employeeOptions.value.findIndex(emp => emp.employeeName === formData.salesRepName);
      employeeIndex.value = empIdx;
    }

    if (formData.paymentMethod !== undefined) {
      const methodIdx = paymentMethodOptions.value.findIndex(opt => Number(opt.value) === formData.paymentMethod);
      paymentMethodIndex.value = methodIdx;
    }

    if (formData.paymentStatus !== undefined) {
      const statusIdx = paymentStatusOptions.value.findIndex(opt => Number(opt.value) === formData.paymentStatus);
      paymentStatusIndex.value = statusIdx;
    }

    if (formData.transactionType !== undefined) {
      const typeIdx = transactionTypeOptions.value.findIndex(opt => Number(opt.value) === formData.transactionType);
      transactionTypeIndex.value = typeIdx;
    }

    if (formData.transactionStatus !== undefined) {
      const statusIdx = transactionStatusOptions.value.findIndex(opt => Number(opt.value) === formData.transactionStatus);
      transactionStatusIndex.value = statusIdx;
    }
  } catch (error) {
    console.error('加载交易记录数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载客户选项
const loadCustomerOptions = async () => {
  try {
    const response = await AioveuCustomerAPI.getAllCustomerOptions();
    if (Array.isArray(response)) {
      customerOptions.value = response.map(cust => ({
        customerId: Number(cust.customerId),
        customerName: cust.customerName
      }));
    }
  } catch (error) {
    console.error('加载客户列表失败:', error);
    uni.showToast({
      title: '加载客户列表失败',
      icon: 'none'
    });
  }
};

// 加载联系人选项
const loadContactOptions = async () => {
  try {
    const response = await AioveuContactAPI.getAllContactOptions();
    if (Array.isArray(response)) {
      contactOptions.value = response.map(contact => ({
        contactId: Number(contact.contactId),
        contactName: contact.contactName
      }));
    }
  } catch (error) {
    console.error('加载联系人列表失败:', error);
    uni.showToast({
      title: '加载联系人列表失败',
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

// 加载字典选项
const loadDictOptions = async () => {
  try {
    const paymentMethodResp = await DictAPI.getDictItems('transaction_payment_method');
    paymentMethodOptions.value = paymentMethodResp;

    const paymentStatusResp = await DictAPI.getDictItems('transaction_payment_status');
    paymentStatusOptions.value = paymentStatusResp;

    const transactionTypeResp = await DictAPI.getDictItems('transaction_type');
    transactionTypeOptions.value = transactionTypeResp;

    const transactionStatusResp = await DictAPI.getDictItems('transaction_status');
    transactionStatusOptions.value = transactionStatusResp;
  } catch (error) {
    console.error('加载字典选项失败:', error);
    uni.showToast({
      title: '加载选项失败',
      icon: 'none'
    });
  }
};

// 客户选择变化
const onCustomerChange = (e: any) => {
  const index = e.detail.value;
  customerIndex.value = index;
  if (customerOptions.value[index]) {
    formData.customerName = customerOptions.value[index].customerName;
  }
};

// 联系人选择变化
const onContactChange = (e: any) => {
  const index = e.detail.value;
  contactIndex.value = index;
  if (contactOptions.value[index]) {
    formData.contactName = contactOptions.value[index].contactName;
  }
};

// 支付方式选择变化
const onPaymentMethodChange = (e: any) => {
  const index = e.detail.value;
  paymentMethodIndex.value = index;
  if (paymentMethodOptions.value[index]) {
    formData.paymentMethod = Number(paymentMethodOptions.value[index].value);
  }
};

// 支付状态选择变化
const onPaymentStatusChange = (e: any) => {
  const index = e.detail.value;
  paymentStatusIndex.value = index;
  if (paymentStatusOptions.value[index]) {
    formData.paymentStatus = Number(paymentStatusOptions.value[index].value);
  }
};

// 交易类型选择变化
const onTransactionTypeChange = (e: any) => {
  const index = e.detail.value;
  transactionTypeIndex.value = index;
  if (transactionTypeOptions.value[index]) {
    formData.transactionType = Number(transactionTypeOptions.value[index].value);
  }
};

// 交易状态选择变化
const onTransactionStatusChange = (e: any) => {
  const index = e.detail.value;
  transactionStatusIndex.value = index;
  if (transactionStatusOptions.value[index]) {
    formData.transactionStatus = Number(transactionStatusOptions.value[index].value);
  }
};

// 负责人选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.salesRepName = employeeOptions.value[index].employeeName;
  }
};

// 交易日期选择变化
const onTransactionDateChange = (e: any) => {
  formData.transactionDate = new Date(e.value);
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
    transactionDate: formatDateToBackendString(formData.transactionDate),
  };
});




// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingTransactionId.value;
    const formData = backendFormData.value;

    if (id) {
      // 更新交易记录
      await AioveuTransactionAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增交易记录
      await AioveuTransactionAPI.add(formData);
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
  if (!formData.transactionNo) {
    uni.showToast({
      title: "请输入交易编号",
      icon: "none"
    });
    return false;
  }

  if (!formData.customerName) {
    uni.showToast({
      title: "请选择客户",
      icon: "none"
    });
    return false;
  }

  if (!formData.contactName) {
    uni.showToast({
      title: "请选择联系人",
      icon: "none"
    });
    return false;
  }

  if (!formData.transactionDate) {
    uni.showToast({
      title: "请选择交易日期",
      icon: "none"
    });
    return false;
  }

  if (formData.amount === undefined) {
    uni.showToast({
      title: "请输入交易金额",
      icon: "none"
    });
    return false;
  }

  if (formData.paymentMethod === undefined) {
    uni.showToast({
      title: "请选择支付方式",
      icon: "none"
    });
    return false;
  }

  if (formData.paymentStatus === undefined) {
    uni.showToast({
      title: "请选择支付状态",
      icon: "none"
    });
    return false;
  }

  if (formData.transactionType === undefined) {
    uni.showToast({
      title: "请选择交易类型",
      icon: "none"
    });
    return false;
  }

  if (formData.transactionStatus === undefined) {
    uni.showToast({
      title: "请选择交易状态",
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
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
  width: 100%;
  background-color: white;
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
