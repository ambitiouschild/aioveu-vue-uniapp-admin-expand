<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 客户编号 -->
      <view class="form-item">
        <text class="form-label">客户编号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入客户编号"
          v-model="formData.customerNo"
        />
      </view>

      <!-- 客户名称 -->
      <view class="form-item">
        <text class="form-label">客户名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入客户名称"
          v-model="formData.name"
        />
      </view>

      <!-- 客户类型 -->
      <view class="form-item">
        <text class="form-label">客户类型</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="typeOptions"
          range-key="label"
          :value="typeIndex"
          @change="onTypeChange"
        >
          <view class="picker-view">
            {{ typeIndex >= 0 ? typeOptions[typeIndex].label : '请选择客户类型' }}
          </view>
        </picker>
      </view>

      <!-- 信用等级 -->
      <view class="form-item">
        <text class="form-label">信用等级</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="creditRatingOptions"
          range-key="label"
          :value="creditRatingIndex"
          @change="onCreditRatingChange"
        >
          <view class="picker-view">
            {{ creditRatingIndex >= 0 ? creditRatingOptions[creditRatingIndex].label : '请选择信用等级' }}
          </view>
        </picker>
      </view>

      <!-- 客户状态 -->
      <view class="form-item">
        <text class="form-label">客户状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="customerStatusOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? customerStatusOptions[statusIndex].label : '请选择客户状态' }}
          </view>
        </picker>
      </view>

      <!-- 客户地址 -->
      <view class="form-item">
        <text class="form-label">客户地址</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入客户地址"
          v-model="formData.address"
        />
      </view>

      <!-- 所在城市 -->
      <view class="form-item">
        <text class="form-label">所在城市</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入所在城市"
          v-model="formData.city"
        />
      </view>

      <!-- 所在省份 -->
      <view class="form-item">
        <text class="form-label">所在省份</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入所在省份"
          v-model="formData.province"
        />
      </view>

      <!-- 国家 -->
      <view class="form-item">
        <text class="form-label">国家</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入国家"
          v-model="formData.country"
        />
      </view>

      <!-- 邮政编码 -->
      <view class="form-item">
        <text class="form-label">邮政编码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入邮政编码"
          v-model="formData.postalCode"
        />
      </view>

      <!-- 联系电话 -->
      <view class="form-item">
        <text class="form-label">联系电话</text>
        <input
          type="tel"
          class="form-input"
          placeholder="请输入联系电话"
          v-model="formData.phone"
        />
      </view>

      <!-- 电子邮箱 -->
      <view class="form-item">
        <text class="form-label">电子邮箱</text>
        <input
          type="email"
          class="form-input"
          placeholder="请输入电子邮箱"
          v-model="formData.email"
        />
      </view>

      <!-- 网址 -->
      <view class="form-item">
        <text class="form-label">网址</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入网址"
          v-model="formData.website"
        />
      </view>

      <!-- 税号 -->
      <view class="form-item">
        <text class="form-label">税号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入税号"
          v-model="formData.taxId"
        />
      </view>

      <!-- 银行账号 -->
      <view class="form-item">
        <text class="form-label">银行账号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入银行账号"
          v-model="formData.bankAccount"
        />
      </view>

      <!-- 开户行 -->
      <view class="form-item">
        <text class="form-label">开户行</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入开户行"
          v-model="formData.bankName"
        />
      </view>

      <!-- 年营业额 -->
      <view class="form-item">
        <text class="form-label">年营业额</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入年营业额"
          v-model="formData.annualRevenue"
        />
      </view>

      <!-- 员工人数 -->
      <view class="form-item">
        <text class="form-label">员工人数</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入员工人数"
          v-model="formData.employeeCount"
        />
      </view>

      <!-- 成立日期 -->
      <view class="form-item">
        <text class="form-label">成立日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.establishedDate"
          @change="onDateChange"
        >
          <view class="picker-view">
            {{ formData.establishedDate || '请选择成立日期' }}
          </view>
        </picker>
      </view>

      <!-- 客户来源 -->
      <view class="form-item">
        <text class="form-label">客户来源</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="sourceOptions"
          range-key="label"
          :value="sourceIndex"
          @change="onSourceChange"
        >
          <view class="picker-view">
            {{ sourceIndex >= 0 ? sourceOptions[sourceIndex].label : '请选择客户来源' }}
          </view>
        </picker>
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
import AioveuCustomerAPI, {
  AioveuCustomerForm
} from "@/packageE/api/aioveuCustomer/aioveu-customer";
import AioveuEmployeeAPI, { EmployeeOptionVO } from "@/packageE/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增客户');
const customerId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingCustomerId = ref<number | undefined>(undefined);

