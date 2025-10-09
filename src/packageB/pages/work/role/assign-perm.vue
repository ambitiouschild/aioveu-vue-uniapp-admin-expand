<template>
  <view>
    <view class="p-l-8 p-b-20">
      <DaTree
        ref="DaTreeRef"
        :data="menuPermOptions"
        :defaultExpandAll="true"
        :showCheckbox="true"
      />
    </view>
    <wd-fab v-model:active="showFab" type="primary" position="right-top" direction="bottom">
      <wd-button custom-class="custom-button" type="primary" @click="doCheckedTree(rootKeys, true)">
        全 选
      </wd-button>
      <wd-button custom-class="custom-button" type="error" @click="doCheckedTree(rootKeys, false)">
        全不选
      </wd-button>
      <wd-button custom-class="custom-button" type="success" @click="doExpandTree('all', true)">
        全展开
      </wd-button>
      <wd-button custom-class="custom-button" type="warning" @click="doExpandTree('all', false)">
        全收起
      </wd-button>
    </wd-fab>
    <!-- 底部按钮 -->
    <view class="footer-buttons" style="">
      <wd-button size="medium" type="primary" block @click="handleAssignPermSubmit">
        确 定
      </wd-button>
    </view>
  </view>
</template>
<script lang="ts" setup>
import RoleAPI from "@/packageB/api/system/role";
import MenuAPI from "@/packageB/api/system/menu";
import DaTree from "@/components/da-tree/index.vue";

let roleId = ref<number>(); // 操作的角色ID
const menuPermOptions = ref<OptionType[]>([]); // 所有菜单
let rootKeys = ref<number[]>([]); // 根节点数组
const DaTreeRef = ref(); // 树引用
const showFab = ref(); // 悬浮按钮是否展开

/**
 * 分配菜单权限页面数据初始化
 */
async function initAssignPerm() {
  // 获取所有的菜单
  menuPermOptions.value = await MenuAPI.getOptions(false);
  rootKeys.value = menuPermOptions.value.map((item) => item.value as number);
  // 回显角色已拥有的菜单
  RoleAPI.getRoleMenuIds(roleId.value!).then((data) => {
    const checkedMenuIds = data;
    if (checkedMenuIds && checkedMenuIds.length > 0) {
      DaTreeRef.value?.setCheckedKeys(checkedMenuIds, true);
    }
  });
}

// 展开/收起树节点
function doExpandTree(keys: number[] | string, expand: boolean) {
  DaTreeRef.value?.setExpandedKeys(keys, expand);
  showFab.value = false;
}
// 选中/取消树节点
function doCheckedTree(keys: number[], checked: boolean) {
  DaTreeRef.value?.setCheckedKeys(keys, checked);
  showFab.value = false;
}

// 分配菜单权限提交
function handleAssignPermSubmit() {
  if (roleId.value) {
    const checkedMenuIds: number[] = DaTreeRef.value?.getCheckedKeys();
    RoleAPI.updateRoleMenus(roleId.value, checkedMenuIds).then(() => {
      uni.showToast({ title: "分配权限成功", icon: "success" });
      uni.navigateBack({ delta: 1 });
    });
  }
}

onLoad((options: any) => {
  if (options && options.id) {
    roleId.value = options.id;
  }
  initAssignPerm();
});
</script>

<style lang="scss" scoped>
.footer-buttons {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 20rpx;
  background-color: #fff;
}

:deep(.custom-button) {
  box-sizing: border-box;
  width: 64px !important;
  min-width: auto !important;
  height: 32px !important;
  margin: 8rpx;
  border-radius: 16px !important;
}
</style>
