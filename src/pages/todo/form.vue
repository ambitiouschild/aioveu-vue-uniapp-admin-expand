<template>
  <view class="form-container">
    <view class="form-header">
      <text class="form-title">{{ formTitle }}</text>
    </view>

    <view class="form-body">
      <!-- 标题 -->
      <view class="form-item">
        <text class="form-label">标题<text class="required">*</text></text>
        <input
          class="form-input"
          placeholder="请输入待办标题"
          v-model="formData.title"
          placeholder-class="placeholder"
        />
        <text v-if="showTitleError" class="error-text">请填写标题</text>
      </view>

      <!-- 描述 -->
      <view class="form-item">
        <text class="form-label">描述</text>
        <textarea
          class="form-textarea"
          placeholder="请输入详细描述"
          v-model="formData.description"
          placeholder-class="placeholder"
        />
      </view>

      <!-- 截止时间 -->
      <view class="form-item">
        <text class="form-label">截止时间</text>
        <view class="datetime-picker-group">
          <picker
            mode="date"
            :value="dateValue"
            @change="handleDateChange"
          >
            <view class="picker">
              <text :class="dateValue ? 'selected' : 'placeholder'">
                {{ dateValue || '选择日期' }}
              </text>
            </view>
          </picker>
          <picker
            mode="time"
            :value="timeValue"
            @change="handleTimeChange"
          >
            <view class="picker">
              <text :class="timeValue ? 'selected' : 'placeholder'">
                {{ timeValue || '选择时间' }}
              </text>
            </view>
          </picker>
        </view>
        <text v-if="formData.deadline" class="selected-datetime">
          已选择: {{ formatDateTime(formData.deadline) }}
        </text>
      </view>

      <!-- 优先级 -->
      <view class="form-item">
        <text class="form-label">优先级</text>
        <view class="priority-group">
          <view
            v-for="option in priorityOptions"
            :key="option.value"
            class="priority-option"
            :class="{
              'active': formData.priority === option.value,
              [option.value]: true
            }"
            @click="formData.priority = option.value"
          >
            <text>{{ option.label }}</text>
          </view>
        </view>
      </view>

      <!-- 状态 -->
      <view class="form-item">
        <text class="form-label">状态</text>
        <view class="status-toggle">
          <text :class="['status-label', !formData.completed ? 'active' : 'inactive']">未完成</text>
          <switch
            :checked="formData.completed"
            @change="handleStatusChange"
            class="status-switch"
          />
          <text :class="['status-label', formData.completed ? 'active' : 'inactive']">已完成</text>
        </view>
      </view>
    </view>

    <view class="form-footer">
      <button class="form-btn cancel" @click="goBack">取消</button>
      <button class="form-btn save" @click="saveTodo">保存</button>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const formData = ref({
      id: '',
      title: '',
      description: '',
      deadline: '',
      priority: 'medium',
      completed: false
    });

    const dateValue = ref('');
    const timeValue = ref('');
    const showTitleError = ref(false);

    const formTitle = computed(() => {
      return formData.value.id ? '编辑待办' : '新增待办';
    });

    const priorityOptions = ref([
      { value: 'low', label: '低' },
      { value: 'medium', label: '中' },
      { value: 'high', label: '高' }
    ]);

    // 页面加载时获取参数
    onMounted(() => {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;

      if (options.id) {
        loadTodoData(options.id);
      }
    });

    // 加载待办数据
    const loadTodoData = (id) => {
      const todos = uni.getStorageSync('todos');
      if (todos) {
        const todoList = JSON.parse(todos);
        const todo = todoList.find(t => t.id === id);
        if (todo) {
          formData.value = { ...todo };
          if (todo.deadline) {
            const date = new Date(todo.deadline);
            dateValue.value = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}`;
            timeValue.value = `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
          }
        }
      }
    };

    // 日期改变处理
    const handleDateChange = (e) => {
      dateValue.value = e.detail.value;
      updateDeadline();
    };

    // 时间改变处理
    const handleTimeChange = (e) => {
      timeValue.value = e.detail.value;
      updateDeadline();
    };

    // 更新截止时间
    const updateDeadline = () => {
      if (dateValue.value) {
        // 如果有日期，即使没有时间也更新
        const time = timeValue.value || '00:00';
        formData.value.deadline = `${dateValue.value} ${time}:00`;
      }
    };

    // 状态改变处理
    const handleStatusChange = (e) => {
      formData.value.completed = e.detail.value;
    };

    // 格式化日期时间
    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    };

    // 补零函数
    const padZero = (num) => {
      return num.toString().padStart(2, '0');
    };

    // 保存待办
    const saveTodo = () => {
      // 验证标题
      if (!formData.value.title) {
        showTitleError.value = true;
        uni.showToast({
          title: '请填写标题',
          icon: 'none',
          position: 'top'
        });
        return;
      }
      showTitleError.value = false;

      let todos = uni.getStorageSync('todos');
      let todoList = todos ? JSON.parse(todos) : [];

      if (formData.value.id) {
        // 更新
        const index = todoList.findIndex(t => t.id === formData.value.id);
        if (index !== -1) {
          todoList[index] = formData.value;
        }
      } else {
        // 新增
        formData.value.id = Date.now().toString();
        formData.value.createdAt = new Date().toISOString();
        todoList.unshift(formData.value);
      }

      uni.setStorageSync('todos', JSON.stringify(todoList));
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    };

    // 返回上一页
    const goBack = () => {
      uni.navigateBack();
    };

    return {
      formData,
      formTitle,
      dateValue,
      timeValue,
      showTitleError,
      priorityOptions,
      handleDateChange,
      handleTimeChange,
      handleStatusChange,
      formatDateTime,
      saveTodo,
      goBack
    };
  }
};
</script>

