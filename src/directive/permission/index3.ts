import type { Directive, DirectiveBinding } from "vue";
import { useUserStore } from "@/store";

/**
 * 修复后的权限指令实现
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  }
};

/**
 * 权限检查核心逻辑
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const requiredPerms = binding.value;

  // 1. 检查指令值是否有效
  if (!requiredPerms) {
    console.warn("v-has-perm 指令缺少权限参数");
    return;
  }

  // 2. 验证权限参数格式
  if (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms)) {
    console.error(
      "v-has-perm 需要提供字符串或数组格式的权限标识！" +
      "例如：v-has-perm=\"'sys:user:add'\" 或 " +
      "v-has-perm=\"['sys:user:add', 'sys:user:edit']\""
    );
    return;
  }

  const userStore = useUserStore();

  // 3. 检查用户信息是否加载
  if (!userStore.userInfo) {
    console.warn("用户信息尚未加载，无法检查权限");
    return;
  }

  const { roles = [], perms = [] } = userStore.userInfo;

  // 4. 超级管理员拥有所有权限
  if (roles?.includes("ROOT")) {
    return;
  }

  // 5. 将权限参数统一转为数组格式
  const requiredPermsArray = Array.isArray(requiredPerms)
    ? requiredPerms
    : [requiredPerms];

  // 6. 检查权限
  const hasAuth = requiredPermsArray.some(perm => perms.includes(perm));

  // 7. 根据权限显示/隐藏元素
  if (!hasAuth) {
    el.style.display = 'none';
  } else {
    el.style.display = '';
  }
}

/**
 * 角色权限指令
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkRolePermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkRolePermission(el, binding);
  }
};

/**
 * 角色权限检查核心逻辑
 */
function checkRolePermission(el: HTMLElement, binding: DirectiveBinding) {
  const requiredRoles = binding.value;

  // 1. 检查指令值是否有效
  if (!requiredRoles) {
    console.warn("v-has-role 指令缺少角色参数");
    return;
  }

  // 2. 验证角色参数格式
  if (typeof requiredRoles !== "string" && !Array.isArray(requiredRoles)) {
    console.error(
      "v-has-role 需要提供字符串或数组格式的角色标识！" +
      "例如：v-has-role=\"'ADMIN'\" 或 " +
      "v-has-role=\"['ADMIN', 'TEST']\""
    );
    return;
  }

  const userStore = useUserStore();

  // 3. 检查用户信息是否加载
  if (!userStore.userInfo) {
    console.warn("用户信息尚未加载，无法检查角色权限");
    return;
  }

  const { roles = [] } = userStore.userInfo;

  // 4. 将角色参数统一转为数组格式
  const requiredRolesArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];

  // 5. 检查角色权限
  const hasAuth = requiredRolesArray.some(role => roles.includes(role));

  // 6. 根据权限显示/隐藏元素
  if (!hasAuth) {
    el.style.display = 'none';
  } else {
    el.style.display = '';
  }
}
