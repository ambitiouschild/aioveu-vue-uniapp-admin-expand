<template>
  <view class="log">
    <!-- 筛选 -->
    <wd-drop-menu close-on-click-modal class="mb-24rpx">
      <wd-drop-menu-item ref="filterDropMenu" title="筛选" icon="filter" icon-size="18px">
        <view>
          <wd-input
            v-model="queryParams.keywords"
            label="关键字"
            type="text"
            placeholder="请输入关键字"
          />

          <cu-date-query v-model="queryParams.createTime" :label="'日期选择'" />

          <view class="flex-between py-2">
            <wd-button class="w-20%" type="info" @click="handleResetQuery">重置</wd-button>
            <wd-button class="w-70%" @click="handleQuery">查询</wd-button>
          </view>
        </view>
      </wd-drop-menu-item>
    </wd-drop-menu>

    <!-- 卡片列表 -->
    <wd-card v-for="item in pageData" :key="item.id" class="card-list">
      <template #title>
        {{ item.operator }}
      </template>

      <wd-cell-group>
        <wd-cell title="模块" :value="item.module" />
        <wd-cell title="内容" :value="item.content" />
        <wd-cell title="IP" :value="item.ip" />
        <wd-cell title="地区" :value="item.region" />
      </wd-cell-group>

      <template #footer>
        <view class="flex-between">
          <view class="text-left">
            <wd-text text="创建时间：" size="small" class="font-bold" />
            <wd-text :text="item.createTime" size="small" />
          </view>
          <view class="text-right">
            <wd-button type="primary" size="small" plain @click="handleViewDetail(item)">
              查看详情
            </wd-button>
          </view>
        </view>
      </template>
    </wd-card>

    <!-- 详情弹窗 -->
    <wd-popup v-model="detailDialogVisible" position="bottom">
      <wd-cell-group>
        <wd-cell title="操作人" :value="logDetail.operator" />
        <wd-cell title="操作时间" :value="logDetail.createTime" />
        <wd-cell title="模块" :value="logDetail.module" />
        <wd-cell title="内容" :value="logDetail.content" />
        <wd-cell title="IP" :value="logDetail.ip" />
        <wd-cell title="地区" :value="logDetail.region" />
        <wd-cell title="浏览器" :value="logDetail.region" />
        <wd-cell title="终端系统" :value="logDetail.os" />
        <wd-cell title="耗时(毫秒)" :value="logDetail.executionTime" />
      </wd-cell-group>
    </wd-popup>

    <!-- 加载更多 -->
    <wd-loadmore v-if="total > 0" :state="loadMoreState" @reload="loadmore" />
    <wd-status-tip v-else-if="total == 0" image="search" tip="当前搜索无结果" />
  </view>
</template>
<script lang="ts" setup>
import { onLoad, onReachBottom } from "@dcloudio/uni-app";
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { DropMenuItemExpose } from "wot-design-uni/components/wd-drop-menu-item/types";

import LogAPI, { LogVO, LogPageQuery } from "@/api/system/log";

const filterDropMenu = ref<DropMenuItemExpose>();
const loadMoreState = ref<LoadMoreState>("loading");

const queryParams = reactive<LogPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

const total = ref(0);
const pageData = ref<LogVO[]>([]);

const logDetail = ref<LogVO>({});
const detailDialogVisible = ref(false);

/**
 * 搜索栏
 */
function handleQuery() {
  filterDropMenu.value?.close();
  queryParams.pageNum = 1;
  loadmore();
}

/**
 * 重置搜索
 */
function handleResetQuery() {
  queryParams.keywords = undefined;
  queryParams.createTime = undefined;
  handleQuery();
}

/**
 * 加载更多
 */
function loadmore() {
  loadMoreState.value = "loading";
  LogAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
      queryParams.pageNum++;
    })
    .catch(() => {
      pageData.value = [];
    })
    .finally(() => {
      loadMoreState.value = "finished";
    });
}

/**
 * 查看详情
 */
function handleViewDetail(item: LogVO) {
  detailDialogVisible.value = true;
  logDetail.value = item;
}

/**
 * 触底事件
 */
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

<style lang="scss" scoped>
.wd-col {
  margin-top: 10rpx;
}

::v-deep .wd-drop-menu__item {
  display: flex;
  justify-content: flex-end;
  padding: 0 50rpx;
}

.card-list {
  :deep(.wd-cell__wrapper) {
    padding: 4rpx 0;
  }
  :deep(.wd-cell) {
    padding-right: 10rpx;
    background: #f8f8f8;
  }
}
</style>
