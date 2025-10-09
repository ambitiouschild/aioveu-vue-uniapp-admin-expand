<template>
  <view>
    <!-- 添加搜索栏 -->
    <wd-drop-menu close-on-click-modal class="mb-20rpx mr-20rpx ml-20rpx">
      <wd-drop-menu-item ref="dropMenu" title="筛选" icon="filter" icon-size="18px">
        <view>
          <wd-input
            v-model="queryParams.title"
            label="关键字"
            type="text"
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

    <!-- 列表内容 -->
    <view class="data-container">
      <view v-for="(item, index) in dataList" :key="index" class="mt-20rpx">
        <wd-card>
          <template #title>
            <view class="flex items-center justify-between">
              <view class="flex-1 text-truncate">{{ item.title }}</view>
              <wd-tag :type="getStatusType(item.publishStatus)" size="small">
                {{ getStatusText(item.publishStatus) }}
              </wd-tag>
            </view>
          </template>

          <wd-cell-group>
            <wd-cell title="通告目标类型" :value="item.targetType === 1 ? '指定' : '全体'" />
            <wd-cell title="紧急程度">
              <template #default>
                <cu-dict-label code="notice_level" :model-value="item.level" />
              </template>
            </wd-cell>
            <wd-cell title="发布人" :value="item.publisherName || '-'" />
          </wd-cell-group>
          <template #footer>
            <view class="flex-between">
              <view v-if="item.publishStatus === 1" class="text-left">
                <wd-text text="发布时间：" size="small" class="font-bold" />
                <wd-text :text="formatDate(item.publishTime)" size="small" />
              </view>
              <view v-else class="text-left">
                <wd-text text="撤回时间：" size="small" class="font-bold" />
                <wd-text :text="formatDate(item.revokeTime)" size="small" />
              </view>
              <view class="text-right">
                <wd-button size="small" plain type="primary" @click="handleAction(item)">
                  操作
                </wd-button>
              </view>
            </view>
          </template>
        </wd-card>
      </view>
    </view>

    <!-- 加载更多 -->
    <wd-loadmore custom-class="loadmore" :state="loadState" />
  </view>
</template>

<script lang="ts" setup>
import { LoadMoreState } from "wot-design-uni/components/wd-loadmore/types";
import { DropMenuItemExpose } from "wot-design-uni/components/wd-drop-menu-item/types";
import NoticeAPI, { NoticePageQuery, NoticePageVO } from "@/packageB/api/system/notice";
const loadState = ref<LoadMoreState>("finished");
const dataList = ref<NoticePageVO[]>([]);
const total = ref(0);

// 修改查询参数
const queryParams = ref<NoticePageQuery>({
  pageNum: 1,
  pageSize: 10,
  title: "",
});

// 添加搜索处理函数
const dropMenu = ref<DropMenuItemExpose>();
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  loadMore();
  dropMenu.value?.close();
};

// 重置
const handleReset = () => {
  queryParams.value = { pageNum: 1, pageSize: 10 };
  dropMenu.value?.close();
  loadMore();
};

// 获取状态样式
const getStatusType = (
  status: number | undefined
): "default" | "primary" | "danger" | "warning" | "success" => {
  if (!status) return "default";
  const statusMap: Record<number, "default" | "primary" | "danger" | "warning" | "success"> = {
    0: "primary",
    1: "success",
    [-1]: "warning",
  };
  return statusMap[status] || "default";
};

// 获取状态文本
const getStatusText = (status: number | undefined): string => {
  if (status !== 0 && !status) return "-";
  const statusMap: Record<number, string> = {
    0: "未发布",
    1: "已发布",
    [-1]: "已撤回",
  };
  return statusMap[status] || "未知";
};

// 格式化日期
const formatDate = (date: Date | undefined): string => {
  return date ? date.toString() : "-";
};

// 加载更多
const loadMore = async () => {
  if (loadState.value === "loading") return;

  loadState.value = "loading";
  const { list, total: totalCount } = await NoticeAPI.getPage(queryParams.value);

  if (queryParams.value.pageNum === 1) {
    dataList.value = list;
  } else {
    dataList.value = [...dataList.value, ...list];
  }

  total.value = totalCount;
  queryParams.value.pageNum++;

  loadState.value = dataList.value.length >= total.value ? "finished" : "loading";
};

// 查看详情
const handleView = (notice: NoticePageVO) => {
  uni.navigateTo({
    url: `/pages/work/notice/detail?id=${notice.id}`,
  });
};

// 操作按钮
const handleAction = (notice: NoticePageVO) => {
  const actions = notice.publishStatus !== 1 ? ["查看", "删除", "发布"] : ["查看", "撤回"];
  uni.showActionSheet({
    itemList: actions,
    success: ({ tapIndex }) => {
      switch (actions[tapIndex]) {
        case "查看":
          handleView(notice);
          break;
        case "删除":
          handleDelete(notice);
          break;
        case "发布":
          handlePublish(notice);
          break;
        case "撤回":
          handleRevoke(notice);
          break;
      }
    },
  });
};

// 删除
const handleDelete = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要删除该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.deleteByIds(notice.id);
          uni.showToast({ title: "删除成功", icon: "success" });
          // 重新加载第一页
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({ title: "删除失败" + error, icon: "none" });
        }
      }
    },
  });
};

// 发布
const handlePublish = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要发布该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.publish(Number(notice.id));
          uni.showToast({ title: "发布成功", icon: "success" });
          // 重新加载第一页
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({ title: "发布失败" + error, icon: "none" });
        }
      }
    },
  });
};

// 撤回
const handleRevoke = (notice: NoticePageVO) => {
  uni.showModal({
    title: "提示",
    content: "确定要撤回该通知吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          await NoticeAPI.revoke(Number(notice.id));
          uni.showToast({
            title: "撤回成功",
            icon: "success",
          });
          // 刷新列表
          queryParams.value.pageNum = 1;
          loadMore();
        } catch (error) {
          uni.showToast({
            title: "撤回失败" + error,
            icon: "error",
          });
        }
      }
    },
  });
};

onReachBottom(() => {
  if (loadState.value === "loading" || loadState.value === "finished") return;
  loadMore();
});

onLoad(() => {
  loadMore();
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

  .filter-container {
    padding: 10rpx;
    background: #fff;
  }

  .data-container {
    margin-top: 20rpx;
  }
}
</style>
