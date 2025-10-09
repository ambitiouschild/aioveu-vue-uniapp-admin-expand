<template>
  <view class="todo-container">
    <view class="page-header">
      <text class="page-title">待办事项</text>
      <button class="add-btn" @click="goToFormPage">新建待办</button>
    </view>

    <view class="filter-tabs">
      <view class="tabs">
        <text
          :class="['tab', activeTab === 'all' ? 'active' : '']"
          @click="activeTab = 'all'"
        >全部</text>
        <text
          :class="['tab', activeTab === 'active' ? 'active' : '']"
          @click="activeTab = 'active'"
        >未完成</text>
        <text
          :class="['tab', activeTab === 'completed' ? 'active' : '']"
          @click="activeTab = 'completed'"
        >已完成</text>
      </view>
    </view>

    <view class="todo-list">
      <view
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item"
        @click="toggleTodoStatus(todo)"
      >
        <!-- 状态指示器 -->
        <view class="status-indicator" :class="todo.completed ? 'completed' : 'active'">
          <text v-if="todo.completed">✓</text>
        </view>

        <!-- 待办内容 -->
        <view class="todo-content">
          <view class="todo-header">
            <text class="todo-title">{{ todo.title }}</text>
          </view>
          <text class="todo-description">{{ todo.description }}</text>
          <view class="todo-footer">
            <text class="todo-deadline">截止: {{ formatDate(todo.deadline) }}</text>
            <text class="todo-priority">优先级: {{ getPriorityLabel(todo.priority) }}</text>
          </view>
        </view>

        <!-- 编辑按钮 -->
        <button class="edit-btn" @click.stop="goToFormPage(todo.id)">
          <text>编辑</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';

export default {
  setup() {
    const activeTab = ref('all');
    const todos = ref([]);

    // 从本地存储加载待办事项
    const loadTodos = () => {
      const savedTodos = uni.getStorageSync('todos');
      if (savedTodos) {
        todos.value = JSON.parse(savedTodos);
      }
    };

    // 页面显示时加载数据
    onShow(() => {
      loadTodos();
    });

    // 根据标签筛选待办
    const filteredTodos = computed(() => {
      switch (activeTab.value) {
        case 'active':
          return todos.value.filter(todo => !todo.completed);
        case 'completed':
          return todos.value.filter(todo => todo.completed);
        default:
          return todos.value;
      }
    });

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '未设置';
      const date = new Date(dateString);
      return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    };

    // 补零函数
    const padZero = (num) => {
      return num.toString().padStart(2, '0');
    };

    // 获取优先级标签
    const getPriorityLabel = (priority) => {
      const labels = {
        low: '低',
        medium: '中',
        high: '高'
      };
      return labels[priority] || '未知';
    };

    // 跳转到表单页面
    const goToFormPage = (id) => {
      if (id) {
        uni.navigateTo({
          url: `/pages/todo/form?id=${id}`
        });
      } else {
        uni.navigateTo({
          url: '/pages/todo/form'
        });
      }
    };

    // 切换待办状态
    const toggleTodoStatus = (todo) => {
      // 更新状态
      todo.completed = !todo.completed;
      todo.updatedAt = new Date().toISOString();

      // 更新本地存储
      const updatedTodos = todos.value.map(t =>
        t.id === todo.id ? todo : t
      );
      uni.setStorageSync('todos', JSON.stringify(updatedTodos));

      // 刷新列表
      loadTodos();

      // 显示提示
      uni.showToast({
        title: todo.completed ? '标记为已完成' : '标记为未完成',
        icon: 'none'
      });
    };

    return {
      activeTab,
      filteredTodos,
      formatDate,
      getPriorityLabel,
      goToFormPage,
      toggleTodoStatus
    };
  }
};
</script>

<style>
.todo-container {
  padding: 20rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

.add-btn {
  background-color: #007aff;
  color: white;
  padding: 10rpx 20rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.filter-tabs {
  margin-bottom: 20rpx;
}

.tabs {
  display: flex;
  background-color: #f5f5f5;
  border-radius: 10rpx;
  overflow: hidden;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  font-size: 28rpx;
}

.tab.active {
  background-color: #007aff;
  color: white;
}

.todo-list {
  margin-top: 20rpx;
}

.todo-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

/* 状态指示器 */
.status-indicator {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.status-indicator.active {
  border: 2rpx solid #ff3b30;
}

.status-indicator.completed {
  background-color: #4cd964;
  color: white;
}

.todo-content {
  flex: 1;
}

.todo-header {
  margin-bottom: 10rpx;
}

.todo-title {
  font-size: 32rpx;
  font-weight: bold;
}

.todo-description {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #999;
}

/* 编辑按钮 */
.edit-btn {
  background-color: #f5f5f5;
  color: #333;
  padding: 5rpx 15rpx;
  border-radius: 10rpx;
  font-size: 24rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
}
</style>
