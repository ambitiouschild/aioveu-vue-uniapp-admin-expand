<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <view class="form-item">
        <text class="form-label">员工编号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入员工编号"
          v-model="formData.empCode"
        />
      </view>

      <view class="form-item">
        <text class="form-label">姓名</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入姓名"
          v-model="formData.name"
        />
      </view>

      <view class="form-item">
        <text class="form-label">性别</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="genderOptions"
          range-key="label"
          :value="genderIndex"
          @change="onGenderChange"
        >
          <view class="picker-view">
            {{ genderIndex >= 0 ? genderOptions[genderIndex].label: '请选择性别' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">出生日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.birthDate"
          @change="onBirthDateChange"
        >
          <view class="picker-view">
            {{ formData.birthDate || '请选择出生日期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">身份证号</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入身份证号"
          v-model="formData.idCard"
        />
      </view>

      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入手机号码"
          v-model="formData.phone"
        />
      </view>

      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入邮箱"
          v-model="formData.email"
        />
      </view>

      <view class="form-item">
        <text class="form-label">所属部门</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="deptOptions"
          range-key="deptName"
          :value="deptIndex"
          @change="onDeptChange"
        >
          <view class="picker-view">
            {{ deptIndex >= 0 ? deptOptions[deptIndex].deptName : '请选择部门' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">所属岗位</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="positionOptions"
          range-key="positionName"
          :value="positionIndex"
          @change="onPositionChange"
        >
          <view class="picker-view">
            {{ positionIndex >= 0 ? positionOptions[positionIndex].positionName : '请选择岗位' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">入职日期</text>
        <picker
          class="form-picker"
          mode="date"
          :value="formData.hireDate"
          @change="onHireDateChange"
        >
          <view class="picker-view">
            {{ formData.hireDate || '请选择入职日期' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">基本薪资</text>
        <input
          type="number"
          class="form-input"
          placeholder="请输入基本薪资"
          v-model="formData.salary"
        />
      </view>

      <view class="form-item">
        <text class="form-label">状态</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="statusOptions"
          :value="statusIndex"
          @change="onStatusChange"
        >
          <view class="picker-view">
            {{ statusIndex >= 0 ? statusOptions[statusIndex] : '请选择状态' }}
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
import   AioveuEmployeeAPI,{
  AioveuEmployeeForm,
} from "@/packageC/api/aioveuEmployee/aioveu-employee";
import AioveuDepartmentAPI, { DeptOptionVO } from "@/packageC/api/aioveuDepartment/aioveu-department";
import AioveuPositionAPI, { PositionOptionVO } from "@/packageC/api/aioveuPosition/aioveu-position";
import DictAPI, { DictItemOption } from '@/api/system/dict';
const formTitle = ref('新增员工');
const employeeId = ref<number | undefined>(undefined);
const loading = ref(false);

const formData = reactive<AioveuEmployeeForm>({
});

const genderIndex = ref(-1);
const deptOptions = ref<DeptOptionVO[]>([]);
const deptIndex = ref(-1);
const positionOptions = ref<PositionOptionVO[]>([]);
const positionIndex = ref(-1);
const statusOptions = ['离职', '在职', '休假', '实习'];
const statusIndex = ref(-1);
const genderOptions = ref<DictItemOption[]>([]);
// 在表单页中修改onLoad函数
onLoad( (options: any) => {
  console.log('页面参数:', options);

  // 加载其他数据
   loadDepartments();
   loadPositions();
   loadGenderOptions();

  // 检查是否有employeeId参数
  if (options?.employeeId) {
    try {
      // 解码参数
      const decodedId = decodeURIComponent(options.employeeId);

      // 验证参数类型
      if (typeof decodedId !== 'string' || isNaN(Number(decodedId))) {
        throw new Error(`无效的员工ID: ${decodedId}`);
      }

      const id = Number(decodedId);
      employeeId.value = id;
      formTitle.value = '编辑员工';
      loadEmployeeData();
    } catch (error) {
      console.error('参数解析错误:', error);
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      });
    }
  } else {
    formTitle.value = '新增员工';
  }


});

// 加载员工数据
const loadEmployeeData = () => {
  if (!employeeId.value) return;

  loading.value = true;
  AioveuEmployeeAPI.getFormData(employeeId.value)
    .then(data => {
      Object.assign(formData, data);

      // 设置选择器索引
      if (formData.gender !== undefined) {
        // 根据字典值查找对应索引
        const genderValue = String(formData.gender);
        const index = genderOptions.value.findIndex(
          item => item.value === genderValue
        );
        if (index !== -1) {
          genderIndex.value = index;
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 加载部门选项
const loadDepartments = () => {
  AioveuDepartmentAPI.getAllDepartmentOptions()
    .then(response => {
      if (Array.isArray(response)) {
        deptOptions.value = response.map(dept => ({
          deptId: Number(dept.deptId),
          deptName: dept.deptName
        }));
      }
    });
};

// 加载岗位选项
const loadPositions = () => {
  AioveuPositionAPI.getAllPositionOptions()
    .then(response => {
      if (Array.isArray(response)) {
        positionOptions.value = response.map(position => ({
          positionId: Number(position.positionId),
          positionName: position.positionName
        }));
      }
    });
};

// 性别选择变化
const onGenderChange = (e: any) => {
  const index = e.detail.value;
  genderIndex.value = index;
  if (genderOptions.value[index]) {
    formData.gender = Number(genderOptions.value[index].value);
  }
};

// 部门选择变化
const onDeptChange = (e: any) => {
  const index = e.detail.value;
  deptIndex.value = index;
  if (deptOptions.value[index]) {
    formData.deptName = deptOptions.value[index].deptName;
  }
};

// 岗位选择变化
const onPositionChange = (e: any) => {
  const index = e.detail.value;
  positionIndex.value = index;
  if (positionOptions.value[index]) {
    formData.positionName = positionOptions.value[index].positionName;
  }
};

// 状态选择变化
const onStatusChange = (e: any) => {
  const index = e.detail.value;
  statusIndex.value = index;
  formData.status = index;
};

// 出生日期选择变化
const onBirthDateChange = (e: any) => {
  formData.birthDate = e.detail.value;
};

// 入职日期选择变化
const onHireDateChange = (e: any) => {
  formData.hireDate = e.detail.value;
  console.log('入职日期:', formData.hireDate);
};

// 提交表单
const handleSubmit = () => {
  if (!validateForm()) return;

  uni.showLoading({ title: '提交中...' });

  if (employeeId.value) {
    // 更新
    AioveuEmployeeAPI.update(employeeId.value, formData)
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
    AioveuEmployeeAPI.add(formData)
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
  if (!formData.empCode) {
    uni.showToast({
      title: "请输入员工编号",
      icon: "none"
    });
    return false;
  }

  if (!formData.name) {
    uni.showToast({
      title: "请输入姓名",
      icon: "none"
    });
    return false;
  }

  if (!formData.phone) {
    uni.showToast({
      title: "请输入手机号码",
      icon: "none"
    });
    return false;
  }

  return true;
};

// 加载性别状态选项
const loadGenderOptions = () => {
  DictAPI.getDictItems('gender')
    .then(response => {
      genderOptions.value = response;
      console.log('性别字典数据:', response); // 打印查看返回的数据

      // 新增模式下默认选中第一项
      if (!employeeId.value && response.length > 0) {
        genderIndex.value = 0;
        formData.gender = Number(response[0].value);
      }

    })
    .catch(error => {
      console.error('加载性别状态选项失败:', error);
    });
};


// 监听 genderOptions 和 formData.gender
//需要确保在字典数据返回后再设置编辑模式的索引。可以使用 Promise.all或 watch来确保顺序。
watch([() => genderOptions.value, () => formData.gender], ([newOptions, newGender]) => {
  if (newOptions.length > 0 && newGender !== undefined) {
    // 根据 formData.gender 的值在 genderOptions 中查找索引
    const index = newOptions.findIndex(item => Number(item.value) === newGender);
    if (index !== -1) {
      genderIndex.value = index;
    }
  }
}, { immediate: true });


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
    font-weight: 700;
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
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  margin-top: 24rpx;

  .form-btn {
    flex: 1;
    margin: 0 16rpx;
    padding: 24rpx 0;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 500;
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