<style lang="scss" scoped>
.form-container {
  padding: 30rpx;
  background-color: #f8f9fa;
  min-height: 100vh;
  box-sizing: border-box;
}

.form-header {
  padding: 30rpx 0;
  text-align: center;
  margin-bottom: 20rpx;
}

.form-title {
  font-size: 38rpx;
  font-weight: 600;
  color: #333;
}

.form-body {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
}

.form-label {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #555;
  margin-bottom: 20rpx;

  .required {
    color: #f56c6c;
    margin-left: 5rpx;
  }
}

/* 修复输入框显示问题 */
.form-input {
  border: none;
  border-bottom: 2rpx solid #e0e0e0;
  padding: 30rpx 0; /* 增加垂直内边距 */
  font-size: 36rpx; /* 加大字体 */
  font-weight: 500;
  width: 100%;
  background-color: transparent;
  box-sizing: border-box;
  transition: border-color 0.3s;
  line-height: 1.5; /* 确保行高足够 */
  height: auto; /* 确保高度自适应 */
  min-height: 80rpx; /* 设置最小高度 */

  &:focus {
    border-color: #409EFF;
  }
}

.form-textarea {
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 25rpx;
  font-size: 30rpx;
  width: 100%;
  background-color: #ffffff;
  box-sizing: border-box;
  min-height: 200rpx;
  transition: border-color 0.3s;

  &:focus {
    border-color: #409EFF;
  }
}

.placeholder {
  color: #a0a0a0;
}

.error-text {
  display: block;
  color: #f56c6c;
  font-size: 26rpx;
  margin-top: 10rpx;
}

.datetime-picker-group {
  display: flex;
  gap: 20rpx;
}

.picker {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 30rpx;
  background: #ffffff;
  transition: all 0.3s;

  .selected {
    color: #333;
    font-weight: 500;
  }

  .placeholder {
    color: #a0a0a0;
  }
}

.selected-datetime {
  display: block;
  font-size: 28rpx;
  color: #409EFF;
  margin-top: 15rpx;
  font-weight: 500;
}

.priority-group {
  display: flex;
  gap: 20rpx;
}

.priority-option {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  font-size: 30rpx;
  background-color: #f8f9fa;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s;

  &.active {
    background-color: #409EFF;
    color: white;
    border-color: #409EFF;
    font-weight: 500;
  }

  &.low.active {
    background-color: #67c23a;
    border-color: #67c23a;
  }

  &.medium.active {
    background-color: #e6a23c;
    border-color: #e6a23c;
  }

  &.high.active {
    background-color: #f56c6c;
    border-color: #f56c6c;
  }
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.status-label {
  font-size: 30rpx;
  font-weight: 500;

  &.active {
    color: #409EFF;
  }

  &.inactive {
    color: #909399;
  }
}

.form-footer {
  display: flex;
  gap: 30rpx;
}

.form-btn {
  flex: 1;
  padding: 25rpx 0;
  border-radius: 50rpx;
  font-size: 32rpx;
  text-align: center;
  border: none;
  transition: all 0.3s;

  &.cancel {
    background-color: #f0f0f0;
    color: #606266;
  }

  &.save {
    background-color: #409EFF;
    color: white;
  }
}
</style>
