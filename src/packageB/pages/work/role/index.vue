<template>
  <view class="role">
    <!-- 筛选 -->
    <wd-drop-menu>
      <wd-drop-menu-item ref="filterDropMenu" icon="filter" icon-size="18px" title="筛选">
        <view>
          <wd-input
            v-model="queryParams.keywords"
            label="关键字"
            type="text"
            placeholder="请输入关键字"
          />
          <view class="flex-between py-2">
            <wd-button custom-class="w-20%" type="info" @click="handleResetQuery">重置</wd-button>
            <wd-button custom-class="w-70%" @click="handleQuery">确定</wd-button>
          </view>
        </view>
      </wd-drop-menu-item>
    </wd-drop-menu>
    <!-- 卡片列表 -->
    <view class="list-container">
      <wd-card v-for="item in dataList" :key="item.id" class="role-card">
        <template #title>
          <view class="flex-between">
            <view class="flex-center">
              <view class="ml-2">
                <view class="font-bold">
                  {{ item.name }}
                </view>
              </view>
            </view>
            <view>
              <wd-tag v-if="item.status === 1" type="success" plain>正常</wd-tag>
              <wd-tag v-else-if="item.status === 0" plain>停用</wd-tag>
            </view>
          </view>
        </template>

        <wd-cell-group>
          <wd-cell title="编码" title-width="150rpx" :value="item.code" />
          <wd-cell title="排序号" title-width="150rpx" :value="item.sort" />
        </wd-cell-group>

        <template #footer>
          <view class="flex-between">
            <view class="text-left">
              <wd-text text="创建时间：" size="small" class="font-bold" />
              <wd-text :text="item.createTime" size="small" />
            </view>
            <view class="flex-right">
              <wd-button size="small" plain @click="handleAction(item)">操作</wd-button>
            </view>
          </view>
        </template>
      </wd-card>

      <!-- 加载更多 -->
      <wd-loadmore :state="loadMoreState" @reload="queryPageData" />
    </view>
    <!-- 底部按钮 -->
    <wd-fab
      position="left-bottom"
      :expandable="false"
      customStyle="width: 1rem; height: 1rem; line-height: 1rem;z-index:9"
      @click="handleOpenDialog()"
    />

    <wd-popup v-model="dialog.visible" position="bottom" custom-class="yl-popup">
      <wd-form ref="roleFormRef" :model="formData" :rules="rules">
        <wd-cell-group border>
          <wd-input v-model="formData.name" label="角色名称" prop="name" />
          <wd-input v-model="formData.code" label="角色编码" prop="code" />
          <wd-select-picker
            v-model="formData.dataScope"
            type="radio"
            label="数据权限"
            :columns="dataScopeOptions"
            :align-right="true"
            prop="dataScope"
          />
          <wd-cell title="状态" prop="status">
            <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
          </wd-cell>
          <wd-cell title="排序" prop="sort">
            <wd-input-number v-model="formData.sort" />
          </wd-cell>
        </wd-cell-group>
      </wd-form>
      <view class="footer">
        <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
      </view>
    </wd-popup>
    <wd-message-box />
  </view>
</template>
<script lang="ts" setup>
import RoleAPI, { RolePageVO, RolePageQuery, RoleForm } from "@/packageB/api/system/role";
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { DropMenuItemExpose } from "wot-design-uni/components/wd-drop-menu-item/types";
import { FormInstance } from "wot-design-uni/components/wd-form/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useMessage } from "wot-design-uni";
const message = useMessage();

const loadMoreState = ref<LoadMoreState>("loading");

const total = ref(0);

const queryParams = reactive<RolePageQuery>({
  pageNum: 1,
  pageSize: 10,
});

/**
 * 搜索栏
 */
const filterDropMenu = ref<DropMenuItemExpose>();

function handleQuery() {
  filterDropMenu.value?.close();
  queryParams.pageNum = 1;
  dataList.value = [];
  queryPageData();
}
/**
 * 重置查询
 */
const handleResetQuery = () => {
  filterDropMenu.value?.close();
  queryParams.keywords = "";
  queryParams.pageNum = 1;
  dataList.value = [];
  queryPageData();
};

// 角色列表数据
const dataList = ref<RolePageVO[]>([]);

/**
 * 查询分页数据
 */
function queryPageData() {
  loadMoreState.value = "loading";
  RoleAPI.getPage(queryParams)
    .then((data) => {
      dataList.value?.push(...data.list);
      total.value = data.total;
    })
    .catch((e) => {
      console.log("系统异常", e);
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

/**
 * 触底事件
 */
onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    queryParams.pageNum++;
    queryPageData();
  } else {
    loadMoreState.value = "finished";
  }
});

