<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 会员卡号 -->
        <view class="filter-item">
          <text class="filter-label">会员卡号</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="memberOptions"
            range-key="memberNo"
            :value="memberIndex"
            @change="onMemberChange"
          >
            <view class="picker-view">
              {{ memberIndex >= 0 ? memberOptions[memberIndex].memberNo : '请选择会员卡号' }}
            </view>
          </picker>
        </view>

        <!-- 账户状态 -->
        <view class="filter-item">
          <text class="filter-label">账户状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="statusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-view">
              {{ statusIndex >= 0 ? statusOptions[statusIndex].label : '请选择状态' }}
            </view>
          </picker>
        </view>

        <view class="filter-buttons">
          <button class="filter-btn reset" @click="handleResetQuery">重置</button>
          <button class="filter-btn confirm" @click="handleQuery">搜索</button>
        </view>
      </view>
    </view>

    <!-- 操作按钮区域 -->
    <view class="action-buttons">
      <button
        :v-has-perm="['aioveuMemberAccount:aioveu-member-account:add']"
        class="action-btn add"
        @click="handleOpenForm"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuMemberAccount:aioveu-member-account:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 会员账户列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无会员账户数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="account-card"
      >
        <view class="card-header">
          <text class="member-no">{{ item.memberNo }}</text>
          <text class="member-name">{{ item.name }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">现金余额:</text>
            <text class="info-value">¥{{ item.cashBalance }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">赠送余额:</text>
            <text class="info-value">¥{{ item.giftBalance }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">总余额:</text>
            <text class="info-value">¥{{ item.totalBalance }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">最后充值:</text>
            <text class="info-value">{{ formatTime(item.lastRechargeTime) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">状态:</text>
            <text class="info-value status" :class="getStatusClass(item.status)">
              {{ getStatusText(item.status) }}
            </text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ formatTime(item.createTime) }}</text>
            <text>更新: {{ formatTime(item.updateTime) }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuMemberAccount:aioveu-member-account:edit']"
              class="action-btn edit"
              @click.stop="handleOpenForm(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuMemberAccount:aioveu-member-account:delete']"
              class="action-btn delete"
              @click.stop="handleDelete(item.id)"
            >
              <text>🗑️</text>
              <text>删除</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view class="pagination" v-if="total > 0">
        <button
          class="pagination-btn"
          :disabled="queryParams.pageNum <= 1"
          @click="prevPage"
        >
          上一页
        </button>
        <text class="page-info">
          {{ queryParams.pageNum }} / {{ Math.ceil(total / queryParams.pageSize) }}
        </text>
        <button
          class="pagination-btn"
          :disabled="queryParams.pageNum * queryParams.pageSize >= total"
          @click="nextPage"
        >
          下一页
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import AioveuMemberAccountAPI from "@/packageF/api/aioveuMemberAccount/aioveu-member-account";
import AioveuMemberAPI from "@/packageF/api/aioveuMember/aioveu-member";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuMemberAccount",
  setup() {
    const loading = ref(false);
    const removeIds = ref([]);
    const total = ref(0);
    const showFilter = ref(false);

    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      memberId: undefined,
      status: undefined
    });

    const pageData = ref([]);
    const memberOptions = ref([]);
    const statusOptions = ref([]);

    const memberIndex = ref(-1);
    const statusIndex = ref(-1);

    // 切换筛选显示
    const toggleFilter = () => {
      showFilter.value = !showFilter.value;
    };

    // 会员选择变化
    const onMemberChange = (e) => {
      const index = e.detail.value;
      memberIndex.value = index;
      if (memberOptions.value[index]) {
        queryParams.memberId = memberOptions.value[index].memberId;
      }
    };

    // 状态选择变化
    const onStatusChange = (e) => {
      const index = e.detail.value;
      statusIndex.value = index;
      if (statusOptions.value[index]) {
        queryParams.status = Number(statusOptions.value[index].value);
      }
    };

    // 查询会员账户
    const handleQuery = () => {
      loading.value = true;

      // 创建清理后的参数对象
      const cleanedParams = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        memberId: queryParams.memberId,
        status: queryParams.status
      };

      // 移除值为 undefined 的参数
      const finalParams = Object.fromEntries(
        Object.entries(cleanedParams).filter(([_, value]) => value !== undefined)
      );

      AioveuMemberAccountAPI.getPage(finalParams)
        .then((data) => {
          pageData.value = data.list;
          total.value = data.total;
        })
        .catch(error => {
          console.error('查询会员账户失败:', error);
          uni.showToast({
            title: '加载数据失败',
            icon: 'none'
          });
        })
        .finally(() => {
          loading.value = false;
        });
    };

    // 重置查询
    const handleResetQuery = () => {
      queryParams.pageNum = 1;
      queryParams.memberId = undefined;
      queryParams.status = undefined;
      memberIndex.value = -1;
      statusIndex.value = -1;
      handleQuery();
    };

    // 上一页
    const prevPage = () => {
      if (queryParams.pageNum > 1) {
        queryParams.pageNum--;
        handleQuery();
      }
    };

    // 下一页
    const nextPage = () => {
      if (queryParams.pageNum * queryParams.pageSize < total.value) {
        queryParams.pageNum++;
        handleQuery();
      }
    };

    // 行选择变化
    const handleSelectionChange = (selection) => {
      removeIds.value = selection
        .map(item => item.id)
        .filter(id => id !== undefined && id !== null);
    };

    const needRefresh = ref(false);

    onShow(() => {
      if (needRefresh.value) {
        handleQuery();
        needRefresh.value = false;
      }
    });

    // 打开表单页
    const handleOpenForm = (id) => {
      needRefresh.value = true; // 标记需要刷新
      let url = '/packageF/pages/aioveu_member/member_account/form';
      if (id !== undefined) {
        url += `?id=${id}`;
      }
      uni.navigateTo({ url });
    };

    // 删除会员账户
    const handleDelete = (id) => {
      const ids = id ? [id] : removeIds.value;

      if (ids.length === 0) {
        uni.showToast({
          title: "请选择要删除的会员账户",
          icon: "none"
        });
        return;
      }

      uni.showModal({
        title: '提示',
        content: '确认删除选中的会员账户吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中...' });
            AioveuMemberAccountAPI.deleteByIds(ids.join(","))
              .then(() => {
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                handleQuery();
              })
              .catch(error => {
                console.error('删除失败:', error);
                uni.showToast({
                  title: "删除失败",
                  icon: "none"
                });
              })
              .finally(() => uni.hideLoading());
          }
        }
      });
    };

    // 获取状态文本
    const getStatusText = (status) => {
      const item = statusOptions.value.find(i => Number(i.value) === status);
      return item ? item.label : '未知状态';
    };

    // 获取状态类名
    const getStatusClass = (status) => {
      return status === 1 ? 'status-active' : 'status-inactive';
    };

    // 格式化时间
    const formatTime = (time) => {
      return time ? time.substring(0, 10) : '';
    };

    // 加载会员选项
    const loadMemberOptions = () => {
      AioveuMemberAPI.getAllMemberNoOptions()
        .then(response => {
          if (Array.isArray(response)) {
            memberOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载会员选项失败:', error);
        });
    };

    // 加载状态选项
    const loadStatusOptions = () => {
      DictAPI.getDictItems('member_account_status')
        .then(response => {
          statusOptions.value = response;
        })
        .catch(error => {
          console.error('加载状态选项失败:', error);
        });
    };

    onMounted(() => {
      handleQuery();
      loadMemberOptions();
      loadStatusOptions();
    });

    return {
      loading,
      removeIds,
      total,
      showFilter,
      queryParams,
      pageData,
      memberOptions,
      statusOptions,
      memberIndex,
      statusIndex,
      toggleFilter,
      onMemberChange,
      onStatusChange,
      handleQuery,
      handleResetQuery,
      prevPage,
      nextPage,
      handleOpenForm,
      handleDelete,
      getStatusText,
      getStatusClass,
      formatTime
    };
  }
};
</script>

