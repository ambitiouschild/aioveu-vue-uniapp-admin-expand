<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 员工姓名 -->
      <view class="form-item">
        <text class="form-label">员工姓名</text>
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

      <!-- 日期 -->
      <view class="form-item">
        <text class="form-label">日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.date"
          @change="onDateChange"
        >
          <view class="picker-view">
            {{ formData.date || '请选择日期' }}
          </view>
        </picker>
      </view>

      <!-- 上班打卡时间 -->
      <view class="form-item">
        <text class="form-label">上班打卡时间</text>
        <picker
          class="form-picker"
          mode="time"
          :value="formData.checkinTime"
          @change="onCheckinTimeChange"
        >
          <view class="picker-view">
            {{ formData.checkinTime || '请选择上班时间' }}
          </view>
        </picker>
      </view>

      <!-- 下班打卡时间 -->
      <view class="form-item">
        <text class="form-label">下班打卡时间</text>
        <picker
          class="form-picker"
          mode="time"
          :value="formData.checkoutTime"
          @change="onCheckoutTimeChange"
        >
          <view class="picker-view">
            {{ formData.checkoutTime || '请选择下班时间' }}
          </view>
        </picker>
      </view>

      <!-- 工作时长 -->
      <view class="form-item">
        <text class="form-label">工作时长(小时)</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入工作时长"
          v-model="formData.workHours"
        />
      </view>

      <!-- 考勤状态 -->
      <view class="form-item">
        <text class="form-label">考勤状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="attendanceStatusOptions"
          range-key="label"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? attendanceStatusOptions[statusIndex].label : '请选择状态' }}
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
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AioveuAttendanceAPI, {
  AioveuAttendanceForm
} from "@/packageC/api/aioveuAttendance/aioveu-attendance";
import AioveuEmployeeAPI,{  EmployeeOptionVO } from "@/packageC/api/aioveuEmployee/aioveu-employee";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增考勤');
const attendanceId = ref<number | undefined>(undefined);
const loading = ref(false);

// 简化表单数据结构
const formData = reactive({
  employeeName: '',
  date: '',
  checkinTime: '',
  checkoutTime: '',
  workHours: undefined as number | undefined,
  status: undefined as number | undefined
});

const employeeOptions = ref<EmployeeOptionVO[]>([]);
const attendanceStatusOptions = ref<DictItemOption[]>([]);

const employeeIndex = ref(-1);
const statusIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  if (options.attendanceId) {
    attendanceId.value = Number(options.attendanceId);
    formTitle.value = '编辑考勤';
    loadAttendanceData();
  } else {
    formTitle.value = '新增考勤';
    // 设置默认日期为今天
    const today = new Date();
    console.log(today);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    formData.date = `${year}-${month}-${day}`;

    // 设置默认上下班时间
    formData.checkinTime = '09:00';
    formData.checkoutTime = '18:00';
  }

  loadEmployees();
  loadAttendanceStatus();
});

// 加载考勤数据
const loadAttendanceData = () => {
  if (!attendanceId.value) return;

  loading.value = true;
  AioveuAttendanceAPI.getFormData(attendanceId.value)
    .then((data) => {
      // 直接赋值
      formData.employeeName = data.employeeName || '';
      formData.date = data.date || '';

      // 从完整时间中提取时间部分
      if (data.checkinTime) {
        const timePart = data.checkinTime.split('T')[1]?.substring(0, 5);
        formData.checkinTime = timePart || '09:00';
      }

      if (data.checkoutTime) {
        const timePart = data.checkoutTime.split('T')[1]?.substring(0, 5);
        formData.checkoutTime = timePart || '18:00';
      }

      formData.workHours = data.workHours ? Number(data.workHours) : undefined;
      formData.status = data.status;

      // 设置员工索引
      if (formData.employeeName) {
        const index = employeeOptions.value.findIndex(
          emp => emp.employeeName === formData.employeeName
        );
        employeeIndex.value = index;
      }

      // 设置状态索引
      if (formData.status !== undefined) {
        const index = attendanceStatusOptions.value.findIndex(
          item => item.value === formData.status?.toString()
        );
        statusIndex.value = index;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 加载员工选项
const loadEmployees = () => {
  AioveuEmployeeAPI.getAllEmployeeOptions()
    .then(response => {
      if (Array.isArray(response)) {
        employeeOptions.value = response.map(emp => ({
          employeeId: Number(emp.employeeId),
          employeeName: emp.employeeName
        }));
      }
    });
};

// 加载考勤状态选项
const loadAttendanceStatus = () => {
  DictAPI.getDictItems('attendance_status')
    .then(response => {
      attendanceStatusOptions.value = response;
    });
};

// 员工选择变化
const onEmployeeChange = (e: any) => {
  const index = e.detail.value;
  employeeIndex.value = index;
  if (employeeOptions.value[index]) {
    formData.employeeName = employeeOptions.value[index].employeeName;
  }
};

// 日期选择变化
const onDateChange = (e: any) => {
  formData.date = e.detail.value;
};

// 上班时间选择变化
const onCheckinTimeChange = (e: any) => {
  formData.checkinTime = e.detail.value;
};

// 下班时间选择变化
const onCheckoutTimeChange = (e: any) => {
  formData.checkoutTime = e.detail.value;
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  if (attendanceStatusOptions.value[index]) {
    formData.status = Number(attendanceStatusOptions.value[index].value);
  }
};

// 提交表单
const handleSubmit = () => {
  if (!validateForm()) return;

  uni.showLoading({ title: '提交中...' });

  // 准备提交给后端的数据
  const submitData = {
    employeeName: formData.employeeName,
    date: formData.date,
    checkinTime: formData.checkinTime ? `${formData.date} ${formData.checkinTime}:00` : undefined,
    checkoutTime: formData.checkoutTime ? `${formData.date} ${formData.checkoutTime}:00` : undefined,
    workHours: formData.workHours,
    status: formData.status
  };

  if (attendanceId.value) {
    // 更新
    AioveuAttendanceAPI.update(attendanceId.value, submitData)
      .then(() => {
        uni.showToast({
          title: "修改成功",
          icon: "success"
        });
        uni.navigateBack();
      })
      .finally(() => uni.hideLoading());
  } else {
    // 新增
    AioveuAttendanceAPI.add(submitData)
      .then(() => {
        uni.showToast({
          title: "新增成功",
          icon: "success"
        });
        uni.navigateBack();
      })
      .finally(() => uni.hideLoading());
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

  if (!formData.date) {
    uni.showToast({
      title: "请选择日期",
      icon: "none"
    });
    return false;
  }

  if (formData.workHours === undefined || formData.workHours === null) {
    uni.showToast({
      title: "请输入工作时长",
      icon: "none"
    });
    return false;
  }

  if (formData.status === undefined) {
    uni.showToast({
      title: "请选择考勤状态",
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
  width: 100%;
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 30rpx;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

.form-footer {
  padding: 24rpx 30rpx;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  gap: 24rpx;
  margin-top: 24rpx;
  border-top: 1rpx solid #eaeaea;

  .form-btn {
    flex: 1;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 30rpx;
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
