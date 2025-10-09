<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 部门名称 -->
      <view class="form-item">
        <text class="form-label">部门名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入部门名称"
          v-model="formData.deptName"
        />
      </view>

      <!-- 上级部门 -->
      <view class="form-item">
        <text class="form-label">上级部门</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="parentDeptOptions"
          range-key="deptName"
          :value="parentDeptIndex"
          @change="onParentDeptChange"
        >
          <view class="picker-view">
            {{ parentDeptIndex >= 0 ? parentDeptOptions[parentDeptIndex].deptName : '请选择上级部门' }}
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
import AioveuDepartmentAPI, {
  AioveuDepartmentForm ,DeptOptionVO
} from "@/packageC/api/aioveuDepartment/aioveu-department";

const formTitle = ref('新增部门');
const deptId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingDeptId = ref<number | undefined>(undefined);

const formData = reactive<AioveuDepartmentForm>({
  deptName: '',
  parentDeptId: undefined,
  parentDeptName: ''
});

const parentDeptOptions = ref<DeptOptionVO[]>([]);
const parentDeptIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadParentDeptOptions();

  if (options.id) {
    deptId.value = Number(options.id);
    formTitle.value = '编辑部门';
    loadDepartmentData();
  } else {
    formTitle.value = '新增部门';
  }

  // 存储编辑ID
  editingDeptId.value = deptId.value;


});

// 加载部门数据
const loadDepartmentData = async () => {
  if (!deptId.value) return;

  try {
    loading.value = true;
    const data = await AioveuDepartmentAPI.getFormData(deptId.value);
    // 推荐 - 一次性设置所有数据
    Object.assign(formData, data);

    // 设置选项索引
    if (formData.parentDeptName) {
      const deptIdx = parentDeptOptions.value.findIndex(dept => dept.deptName === formData.parentDeptName);
      parentDeptIndex.value = deptIdx;
    }
  } catch (error) {
    console.error('加载部门数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载上级部门选项
const loadParentDeptOptions = async () => {
  try {
    const response = await AioveuDepartmentAPI.getAllDepartmentOptions();
    if (Array.isArray(response)) {
      parentDeptOptions.value = response.map(dept => ({
        deptId: Number(dept.deptId),
        deptName: dept.deptName
      }));
    }
  } catch (error) {
    console.error('加载上级部门列表失败:', error);
    uni.showToast({
      title: '加载上级部门列表失败',
      icon: 'none'
    });
  }
};

// 上级部门选择变化
const onParentDeptChange = (e: any) => {
  const index = e.detail.value;
  parentDeptIndex.value = index;
  if (parentDeptOptions.value[index]) {
    formData.parentDeptName = parentDeptOptions.value[index].deptName;
    formData.parentDeptId = parentDeptOptions.value[index].deptId;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingDeptId.value;

    if (id) {
      // 更新部门
      await AioveuDepartmentAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增部门
      await AioveuDepartmentAPI.add(formData);
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
  if (!formData.deptName) {
    uni.showToast({
      title: "请输入部门名称",
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
