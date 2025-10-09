<template>
  <div class="notice-detail">
    <wd-cell-group>
      <div class="notice-header">
        <h2 class="notice-title">
          <wd-icon name="prompt" size="20px" class="title-icon" />
          {{ noticeDetail.title }}
        </h2>
        <div class="notice-meta">
          <div class="meta-row">
            优先级：
            <cu-dict-label code="notice_level" :model-value="noticeDetail.level" />
          </div>
          <div class="meta-row">发布人：{{ noticeDetail.publisherName }}</div>
          <div class="meta-row">发布时间：{{ noticeDetail.publishTime }}</div>
        </div>
      </div>
      <wd-divider />
      <div class="notice-content" v-html="noticeDetail.content" />
    </wd-cell-group>
  </div>
</template>

<script setup lang="ts">
import NoticeAPI, { NoticeDetailVO } from "@/packageB/api/system/notice";

const noticeDetail = ref<NoticeDetailVO>({});

/**
 * 获取通知详情
 * @param id 通知ID
 */
const getNoticeDetail = async (id: string) => {
  try {
    const res = await NoticeAPI.getDetail(id);
    noticeDetail.value = res;
  } catch (error) {
    console.error("获取通知详情失败：", error);
  }
};

// 页面加载
onLoad((options: any) => {
  if (options && options.id) {
    getNoticeDetail(options.id as string);
  } else {
    uni.showToast({
      title: "通知不存在",
      icon: "none",
    });
  }
});
</script>

<style scoped>
.notice-detail {
  padding: 12px;
  background: #f7f8fa;
}

.notice-header {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
}

.notice-title {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
}

.title-icon {
  color: #666;
}

.notice-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.meta-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
}

.priority-wrapper {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.notice-content {
  padding: 16px;
  font-size: 15px;
  line-height: 1.6;
  background: #fff;
  border-radius: 8px;
}

:deep(.wd-divider) {
  margin: 0 8px;
}
</style>
