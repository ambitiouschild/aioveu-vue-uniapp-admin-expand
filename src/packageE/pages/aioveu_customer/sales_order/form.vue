<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 订单编号 -->
      <view class="form-item">
        <text class="form-label">订单编号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入订单编号"
          v-model="formData.orderNo"
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

      <!-- 下单时间 -->
      <view class="form-item">
        <text class="form-label">下单时间</text>
        <wd-datetime-picker
          class="form-picker"
          mode="date"
          :value="formData.orderDate"
          :default-value="new Date()"
          @confirm="onOrderDateChange"
        >
          <view class="picker-view">
            {{ formData.orderDate ? formatDateTimeDisplay(formData.orderDate) :'请选择下单时间' }}
          </view>
        </wd-datetime-picker>
      </view>

      <!-- 预计交货日期 -->
      <view class="form-item">
        <text class="form-label">预计交货日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.expectedDelivery"
          @change="onExpectedDeliveryChange"
        >
          <view class="picker-view">
            {{ formData.expectedDelivery || '请选择预计交货日期' }}
          </view>
        </picker>
      </view>

      <!-- 实际交货日期 -->
      <view class="form-item">
        <text class="form-label">实际交货日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.actualDelivery"
          @change="onActualDeliveryChange"
        >
          <view class="picker-view">
            {{ formData.actualDelivery || '请选择实际交货日期' }}
          </view>
        </picker>
      </view>

      <!-- 订单总金额 -->
      <view class="form-item">
        <text class="form-label">订单总金额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入订单总金额"
          v-model="formData.totalAmount"
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

      <!-- 订单总额 -->
      <view class="form-item">
        <text class="form-label">订单总额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入订单总额"
          v-model="formData.grandTotal"
        />
      </view>

      <!-- 付款条件 -->
      <view class="form-item">
        <text class="form-label">付款条件</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentTermsOptions"
          range-key="label"
          :value="paymentTermsIndex"
          @change="onPaymentTermsChange"
        >
          <view class="picker-view">
            {{ paymentTermsIndex >= 0 ? paymentTermsOptions[paymentTermsIndex].label : '请选择付款条件' }}
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

      <!-- 订单状态 -->
      <view class="form-item">
        <text class="form-label">订单状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="orderStatusOptions"
          range-key="label"
          :value="orderStatusIndex"
          @change="onOrderStatusChange"
        >
          <view class="picker-view">
            {{ orderStatusIndex >= 0 ? orderStatusOptions[orderStatusIndex].label : '请选择订单状态' }}
          </view>
        </picker>
      </view>

      <!-- 收货地址 -->
      <view class="form-item">
        <text class="form-label">收货地址</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入收货地址"
          v-model="formData.shippingAddress"
        />
      </view>

      <!-- 运输方式 -->
      <view class="form-item">
        <text class="form-label">运输方式</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="shippingMethodOptions"
          range-key="label"
          :value="shippingMethodIndex"
          @change="onShippingMethodChange"
        >
          <view class="picker-view">
            {{ shippingMethodIndex >= 0 ? shippingMethodOptions[shippingMethodIndex].label : '请选择运输方式' }}
          </view>
        </picker>
      </view>

      <!-- 物流单号 -->
      <view class="form-item">
        <text class="form-label">物流单号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入物流单号"
          v-model="formData.trackingNo"
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

      <!-- 操作员 -->
      <view class="form-item">
        <text class="form-label">操作员</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="employeeName"
          :value="operatorIndex"
          @change="onOperatorChange"
        >
          <view class="picker-view">
            {{ operatorIndex >= 0 ? employeeOptions[operatorIndex].employeeName : '请选择操作员' }}
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
import AioveuSalesOrderAPI, {
  AioveuSalesOrderForm
} from "@/packageE/api/aioveuSalesOrder/aioveu-sales-order";
import AioveuCustomerAPI, { CustomerOptionVO } from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuContactAPI, { ContactOptionVO } from "@/packageE/api/aioveuContact/aioveu-contact";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageE/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增销售订单');
const salesOrderId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingSalesOrderId = ref<number | undefined>(undefined);

const formData = reactive<AioveuSalesOrderForm>({});

const customerOptions = ref<CustomerOptionVO[]>([]);
const contactOptions = ref<ContactOptionVO[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);
const paymentTermsOptions = ref<DictItemOption[]>([]);
const paymentStatusOptions = ref<DictItemOption[]>([]);
const orderStatusOptions = ref<DictItemOption[]>([]);
const shippingMethodOptions = ref<DictItemOption[]>([]);

