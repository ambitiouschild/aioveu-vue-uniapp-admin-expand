<template>
  <!-- 自定义导航栏的占位 -->
  <view style="width: 100%; height: var(--status-bar-height)" />

  <view class="user-container">
    <!-- 自定义导航栏 -->
    <wd-navbar title="用户管理">
      <template #left>
        <wd-icon name="thin-arrow-left" @click="handleNavigateback()" />
      </template>
    </wd-navbar>

    <!-- 排序筛选 -->
    <view class="filter-container">
      <wd-drop-menu>
        <wd-drop-menu-item
          v-model="sortValue"
          :options="sortOptions"
          title="排序"
          icon="unfold-more"
          @change="handleSortChange"
        />
        <wd-drop-menu-item ref="filterDropMenu" title="筛选" icon="filter">
          <view>
            <wd-input
              v-model="queryParams.keywords"
              label="关键字"
              placeholder="用户名/昵称/手机号"
            />

            <cu-date-query v-model="queryParams.createTime" label="创建时间" />

            <view class="flex-between py-2">
              <wd-button type="info" @click="handleResetQuery">重置</wd-button>
              <wd-button @click="handleQuery">查询</wd-button>
            </view>
          </view>
        </wd-drop-menu-item>
      </wd-drop-menu>
    </view>

    <!-- 数据列表 -->
    <view class="data-container">
      <wd-card v-for="item in pageData" :key="item.id">
        <template #title>
          <view class="flex-between">
            <view class="flex-center">
              <wd-img :width="50" :height="50" round :src="item.avatar" />
              <view class="ml-2">
                <view class="font-bold">
                  {{ item.nickname }}
                  <wd-icon v-if="item.gender == 1" name="gender-male" class="color-#4D80F0" />
                  <wd-icon
                    v-else-if="item.gender == 2"
                    name="gender-female"
                    class="color-#FA4350"
                  />
                </view>
                <view class="mt-1"><wd-text :text="item.deptName" size="12px" /></view>
              </view>
            </view>
            <view>
              <wd-tag v-if="item.status === 1" type="success" plain>正常</wd-tag>
              <wd-tag v-else-if="item.status === 0" plain>禁用</wd-tag>
            </view>
          </view>
        </template>

        <wd-cell-group>
          <wd-cell title="用户名" :value="item.username" icon="user" />
          <wd-cell title="角色" :value="item.roleNames" icon="usergroup" />
          <wd-cell title="手机号码" :value="item.mobile" icon="mobile" />
          <wd-cell title="邮箱" :value="item.email" icon="mail" />
        </wd-cell-group>

        <template #footer>
          <view class="flex-between">
            <view class="text-left">
              <wd-text text="创建时间：" size="small" class="font-bold" />
              <wd-text :text="item.createTime" size="small" />
            </view>
            <view class="text-right">
              <wd-button
                type="primary"
                size="small"
                plain
                :v-has-perm="'sys:user:edit'"
                @click="handleOpenDialog(item.id)"
              >
                编辑
              </wd-button>
              &nbsp;
              <wd-button
                type="error"
                size="small"
                plain
                :v-has-perm="'sys:user:delete'"
                @click="handleDelete(item.id)"
              >
                删除
              </wd-button>
            </view>
          </view>
        </template>
      </wd-card>

      <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="loadmore" />
      <wd-status-tip v-else-if="total == 0" image="search" tip="当前搜索无结果" />
    </view>

    <!-- 弹窗表单 -->
    <wd-popup v-model="dialog.visible" position="bottom" @close="hancleCloseDialog">
      <wd-form ref="userFormRef" :model="formData" :rules="rules">
        <wd-cell-group border>
          <wd-input v-model="formData.username" label="用户名" :readonly="!formData.id" required />
          <wd-input v-model="formData.nickname" label="昵称" required />
          <wd-select-picker
            v-model="formData.roleIds"
            label="角色"
            :columns="roleOptions"
            required
          />
          <CuPicker
            v-model="formData.deptId"
            v-model:data="deptOptions"
            label="部门"
            :required="true"
          />
          <wd-input v-model="formData.mobile" label="手机号" prop="mobile" />
          <wd-input v-model="formData.email" label="邮箱" prop="email" />
          <wd-cell title="状态">
            <wd-switch v-model="formData.status" :active-value="1" :inactive-value="0" required />
          </wd-cell>
        </wd-cell-group>
      </wd-form>
      <view class="popup-footer">
        <wd-button type="primary" block @click="handleSubmit">提交</wd-button>
      </view>
    </wd-popup>

    <!-- 悬浮操作按钮 -->
    <wd-fab
      :v-has-perm="'sys:user:add'"
      position="left-bottom"
      :expandable="false"
      custom-style="z-index: 9"
      @click="handleOpenDialog"
    />

    <wd-message-box />
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";

import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormRules } from "wot-design-uni/components/wd-form/types";
import { useMessage } from "wot-design-uni";

