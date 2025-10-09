<template>
  <view class="todo-list">
    <wd-empty v-if="todos.length === 0" description="暂无待办事项" />
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo="todo"
      @update="handleUpdate"
      @delete="handleDelete"
    />
  </view>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits } from "vue";
import { Todo } from "@/types/todo";
import TodoItem from "@/components/todo/TodoItem.vue";

defineProps({
  todos: {
    type: Array as () => Todo[],
    default: () => [],
  },
});

const emit = defineEmits(["update", "delete"]);

// 处理更新待办事项
const handleUpdate = (todo: Todo) => {
  emit("update", todo);
};

// 处理删除待办事项
const handleDelete = (id: string) => {
  emit("delete", id);
};
</script>

<style lang="scss" scoped>
.todo-list {
  padding: 20rpx 0;
}
</style>
