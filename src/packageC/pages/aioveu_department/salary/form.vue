<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 员工 -->
      <view class="form-item">
        <text class="form-label">员工</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="employeeOptions"
          range-key="employeeName"
          :value="employeeIndex"
          @change="onEmployeeChange"
        >
          <view class="picker-view">
            {{ employeeIndex >= 0 ? employeeOptions[employeeIndex].employeeName : '请选择员工' }}
          </view>
        </picker>
      </view>

      <!-- 工资周期 -->
      <view class="form-item">
        <text class="form-label">工资周期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.salaryPeriod"
          @change="onSalaryPeriodChange"
        >
          <view class="picker-view">
            {{ formData.salaryPeriod || '请选择工资周期' }}
          </view>
        </picker>
      </view>

      <!-- 基本工资 -->
      <view class="form-item">
        <text class="form-label">基本工资</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入基本工资"
          v-model="formData.baseSalary"
        />
      </view>

      <!-- 绩效奖金 -->
      <view class="form-item">
        <text class="form-label">绩效奖金</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入绩效奖金"
          v-model="formData.performanceBonus"
        />
      </view>

      <!-- 加班补贴 -->
      <view class="form-item">
        <text class="form-label">加班补贴</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入加班补贴"
          v-model="formData.overtimePay"
        />
      </view>

      <!-- 各类津贴 -->
      <view class="form-item">
        <text class="form-label">各类津贴</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入各类津贴"
          v-model="formData.allowances"
        />
      </view>

      <!-- 社保扣除 -->
      <view class="form-item">
        <text class="form-label">社保扣除</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入社保扣除"
          v-model="formData.socialSecurity"
        />
      </view>

      <!-- 住房公积金 -->
      <view class="form-item">
        <text class="form-label">住房公积金</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入住房公积金"
          v-model="formData.housingFund"
        />
      </view>

      <!-- 个人所得税 -->
      <view class="form-item">
        <text class="form-label">个人所得税</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入个人所得税"
          v-model="formData.tax"
        />
      </view>

      <!-- 其他扣款 -->
      <view class="form-item">
        <text class="form-label">其他扣款</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入其他扣款"
          v-model="formData.otherDeductions"
        />
      </view>

      <!-- 实发工资 -->
      <view class="form-item">
        <text class="form-label">实发工资</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入实发工资"
          v-model="formData.netSalary"
        />
      </view>

      <!-- 实际发放日期 -->
      <view class="form-item">
        <text class="form-label">实际发放日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.paymentDate"
          @change="onPaymentDateChange"
        >
          <view class="picker-view">
            {{ formData.paymentDate || '请选择发放日期' }}
          </view>
        </picker>
      </view>

      <!-- 发放状态 -->
      <view class="form-item">
        <text class="form-label">发放状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="paymentStatusOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? paymentStatusOptions[statusIndex].label : '请选择发放状态' }}
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
import AioveuSalaryAPI, {
  AioveuSalaryForm
} from "@/packageC/api/aioveuSalary/aioveu-salary";
import AioveuEmployeeAPI, {  EmployeeOptionVO } from "@/packageC/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增工资');
const salaryId = ref<number | undefined>(undefined);
const loading = ref(false);

const formData = reactive<AioveuSalaryForm>({
  employeeName: '',
  baseSalary: undefined,
  performanceBonus: undefined,
  overtimePay: undefined,
  allowances: undefined,
  socialSecurity: undefined,
  housingFund: undefined,
  tax: undefined,
  otherDeductions: undefined,
  netSalary: undefined,
  paymentStatus: undefined
});

const employeeOptions = ref<EmployeeOptionVO[]>([]);
const paymentStatusOptions = ref<DictItemOption[]>([]);

const employeeIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadEmployees();
  loadPaymentStatusOptions();

  if (options.id) {
    salaryId.value = Number(options.id);
    formTitle.value = '编辑工资';
    loadSalaryData();
  } else {
    formTitle.value = '新增工资';
  }


});

// 加载工资数据
const loadSalaryData = async () => {
  if (!salaryId.value) return;

  try {
    loading.value = true;
    const data = await AioveuSalaryAPI.getFormData(salaryId.value);
    Object.assign(formData, data);

    // 设置员工索引
    if (formData.employeeName) {
      const index = employeeOptions.value.findIndex(
        emp => emp.employeeName === formData.employeeName
      );
      employeeIndex.value = index;
    }

    // 设置状态索引
    if (formData.paymentStatus !== undefined) {
      const index = paymentStatusOptions.value.findIndex(
        item => Number(item.value) === formData.paymentStatus
      );
      statusIndex.value = index;
    }
  } catch (error) {
    console.error('加载工资数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载员工选项
const loadEmployees = async () => {
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

// 加载发放状态选项
const loadPaymentStatusOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('salary_payment_status');
    paymentStatusOptions.value = response;
  } catch (error) {
    console.error('加载发放状态失败:', error);
    uni.showToast({
      title: '加载发放状态失败',
      icon: 'none'
    });
  }
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.employeeName = employeeOptions.value[index].employeeName;
  }
};

// 工资周期选择变化
const onSalaryPeriodChange = (e: any) => {
  formData.salaryPeriod = e.detail.value;
};

// 发放日期选择变化
const onPaymentDateChange = (e: any) => {
  formData.paymentDate = e.detail.value;
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (paymentStatusOptions.value[index]) {
    formData.paymentStatus = Number(paymentStatusOptions.value[index].value);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    if (salaryId.value) {
      // 更新工资
      await AioveuSalaryAPI.update(salaryId.value, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增工资
      await AioveuSalaryAPI.add(formData);
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
  if (!formData.employeeName) {
    uni.showToast({
      title: "请选择员工",
      icon: "none"
    });
    return false;
  }

  if (!formData.salaryPeriod) {
    uni.showToast({
      title: "请选择工资周期",
      icon: "none"
    });
    return false;
  }

  if (!formData.baseSalary) {
    uni.showToast({
      title: "请输入基本工资",
      icon: "none"
    });
    return false;
  }

  if (!formData.netSalary) {
    uni.showToast({
      title: "请输入实发工资",
      icon: "none"
    });
    return false;
  }

  if (formData.paymentStatus === undefined) {
    uni.showToast({
      title: "请选择发放状态",
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
/* 样式与绩效管理表单页类似，根据实际需求调整 */
/* 此处省略样式代码，实际使用时需要添加 */
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