// 操作按钮
const handleAction = (item: RolePageVO) => {
  const actions = ["编辑", "分配权限", "删除"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "编辑":
          handleOpenDialog(item.id);
          break;
        case "分配权限":
          handleAssignPerm(item.id);
          break;
        case "删除":
          handleDelete(item.id);
          break;
      }
    },
  });
};

const dialog = reactive({
  visible: false,
});

const dataScopeOptions = ref<Record<string, any>[]>([
  { label: "全部数据", value: 0 },
  { label: "部门及子部门数据", value: 1 },
  { label: "本部门数据", value: 2 },
  { label: "本人数据", value: 3 },
]);

const formData = reactive<RoleForm>({
  dataScope: 0,
  sort: 1,
});

const rules: FormRules = {
  name: [{ required: true, message: "请输入角色名称", trigger: "blur" }],
  code: [{ required: true, message: "请输入角色编码", trigger: "blur" }],
  dataScope: [{ required: true, message: "请选择数据权限", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  sort: [{ required: true, message: "请输入排序号", trigger: "change" }],
};

const roleFormRef = ref<FormInstance>();

/**
 * 打开弹窗
 */
async function handleOpenDialog(id?: number) {
  dialog.visible = true;
  formData.id = undefined;
  formData.name = "";
  formData.code = "";
  formData.dataScope = 0;
  formData.status = 1;
  formData.sort = 1;
  if (id) {
    RoleAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  }
}

/**
 * 提交保存
 */
function handleSubmit() {
  if (roleFormRef.value) {
    roleFormRef.value.validate().then(({ valid }) => {
      if (valid) {
        const roleId = formData.id;
        if (roleId) {
          RoleAPI.update(roleId, formData).then(() => {
            uni.showToast({ title: "修改成功", icon: "success" });
            dialog.visible = false;
            queryParams.pageNum = 1;
            handleQuery();
          });
        } else {
          RoleAPI.add(formData).then(() => {
            uni.showToast({ title: "添加成功", icon: "success" });
            dialog.visible = false;
            queryParams.pageNum = 1;
            handleQuery();
          });
        }
      }
    });
  }
}

/**
 * 删除
 *
 * @param id  用户id
 */
function handleDelete(id: number) {
  message
    .confirm({
      msg: "确认删除角色吗？",
      title: "提示",
    })
    .then(() => {
      RoleAPI.deleteByIds(id + "").then(() => {
        uni.showToast({ title: "删除成功", icon: "success" });
        queryParams.pageNum = 1;
        handleQuery();
      });
    })
    .catch(() => {
      console.log("点击了取消按钮");
    });
}

function handleAssignPerm(id: number) {
  uni.navigateTo({
    url: "/pages/work/role/assign-perm?id=" + id,
  });
}

onLoad(() => {
  handleQuery();
});
</script>

<script lang="ts">
// https://wot-design-uni.pages.dev/guide/common-problems#%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%A0%B7%E5%BC%8F%E9%9A%94%E7%A6%BB
export default {
  options: {
    styleIsolation: "shared",
  },
};
</script>

<style lang="scss" scoped>
.role {
  :deep(.wd-drop-menu .wd-drop-menu__item) {
    display: flex;
    justify-content: flex-end;
    padding: 0 50rpx;
  }
  .list-container {
    .role-card {
      margin-top: 20rpx;
      :deep(.wd-cell__wrapper) {
        padding: 4rpx 0;
      }
      :deep(.wd-cell) {
        padding-right: 10rpx;
        background: #f8f8f8;
      }
    }
  }
  :deep(.wd-cell__wrapper) {
    padding: 4rpx 0;
  }

  :deep(.wd-cell) {
    padding-right: 10rpx;
    background: #f8f8f8;
  }

  :deep(.wd-fab__trigger) {
    width: 80rpx !important;
    height: 80rpx !important;
  }
  .yl-popup {
    .footer {
      margin: 30rpx 0;
    }
  }
  /**
   * wot组件直接写class，在小程序上无效
   * wot组件提供的custom-class属性也不能写unocss的写法
   * 故wot组件只能使用custom-class属性并在vue文件中自己写样式
   * 并且custom-class的类名需要使用:deep包裹，否则在小程序上也没有效果
   */
  :deep(.w-20per) {
    width: 20%;
  }
  :deep(.w-70per) {
    width: 70%;
  }
}
</style>
