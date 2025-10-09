// 获取所有待办
export const getTodos = () => {
  const todos = uni.getStorageSync('todos');
  return todos ? JSON.parse(todos) : [];
};

// 根据ID获取待办
export const getTodoById = (id) => {
  const todos = getTodos();
  return todos.find(todo => todo.id === id);
};

// 保存待办
export const saveTodo = (todo) => {
  let todos = getTodos();

  if (todo.id) {
    // 更新
    const index = todos.findIndex(t => t.id === todo.id);
    if (index !== -1) {
      todos[index] = todo;
    }
  } else {
    // 新增
    todo.id = Date.now().toString();
    todo.createdAt = new Date().toISOString();
    todos.unshift(todo);
  }

  uni.setStorageSync('todos', JSON.stringify(todos));
  return todo;
};