const formData = reactive<AioveuCustomerForm>({});

const typeOptions = ref<DictItemOption[]>([]);
const creditRatingOptions = ref<DictItemOption[]>([]);
const customerStatusOptions = ref<DictItemOption[]>([]);
const sourceOptions = ref<DictItemOption[]>([]);
const employeeOptions = ref<EmployeeOptionVO[]>([]);

const typeIndex = ref(-1);
const creditRatingIndex = ref(-1);
const statusIndex = ref(-1);
const sourceIndex = ref(-1);
const employeeIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadDictOptions();
  loadEmployeeOptions();

  if (options.id) {
    customerId.value = Number(options.id);
    formTitle.value = '编辑客户';
    loadCustomerData();
  } else {
    formTitle.value = '新增客户';
  }

  // 存储编辑ID
  editingCustomerId.value = customerId.value;


});

// 加载客户数据
const loadCustomerData = async () => {
  if (!customerId.value) return;

  try {
    loading.value = true;
    const data = await AioveuCustomerAPI.getFormData(customerId.value);
    Object.assign(formData, data);

    // 设置选项索引
    if (formData.type !== undefined) {
      const typeIdx = typeOptions.value.findIndex(opt => Number(opt.value) === formData.type);
      typeIndex.value = typeIdx;
    }

    if (formData.creditRating !== undefined) {
      const creditIdx = creditRatingOptions.value.findIndex(opt => Number(opt.value) === formData.creditRating);
      creditRatingIndex.value = creditIdx;
    }

    if (formData.customerStatus !== undefined) {
      const statusIdx = customerStatusOptions.value.findIndex(opt => Number(opt.value) === formData.customerStatus);
      statusIndex.value = statusIdx;
    }

    if (formData.source !== undefined) {
      const sourceIdx = sourceOptions.value.findIndex(opt => Number(opt.value) === formData.source);
      sourceIndex.value = sourceIdx;
    }

    if (formData.salesRepName) {
      const empIdx = employeeOptions.value.findIndex(emp => emp.employeeName === formData.salesRepName);
      employeeIndex.value = empIdx;
    }
  } catch (error) {
    console.error('加载客户数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载字典选项
const loadDictOptions = async () => {
  try {
    const typeResp = await DictAPI.getDictItems('customer_customer_type');
    typeOptions.value = typeResp;

    const creditResp = await DictAPI.getDictItems('customer_credit_rating');
    creditRatingOptions.value = creditResp;

    const statusResp = await DictAPI.getDictItems('customer_status');
    customerStatusOptions.value = statusResp;

    const sourceResp = await DictAPI.getDictItems('customer_source');
    sourceOptions.value = sourceResp;
  } catch (error) {
    console.error('加载字典选项失败:', error);
    uni.showToast({
      title: '加载选项失败',
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

// 类型选择变化
const onTypeChange = (e: any) => {
  const index = e.detail.value;
  typeIndex.value = index;
  if (typeOptions.value[index]) {
    formData.type = Number(typeOptions.value[index].value);
  }
};

// 信用等级选择变化
const onCreditRatingChange = (e: any) => {
  const index = e.detail.value;
  creditRatingIndex.value = index;
  if (creditRatingOptions.value[index]) {
    formData.creditRating = Number(creditRatingOptions.value[index].value);
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (customerStatusOptions.value[index]) {
    formData.customerStatus = Number(customerStatusOptions.value[index].value);
  }
};

// 来源选择变化
const onSourceChange = (e: any) => {
  const index = e.detail.value;
  sourceIndex.value = index;
  if (sourceOptions.value[index]) {
    formData.source = Number(sourceOptions.value[index].value);
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.salesRepName = employeeOptions.value[index].employeeName;
  }
};

// 日期选择变化
const onDateChange = (e: any) => {
  formData.establishedDate = e.detail.value;
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingCustomerId.value;

    if (id) {
      // 更新客户
      await AioveuCustomerAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增客户
      await AioveuCustomerAPI.add(formData);
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
  if (!formData.customerNo) {
    uni.showToast({
      title: "请输入客户编号",
      icon: "none"
    });
    return false;
  }

  if (!formData.name) {
    uni.showToast({
      title: "请输入客户名称",
      icon: "none"
    });
    return false;
  }

  if (formData.type === undefined) {
    uni.showToast({
      title: "请选择客户类型",
      icon: "none"
    });
    return false;
  }

  if (formData.creditRating === undefined) {
    uni.showToast({
      title: "请选择信用等级",
      icon: "none"
    });
    return false;
  }

  if (formData.customerStatus === undefined) {
    uni.showToast({
      title: "请选择客户状态",
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

.form-input, .form-picker {
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
  width: 100%;
  background-color: white;
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