import UserAPI, { type UserPageQuery, UserPageVO, UserForm } from "@/api/system/user";
import RoleAPI from "@/packageB/api/system/role";
import DeptAPI from "@/packageB/api/system/dept";

const message = useMessage();
const loadMoreState = ref<LoadMoreState>("loading");
const filterDropMenu = ref();
const userFormRef = ref();

const sortValue = ref(0);
const sortOptions = ref<Record<string, any>[]>([
  { label: "默认排序", value: 0 },
  { label: "最近创建", value: 1 },
  { label: "最近更新", value: 2 },
]);

let queryParams: UserPageQuery = {
  pageNum: 1,
  pageSize: 10,
};

const total = ref(0);
const pageData = ref<UserPageVO[]>([]);

const dialog = reactive({
  visible: false,
});

const initialFormData: UserForm = {
  id: undefined,
  roleIds: [],
  username: undefined,
  nickname: undefined,
  deptId: undefined,
  mobile: undefined,
  email: undefined,
  status: 1,
};

const formData = reactive<UserForm>({ ...initialFormData });

const roleOptions = ref<Record<string, any>[]>([]);
const deptOptions = ref<OptionType[]>([]);
const rules: FormRules = {
  username: [{ required: true, message: "请输入用户名" }],
  nickname: [{ required: true, message: "请输入昵称" }],
  roleIds: [{ required: true, message: "请选择角色" }],
  deptId: [{ required: true, message: "请选择部门" }],
  status: [{ required: true, message: "请选择状态" }],
  mobile: [
    {
      required: false,
      message: "手机号格式不正确",
      validator: (value) => {
        if (!value) {
          return Promise.resolve();
        }
        if (!/^1[3456789]\d{9}$/.test(value)) {
          return Promise.reject("手机号格式不正确");
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
  email: [
    {
      required: false,
      message: "邮箱格式不正确",
      validator: (value) => {
        if (!value) {
          return Promise.resolve();
        }
        if (!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
          return Promise.reject("邮箱格式不正确");
        } else {
          return Promise.resolve();
        }
      },
    },
  ],
};

/**
 * 排序改变
 */
const handleSortChange = ({ value }: { value: number }) => {
  if (value === 1) {
    queryParams.field = "create_time";
    queryParams.direction = "DESC";
  } else if (value === 2) {
    queryParams.field = "update_time";
    queryParams.direction = "DESC";
  } else {
    queryParams.field = "";
    queryParams.direction = "";
  }
  handleQuery();
};

/**
 * 查询
 */
const handleQuery = () => {
  filterDropMenu.value?.close();
  queryParams.pageNum = 1;
  loadmore();
  console.log("queryParams", queryParams);
};

/**
 * 重置查询
 */
const handleResetQuery = () => {
  queryParams = {
    pageNum: 1,
    pageSize: 10,
  };
  handleQuery();
};

/**
 * 加载更多
 */
function loadmore() {
  loadMoreState.value = "loading";
  UserAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum++;
    })
    .catch((e) => {
      pageData.value = [];
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

/**
 * 打开弹窗
 */
async function handleOpenDialog(id?: number) {
  dialog.visible = true;
  roleOptions.value = await RoleAPI.getOptions();
  deptOptions.value = await DeptAPI.getOptions();
  if (id) {
    UserAPI.getFormData(id).then((data) => {
      Object.assign(formData, { ...data });
    });
  }
}

/**
 * 提交保存
 */
function handleSubmit() {
  hancleCloseDialog();
  userFormRef.value.validate().then(({ valid }: { valid: boolean }) => {
    if (valid) {
      const userId = formData.id;
      if (userId) {
        UserAPI.update(userId, formData).then(() => {
          message.show("修改成功");
          hancleCloseDialog();
          handleQuery();
        });
      } else {
        UserAPI.add(formData).then(() => {
          message.show("添加成功");
          hancleCloseDialog();
          handleQuery();
        });
      }
    }
  });
}

// 重置表单
function resetForm() {
  userFormRef.value.reset();
  Object.assign(formData, initialFormData);
}

// 关闭弹窗
function hancleCloseDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 删除
 *
 * @param id  用户id
 */
function handleDelete(id: number) {
  message
    .confirm({
      msg: "确认删除用户吗？",
      title: "提示",
    })
    .then(() => {
      UserAPI.deleteByIds(id + "").then(() => {
        message.show("删除成功");
        handleQuery();
      });
    });
}

/**
 * 返回
 */
function handleNavigateback() {
  uni.navigateBack();
}

// 触底事件
onReachBottom(() => {
  if (queryParams.pageNum * queryParams.pageSize < total.value) {
    loadmore();
  } else if (queryParams.pageNum * queryParams.pageSize >= total.value) {
    loadMoreState.value = "finished";
  }
});

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
.user-container {
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

  .filter-container {
    padding: 10rpx;
    background: #fff;
  }

  .data-container {
    margin-top: 20rpx;
  }
}
</style>
