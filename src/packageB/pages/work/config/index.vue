<template>
  <view class="work">
    <!-- 筛选 -->
    <wd-drop-menu close-on-click-modal class="mb-20rpx mr-20rpx ml-20rpx">
      <wd-drop-menu-item ref="dropMenu" title="筛选" icon="filter" icon-size="18px">
        <view>
          <wd-input
            v-model="queryParams.keywords"
            label="关键字"
            type="text"
            clearable
            placeholder="请输入关键字"
          />
          <view class="flex flex-row items-center mb-20rpx">
            <wd-button class="mt-20rpx mb-20rpx" size="medium" @click="handleQuery()">
              查询
            </wd-button>
            <wd-button size="medium" type="info" @click="handleReset">重置</wd-button>
          </view>
        </view>
      </wd-drop-menu-item>
    </wd-drop-menu>

    <view class="data-container">
      <!-- 列表内容 -->
      <view v-for="(item, index) in pageData" :key="index" class="mb-20rpx">
        <wd-card>
          <template #title>
            <view class="flex items-center justify-between">
              <view class="flex-1 text-truncate">{{ item.configName }}</view>
            </view>
          </template>

          <wd-cell-group>
            <wd-cell title="配置键" :value="item.configKey" />
            <wd-cell title="配置值" :value="item.configValue" />
            <wd-cell title="备注" :value="item.remark" />
          </wd-cell-group>

          <template #footer>
            <wd-button size="small" plain type="primary" @click="handleAction(item)">
              操作
            </wd-button>
          </template>
        </wd-card>
      </view>
    </view>

    <!-- 加载更多 -->
    <wd-loadmore :state="state" @reload="handleQuery" />

    <!-- 底部按钮 -->
    <view class="fixed bottom-0 w-full flex justify-around items-center p-20rpx bg-#fff">
      <wd-button size="medium" type="primary" @click="handleOpenDialog">添加</wd-button>
      <wd-button size="medium" type="success" @click="refreshCache">刷新缓存</wd-button>
    </view>

    <wd-popup v-model="showEditPopup" position="bottom">
      <view class="p-20rpx">
        <wd-form ref="formRef" :model="form">
          <wd-input
            v-model="form.configName"
            label="配置名称"
            type="text"
            placeholder="请输入配置名称"
            :rules="[{ required: true, message: '请填写配置名称' }]"
          />
          <wd-input
            v-model="form.configKey"
            label="配置键名"
            type="text"
            placeholder="请输入配置键名"
            :rules="[{ required: true, message: '请填写配置键' }]"
          />
          <wd-input
            v-model="form.configValue"
            label="配置键值"
            type="text"
            placeholder="请输入配置键值"
            :rules="[{ required: true, message: '请填写配置值' }]"
          />
          <wd-textarea
            v-model="form.remark"
            prop="remark"
            label="配置描述"
            label-align="right"
            clearable
            :maxlength="100"
            show-word-limit
            label-width="100px"
            placeholder="请输入配置描述"
          />
        </wd-form>
        <view class="flex justify-around mt-20rpx">
          <wd-button @click="showEditPopup = false">取消</wd-button>
          <wd-button type="primary" native-type="submit" :loading="loading" @click="submitForm">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script lang="ts" setup>
import ConfigAPI, { ConfigPageVO, ConfigForm, ConfigPageQuery } from "@/packageB/api/system/config";
import { DropMenuItemExpose } from "wot-design-uni/components/wd-drop-menu-item/types";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { FormInstance } from "wot-design-uni/components/wd-form/types";
import { debounce } from "@/packageB/utils";
const state = ref<LoadMoreState>("loading"); // 加载状态 loading, finished:, error
const total = ref(0);
const queryParams = reactive<ConfigPageQuery>({
  pageNum: 1,
  pageSize: 10,
  keywords: "",
});
// 系统配置表格数据
const pageData = ref<ConfigPageVO[]>([]);
const formRef = ref<FormInstance>();

const loading = ref(false);

/**
 * 搜索栏
 */
const dropMenu = ref<DropMenuItemExpose>();

/**
 * 搜索
 */
function handleQuery() {
  pageData.value = [];
  dropMenu.value?.close();
  queryParams.pageNum = 1;
  loadmore();
}

const showEditPopup = ref(false);
const form = ref<ConfigForm>({});

// 修改编辑函数
function handleEdit(id: number) {
  ConfigAPI.getFormData(id).then((data) => {
    Object.assign(form.value, data);
    // 显示弹窗
    showEditPopup.value = true;
  });
}

// 提交表单
async function submitForm() {
  loading.value = true;
  try {
    if (formRef.value) {
      formRef.value!.validate().then(async ({ valid }) => {
        if (valid) {
          if (form.value.id) {
            await ConfigAPI.update(form.value.id, form.value);
            uni.showToast({ title: "更新成功", icon: "success" });
          } else {
            await ConfigAPI.add(form.value);
            uni.showToast({ title: "添加成功", icon: "success" });
          }
          showEditPopup.value = false;
          handleQuery(); // 刷新列表
        } else {
          uni.showToast({ title: "请检查表单", icon: "error" });
          loading.value = false;
        }
      });
    }
  } catch {
    uni.showToast({ title: "操作失败", icon: "error" });
    loading.value = false;
  } finally {
    loading.value = false;
  }
}

/**
 * 重置搜索条件
 */
function handleReset() {
  queryParams.pageNum = 1;
  queryParams.keywords = "";
  pageData.value = [];
  dropMenu.value?.close();
  handleQuery();
}

/**
 * 触底事件
 */
onReachBottom(() => {
  queryParams.pageNum++;
  handleQuery();
});

/**
 * 加载更多
 */
function loadmore() {
  state.value = "loading";
  ConfigAPI.getPage(queryParams)
    .then((data) => {
      if (queryParams.pageNum === 1) {
        pageData.value = data.list;
      } else {
        pageData.value.push(...data.list);
      }
      total.value = data.total;
    })
    .finally(() => {
      state.value = "finished";
    });
}

/**
 * 添加
 */
function handleOpenDialog() {
  form.value.id = undefined;
  form.value.configName = "";
  form.value.configKey = "";
  form.value.configValue = "";
  form.value.remark = "";
  showEditPopup.value = true;
}

/**
 * 刷新缓存
 */
const refreshCache = debounce(() => {
  ConfigAPI.refreshCache().then(() => {
    uni.showToast({
      title: "刷新缓存成功",
      icon: "success",
      duration: 1000, // 显示时间，单位为毫秒，设置为 0 则不会自动消失
    });
  });
}, 1000);

/**
 * 删除
 */
function handleDelete(item: ConfigPageVO) {
  uni.showModal({
    title: "提示",
    content: "确定要删除该配置吗？",
    success: async (res) => {
      if (res.confirm) {
        if (item.id) {
          ConfigAPI.deleteById(item.id).then(() => {
            uni.showToast({ title: "删除成功", icon: "success" });
          });
        }
      }
    },
  });
}

/**
 * 操作
 */
function handleAction(item: ConfigPageVO) {
  const actions = ["编辑", "删除"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "编辑":
          handleEdit(item.id || 0);
          break;
        case "删除":
          handleDelete(item);
          break;
      }
    },
  });
}

onMounted(() => {
  handleQuery();
});

/**
 * 页面返回回来也要重新加载数据
 */
onLoad(() => {
  queryParams.pageNum = 1;
  handleQuery();
});
</script>
<style lang="scss" scoped>
.data-container {
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

  :deep(.wd-cell__right) {
    flex: 2;
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
