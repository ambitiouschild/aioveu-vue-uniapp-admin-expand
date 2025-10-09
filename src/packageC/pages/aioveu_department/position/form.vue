<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <scroll-view class="form-body" scroll-y>
      <!-- 岗位名称 -->
      <view class="form-item">
        <text class="form-label">岗位名称</text>
        <input
          type="text"
          class="form-input"
          placeholder="请输入岗位名称"
          v-model="formData.positionName"
        />
      </view>

      <!-- 所属部门 -->
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
            {{ deptIndex >= 0 ? deptOptions[deptIndex].deptName : '请选择所属部门' }}
          </view>
        </picker>
      </view>

      <!-- 职级 -->
      <view class="form-item">
        <text class="form-label">职级</text>
        <picker
          class="form-picker"
          mode="selector"
          :range="positionLevelOptions"
          range-key="label"
          :value="levelIndex"
          @change="onLevelChange"
        >
          <view class="picker-view">
            {{ levelIndex >= 0 ? positionLevelOptions[levelIndex].label : '请选择职级' }}
          </view>
        </picker>
      </view>

      <!-- 岗位描述 -->
      <view class="form-item">
        <text class="form-label">岗位描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入岗位描述"
          v-model="formData.description"
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
import AioveuPositionAPI, {
  AioveuPositionForm
} from "@/packageC/api/aioveuPosition/aioveu-position";
import AioveuDepartmentAPI, { DeptOptionVO } from "@/packageC/api/aioveuDepartment/aioveu-department";
import DictAPI, { DictItemOption } from '@/api/system/dict';

const formTitle = ref('新增岗位');
const positionId = ref<number | undefined>(undefined);
const loading = ref(false);

// 在组件中添加一个变量存储当前编辑的ID
const editingPositionId = ref<number | undefined>(undefined);

const formData = reactive<AioveuPositionForm>({});

const deptOptions = ref<DeptOptionVO[]>([]);
const positionLevelOptions = ref<DictItemOption[]>([]);

const deptIndex = ref(-1);
const levelIndex = ref(-1);

onLoad((options: any) => {
  console.log('页面参数:', options);

  // 加载选项数据
  loadDeptOptions();
  loadDictOptions();


  if (options.id) {
    positionId.value = Number(options.id);
    formTitle.value = '编辑岗位';
    loadPositionData();
  } else {
    formTitle.value = '新增岗位';
  }

  // 存储编辑ID
  editingPositionId.value = positionId.value;


});

// 加载岗位数据
const loadPositionData = async () => {
  if (!positionId.value) return;

  try {
    loading.value = true;
    const data = await AioveuPositionAPI.getFormData(positionId.value);
    Object.assign(formData, data);

    // 设置选项索引
    if (formData.deptName) {
      const deptIdx = deptOptions.value.findIndex(dept => dept.deptName === formData.deptName);
      deptIndex.value = deptIdx;
    }

    if (formData.positionLevel !== undefined) {
      const levelIdx = positionLevelOptions.value.findIndex(opt => Number(opt.value) === formData.positionLevel);
      levelIndex.value = levelIdx;
    }
  } catch (error) {
    console.error('加载岗位数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

// 加载部门选项
const loadDeptOptions = async () => {
  try {
    const response = await AioveuDepartmentAPI.getAllDepartmentOptions();
    if (Array.isArray(response)) {
      deptOptions.value = response.map(dept => ({
        deptId: Number(dept.deptId),
        deptName: dept.deptName
      }));
    }
  } catch (error) {
    console.error('加载部门列表失败:', error);
    uni.showToast({
      title: '加载部门列表失败',
      icon: 'none'
    });
  }
};

// 加载字典选项
const loadDictOptions = async () => {
  try {
    const response = await DictAPI.getDictItems('position_level');
    positionLevelOptions.value = response || [];
  } catch (error) {
    console.error('加载字典选项失败:', error);
    uni.showToast({
      title: '加载选项失败',
      icon: 'none'
    });
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

// 职级选择变化
const onLevelChange = (e: any) => {
  const index = e.detail.value;
  levelIndex.value = index;
  if (positionLevelOptions.value[index]) {
    formData.positionLevel = Number(positionLevelOptions.value[index].value);
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    uni.showLoading({ title: '提交中...' });

    // 使用存储的ID
    const id = editingPositionId.value;

    if (id) {
      // 更新岗位
      await AioveuPositionAPI.update(id, formData);
      uni.showToast({
        title: "修改成功",
        icon: "success"
      });
    } else {
      // 新增岗位
      await AioveuPositionAPI.add(formData);
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
  if (!formData.positionName) {
    uni.showToast({
      title: "请输入岗位名称",
      icon: "none"
    });
    return false;
  }

  if (!formData.deptName) {
    uni.showToast({
      title: "请选择所属部门",
      icon: "none"
    });
    return false;
  }

  if (formData.positionLevel === undefined) {
    uni.showToast({
      title: "请选择职级",
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