<style lang="scss">
.app-container {
  padding: 20rpx;
  background-color: #f5f7fa;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 筛选区域 */
.search-container {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 24rpx;
  overflow: hidden;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
  background-color: #f8f9fa;
  border-bottom: 1rpx solid #eaeaea;
}

.filter-content {
  padding: 24rpx;
}

.filter-item {
  margin-bottom: 32rpx;
}

.filter-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.filter-input, .filter-picker {
  border: 1rpx solid #e2e8f0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  width: 100%;
  background-color: white;
}

.picker-view {
  height: 44rpx;
  line-height: 44rpx;
}

.filter-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 24rpx;
}

.filter-btn {
  flex: 1;
  margin: 0 12rpx;
  font-size: 28rpx;
  border-radius: 12rpx;
  padding: 20rpx 0;
  border: none;

  &.reset {
    background-color: #f5f5f5;
    color: #666;
  }

  &.confirm {
    background-color: #5e72e4;
    color: white;
  }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;

  &.add {
    background: #2dce89;
    color: white;
  }

  &.delete {
    background: #f5365c;
    color: white;

    &[disabled] {
      background: #cccccc;
      opacity: 0.7;
    }
  }
}

/* 会员账户列表 */
.list-container {
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.loading-state {
  padding: 60rpx;
  text-align: center;
  color: #666;
  font-size: 28rpx;
}

.empty-state {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #666;

  .empty-icon {
    font-size: 100rpx;
    color: #cbd5e0;
    margin-bottom: 24rpx;
    display: block;
  }

  .empty-text {
    font-size: 32rpx;
  }
}

.account-card {
  border-bottom: 1rpx solid #f1f1f1;
  padding: 32rpx;

  &:last-child {
    border-bottom: none;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .member-no {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .member-name {
    font-size: 28rpx;
    color: #5e72e4;
    background-color: rgba(94, 114, 228, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
  }
}

.card-content {
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  margin-bottom: 20rpx;
  font-size: 30rpx;

  .info-label {
    color: #666;
    width: 180rpx;
    font-weight: 500;
  }

  .info-value {
    color: #333;
    flex: 1;

    &.status {
      padding: 4rpx 16rpx;
      border-radius: 30rpx;
      font-weight: 500;

      &.status-active {
        background-color: rgba(45, 206, 137, 0.1);
        color: #2dce89;
      }

      &.status-inactive {
        background-color: rgba(245, 54, 92, 0.1);
        color: #f5365c;
      }
    }
  }
}

.card-footer {
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f1f1;

  .time-info {
    display: flex;
    justify-content: space-between;
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
  }

  .action-buttons {
    display: flex;
    gap: 24rpx;
    margin: 0;

    .action-btn {
      flex: 1;
      padding: 16rpx 0;
      font-size: 26rpx;
    }
  }
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-top: 1rpx solid #f1f1f1;

  .pagination-btn {
    flex: 1;
    margin: 0 16rpx;
    padding: 20rpx 0;
    border-radius: 12rpx;
    font-size: 28rpx;
    background: #f8f9fa;
    color: #333;

    &[disabled] {
      opacity: 0.5;
    }
  }

  .page-info {
    font-size: 28rpx;
    color: #666;
  }
}
</style>
