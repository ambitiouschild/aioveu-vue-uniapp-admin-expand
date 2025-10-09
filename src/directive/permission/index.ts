import type { Directive, DirectiveBinding } from "vue";

import { useUserStore } from "@/store";



//解决方案：
// 1.在指令注册时，我们注册的是 hasPerm（驼峰形式），那么在模板中应该使用 v-has-perm（短横线形式）。
// 2.检查所有使用指令的地方，确保使用的是短横线形式。
// 但是，在之前的代码中，我们确实在模板中使用了驼峰形式（如 v-hasPerm），这会导致Vue无法识别指令（因为Vue会自动将驼峰转换为短横线，但不会将驼峰形式的指令名转换为短横线形式）。因此，我们需要统一使用短横线形式。
//在Vue中，自定义指令在注册时使用驼峰命名（如hasPerm），在模板中使用时需要转换为短横线分隔（如v-has-perm）。如果使用驼峰形式（如v-hasPerm）则会导致Vue无法识别，从而报错。
// 所以，我们只需要确保在模板中使用短横线形式即可。

//  1.指令名称差异：
// •v-hasPerm和 v-has-perm是两种不同的指令写法
// •Vue 会自动将驼峰式命名转换为短横线分隔命名
// •在模板中，v-hasPerm会被自动转换为 v-has-perm

/**
 * 按钮权限
 */
export const hasPerm: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredPerms = binding.value;

    console.log("requiredPerms", requiredPerms);
    if (!requiredPerms) {
      return;
    }

    // 校验传入的权限值是否合法
    if (!requiredPerms || (typeof requiredPerms !== "string" && !Array.isArray(requiredPerms))) {
      throw new Error(
        "需要提供权限标识！例如：v-has-perm=\"'sys:user:add'\" 或 v-has-perm=\"['sys:user:add', 'sys:user:edit']\""
      );
    }

    const { roles = [], perms = [] } = useUserStore().userInfo || {};

    // 超级管理员拥有所有权限
    if (roles?.includes("ROOT")) {
      return;
    }

    // 检查权限
    const hasAuth = Array.isArray(requiredPerms)
      ? requiredPerms.some((perm) => perms.includes(perm))
      : perms.includes(requiredPerms);

    // 如果没有权限，移除该元素
    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};

/**
 * 角色权限指令
 */
export const hasRole: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const requiredRoles = binding.value;

    // 校验传入的角色值是否合法
    if (!requiredRoles || (typeof requiredRoles !== "string" && !Array.isArray(requiredRoles))) {
      throw new Error(
        "需要提供角色标识！例如：v-has-role=\"'ADMIN'\" 或 v-has-role=\"['ADMIN', 'TEST']\""
      );
    }

    const { roles = [] } = useUserStore().userInfo || {};

    // 检查是否有对应角色权限
    const hasAuth = Array.isArray(requiredRoles)
      ? requiredRoles.some((role) => roles.includes(role))
      : roles.includes(requiredRoles);

    // 如果没有权限，移除元素
    if (!hasAuth && el.parentNode) {
      el.parentNode.removeChild(el);
    }
  },
};