const customerIndex = ref(-1);
const contactIndex = ref(-1);
const employeeIndex = ref(-1);
const operatorIndex = ref(-1);
const paymentTermsIndex = ref(-1);
const paymentStatusIndex = ref(-1);
const orderStatusIndex = ref(-1);
const shippingMethodIndex = ref(-1);


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

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 存储编辑ID
  editingSalesOrderId.value = salesOrderId.value;

  // 加载选项数据
  loadCustomerOptions();
  loadContactOptions();
  loadEmployeeOptions();
  loadDictOptions();



  if (options.id) {
    salesOrderId.value = Number(options.id);
    formTitle.value = '编辑销售订单';
    loadSalesOrderData();

  } else {
    formTitle.value = '新增销售订单';
  }


});

// 加载销售订单数据
const loadSalesOrderData = async () => {
  if (!salesOrderId.value) return;

  try {
    loading.value = true;
    const data = await AioveuSalesOrderAPI.getFormData(salesOrderId.value);
    Object.assign(formData,{
      ...data,
      // 将后端字符串转换为 Date 对象
      orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
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

    if (formData.operatorName) {
      const opIdx = employeeOptions.value.findIndex(emp => emp.employeeName === formData.operatorName);
      operatorIndex.value = opIdx;
    }

    if (formData.paymentTerms !== undefined) {
      const termsIdx = paymentTermsOptions.value.findIndex(opt => Number(opt.value) === formData.paymentTerms);
      paymentTermsIndex.value = termsIdx;
    }

    if (formData.paymentStatus !== undefined) {
      const statusIdx = paymentStatusOptions.value.findIndex(opt => Number(opt.value) === formData.paymentStatus);
      paymentStatusIndex.value = statusIdx;
    }

    if (formData.orderStatus !== undefined) {
      const statusIdx = orderStatusOptions.value.findIndex(opt => Number(opt.value) === formData.orderStatus);
      orderStatusIndex.value = statusIdx;
    }

    if (formData.shippingMethod !== undefined) {
      const methodIdx = shippingMethodOptions.value.findIndex(opt => Number(opt.value) === formData.shippingMethod);
      shippingMethodIndex.value = methodIdx;
    }
  } catch (error) {
    console.error('加载销售订单数据失败:', error);
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
    const paymentTermsResp = await DictAPI.getDictItems('salesOrder_payment_terms');
    paymentTermsOptions.value = paymentTermsResp;

    const paymentStatusResp = await DictAPI.getDictItems('salesOrder_payment_status');
    paymentStatusOptions.value = paymentStatusResp;

    const orderStatusResp = await DictAPI.getDictItems('salesOrder_order_status');
    orderStatusOptions.value = orderStatusResp;

    const shippingMethodResp = await DictAPI.getDictItems('salesOrder_shipping_method');
    shippingMethodOptions.value = shippingMethodResp;
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

// 下单时间选择变化
const onOrderDateChange = (e: any) => {
  formData.orderDate = new Date(e.value);
};

// 预计交货日期选择变化
const onExpectedDeliveryChange = (e: any) => {
  formData.expectedDelivery = e.detail.value;
};

// 实际交货日期选择变化
const onActualDeliveryChange = (e: any) => {
  formData.actualDelivery = e.detail.value;
};

// 付款条件选择变化
const onPaymentTermsChange = (e: any) => {
  const index = e.detail.value;
  paymentTermsIndex.value = index;
  if (paymentTermsOptions.value[index]) {
    formData.paymentTerms = Number(paymentTermsOptions.value[index].value);
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

// 订单状态选择变化
const onOrderStatusChange = (e: any) => {
  const index = e.detail.value;
  orderStatusIndex.value = index;
  if (orderStatusOptions.value[index]) {
    formData.orderStatus = Number(orderStatusOptions.value[index].value);
  }
};

// 运输方式选择变化
const onShippingMethodChange = (e: any) => {
  const index = e.detail.value;
  shippingMethodIndex.value = index;
  if (shippingMethodOptions.value[index]) {
    formData.shippingMethod = Number(shippingMethodOptions.value[index].value);
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

// 操作员选择变化
const onOperatorChange = (e: any) => {
  const index = e.detail.value;
  operatorIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.operatorName = employeeOptions.value[index].employeeName;
  }
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
  };
});


// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });
    const formData = backendFormData.value;

    // 使用存储的ID
    const id = editingSalesOrderId.value;

    if (id) {
      // 更新销售订单
      await AioveuSalesOrderAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增销售订单
      await AioveuSalesOrderAPI.add(formData);
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
  if (!formData.orderNo) {
    uni.showToast({
      title: "请输入订单编号",
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

  if (!formData.orderDate) {
    uni.showToast({
      title: "请选择下单时间",
      icon: "none"
    });
    return false;
  }

  if (formData.totalAmount === undefined) {
    uni.showToast({
      title: "请输入订单总金额",
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

  if (formData.orderStatus === undefined) {
    uni.showToast({
      title: "请选择订单状态",
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
