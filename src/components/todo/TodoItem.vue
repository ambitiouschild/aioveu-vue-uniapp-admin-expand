<template>
  <view :class="['todo-item', { completed: todo.completed }]" @tap="toggleCompleted">
    <view class="status-icon">
      <wd-icon v-if="todo.completed" name="check" color="#67C23A" size="20" />
      <view v-else class="uncompleted-circle"></view>
    </view>
    <view class="todo-content">
      <view class="todo-title">{{ todo.title }}</view>
      <view v-if="todo.description" class="todo-description">
        {{ todo.description }}
      </view>
      <view v-if="todo.deadline" class="todo-deadline">
        <wd-icon name="time" size="14" color="#999999" style="margin-right: 4rpx" />
        {{ formatDate(todo.deadline) }}
      </view>
    </view>
    <view class="todo-actions">
      <wd-icon
        name="delete-filling"
        color="#F56C6C"
        size="18"
        @tap.stop="$emit('delete', todo.id)"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import { Todo } from "@/types/todo";

const props = defineProps({
  todo: {
    type: Object as () => Todo,
    required: true,
  },
});

const emit = defineEmits(["update", "delete"]);

// 切换完成状态
const toggleCompleted = () => {
  emit("update", {
    ...props.todo,
    completed: !props.todo.completed,
  });
};

// 格式化日期
const formatDate = (date: string) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
</script>

<style lang="scss" scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  padding: 24rpx;
  margin-bottom: 16rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);

  &.completed {
    opacity: 0.7;

    .todo-title {
      color: #909399;
      text-decoration: line-through;
    }
  }

  .status-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40rpx;
    height: 40rpx;
    margin-right: 20rpx;

    .uncompleted-circle {
      width: 36rpx;
      height: 36rpx;
      border: 2rpx solid #dcdfe6;
      border-radius: 50%;
    }
  }

  .todo-content {
    flex: 1;

    .todo-title {
      margin-bottom: 8rpx;
      font-size: 30rpx;
      font-weight: 500;
      color: #303133;
    }

    .todo-description {
      margin-bottom: 8rpx;
      font-size: 26rpx;
      color: #606266;
    }

    .todo-deadline {
      display: flex;
      align-items: center;
      font-size: 24rpx;
      color: #909399;
    }
  }

  .todo-actions {
    padding: 6rpx;
  }
}
</style>
