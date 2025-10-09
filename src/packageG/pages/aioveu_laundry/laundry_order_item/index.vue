<template>
  <view class="app-container">
    <!-- 搜索区域 -->
    <view class="search-container">
      <view class="filter-header" @click="toggleFilter">
        <text>🔍 筛选条件</text>
        <text>{{ showFilter ? '▲' : '▼' }}</text>
      </view>

      <view class="filter-content" v-if="showFilter">
        <!-- 订单号 -->
        <view class="filter-item">
          <text class="filter-label">订单号</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="orderOptions"
            range-key="orderNo"
            :value="orderIndex"
            @change="onOrderChange"
          >
            <view class="picker-view">
              {{ orderIndex >= 0 ? orderOptions[orderIndex].orderNo : '请选择订单号' }}
            </view>
          </picker>
        </view>

        <!-- 衣物类型 -->
        <view class="filter-item">
          <text class="filter-label">衣物类型</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="clothingTypeOptions"
            range-key="clothingTypeName"
            :value="clothingTypeIndex"
            @change="onClothingTypeChange"
          >
            <view class="picker-view">
              {{ clothingTypeIndex >= 0 ? clothingTypeOptions[clothingTypeIndex].clothingTypeName : '请选择衣物类型' }}
            </view>
          </picker>
        </view>

        <!-- 自定义衣物类型 -->
        <view class="filter-item">
          <text class="filter-label">自定义衣物类型</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入自定义衣物类型"
            v-model="queryParams.customType"
            @confirm="handleQuery"
          />
        </view>

        <!-- 处理状态 -->
        <view class="filter-item">
          <text class="filter-label">处理状态</text>
          <picker
            class="filter-picker"
            mode="selector"
            :range="processStatusOptions"
            range-key="label"
            :value="processStatusIndex"
            @change="onProcessStatusChange"
          >
            <view class="picker-view">
              {{ processStatusIndex >= 0 ? processStatusOptions[processStatusIndex].label : '请选择处理状态' }}
            </view>
          </picker>
        </view>

        <!-- 特殊要求 -->
        <view class="filter-item">
          <text class="filter-label">特殊要求</text>
          <input
            type="text"
            class="filter-input"
            placeholder="请输入特殊要求"
            v-model="queryParams.specialInstruction"
            @confirm="handleQuery"
          />
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
        :v-has-perm="['aioveuLaundryOrderItem:aioveu-laundry-order-item:add']"
        class="action-btn add"
        @click="handleOpenForm"
      >
        <text>+</text>
        <text>新增</text>
      </button>
      <button
        :v-has-perm="['aioveuLaundryOrderItem:aioveu-laundry-order-item:delete']"
        class="action-btn delete"
        :disabled="removeIds.length === 0"
        @click="handleDelete"
      >
        <text>🗑️</text>
        <text>删除</text>
      </button>
    </view>

    <!-- 衣物明细列表 -->
    <view class="list-container">
      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="pageData.length === 0" class="empty-state">
        <text class="empty-icon">📁</text>
        <text class="empty-text">暂无衣物明细数据</text>
      </view>

      <view
        v-else
        v-for="item in pageData"
        :key="item.id"
        class="item-card"
      >
        <view class="card-header">
          <text class="order-no">{{ item.orderNo }}</text>
          <text class="status" :class="getStatusClass(item.processStatus)">
            {{ getStatusText(item.processStatus) }}
          </text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <text class="info-label">衣物类型:</text>
            <text class="info-value">{{ item.clothingTypeName || item.customType }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">问题描述:</text>
            <text class="info-value">{{ item.problemDesc || '无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">价格:</text>
            <text class="info-value">¥{{ item.price }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">特殊要求:</text>
            <text class="info-value">{{ item.specialInstruction || '无' }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">开始处理:</text>
            <text class="info-value">{{ formatTime(item.startTime) }}</text>
          </view>
          <view class="info-row">
            <text class="info-label">完成处理:</text>
            <text class="info-value">{{ formatTime(item.endTime) }}</text>
          </view>
        </view>

        <view class="card-footer">
          <view class="time-info">
            <text>创建: {{ formatTime(item.createTime) }}</text>
            <text>更新: {{ formatTime(item.updateTime) }}</text>
          </view>

          <view class="action-buttons">
            <button
              :v-has-perm="['aioveuLaundryOrderItem:aioveu-laundry-order-item:edit']"
              class="action-btn edit"
              @click.stop="handleOpenForm(item.id)"
            >
              <text>✏️</text>
              <text>编辑</text>
            </button>
            <button
              :v-has-perm="['aioveuLaundryOrderItem:aioveu-laundry-order-item:delete']"
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
import AioveuLaundryOrderItemAPI from "@/packageG/api/aioveuLaundryOrderItem/aioveu-laundry-order-item";
import AioveuLaundryOrderAPI from "@/packageG/api/aioveuLaundryOrder/aioveu-laundry-order";
import AioveuLaundryClothingTypeAPI from "@/packageG/api/aioveuLaundryClothingType/aioveu-laundry-clothing-type";
import DictAPI from '@/api/system/dict';

export default {
  name: "AioveuLaundryOrderItem",
  setup() {
    const loading = ref(false);
    const removeIds = ref([]);
    const total = ref(0);
    const showFilter = ref(false);

    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      orderId: undefined,
      clothingTypeId: undefined,
      customType: '',
      processStatus: undefined,
      specialInstruction: ''
    });

    const pageData = ref([]);
    const orderOptions = ref([]);
    const clothingTypeOptions = ref([]);
    const processStatusOptions = ref([]);

    const orderIndex = ref(-1);
    const clothingTypeIndex = ref(-1);
    const processStatusIndex = ref(-1);

    // 切换筛选显示
    const toggleFilter = () => {
      showFilter.value = !showFilter.value;
    };

    // 订单选择变化
    const onOrderChange = (e) => {
      const index = e.detail.value;
      orderIndex.value = index;
      if (orderOptions.value[index]) {
        queryParams.orderId = orderOptions.value[index].orderId;
      }
    };

    // 衣物类型选择变化
    const onClothingTypeChange = (e) => {
      const index = e.detail.value;
      clothingTypeIndex.value = index;
      if (clothingTypeOptions.value[index]) {
        queryParams.clothingTypeId = clothingTypeOptions.value[index].clothingTypeId;
      }
    };

    // 处理状态选择变化
    const onProcessStatusChange = (e) => {
      const index = e.detail.value;
      processStatusIndex.value = index;
      if (processStatusOptions.value[index]) {
        queryParams.processStatus = Number(processStatusOptions.value[index].value);
      }
    };

    // 查询衣物明细
    const handleQuery = () => {
      loading.value = true;

      // 创建清理后的参数对象
      const cleanedParams = {
        pageNum: queryParams.pageNum,
        pageSize: queryParams.pageSize,
        orderId: queryParams.orderId,
        clothingTypeId: queryParams.clothingTypeId,
        customType: queryParams.customType || undefined,
        processStatus: queryParams.processStatus,
        specialInstruction: queryParams.specialInstruction || undefined
      };

      // 移除值为 undefined 的参数
      const finalParams = Object.fromEntries(
        Object.entries(cleanedParams).filter(([_, value]) => value !== undefined)
      );

      AioveuLaundryOrderItemAPI.getPage(finalParams)
        .then((data) => {
          pageData.value = data.list;
          total.value = data.total;
        })
        .catch(error => {
          console.error('查询衣物明细失败:', error);
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
      queryParams.orderId = undefined;
      queryParams.clothingTypeId = undefined;
      queryParams.customType = '';
      queryParams.processStatus = undefined;
      queryParams.specialInstruction = '';
      orderIndex.value = -1;
      clothingTypeIndex.value = -1;
      processStatusIndex.value = -1;
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
      let url = '/packageG/pages/aioveu_laundry/laundry_order_item/form';
      if (id !== undefined) {
        url += `?id=${id}`;
      }
      uni.navigateTo({ url });
    };

    // 删除衣物明细
    const handleDelete = (id) => {
      const ids = id ? [id] : removeIds.value;

      if (ids.length === 0) {
        uni.showToast({
          title: "请选择要删除的衣物明细",
          icon: "none"
        });
        return;
      }

      uni.showModal({
        title: '提示',
        content: '确认删除选中的衣物明细吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '删除中...' });
            AioveuLaundryOrderItemAPI.deleteByIds(ids.join(","))
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
      const item = processStatusOptions.value.find(i => Number(i.value) === status);
      return item ? item.label : '未知状态';
    };

    // 获取状态类名
    const getStatusClass = (status) => {
      return status === 6 ? 'status-active' : 'status-inactive';
    };

    // 格式化时间
    const formatTime = (time) => {
      return time ? time.substring(0, 16) : '';
    };

    // 加载订单选项
    const loadOrderOptions = () => {
      AioveuLaundryOrderAPI.getAllLaundryOrderOptions()
        .then(response => {
          if (Array.isArray(response)) {
            orderOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载订单选项失败:', error);
        });
    };

    // 加载衣物类型选项
    const loadClothingTypeOptions = () => {
      AioveuLaundryClothingTypeAPI.getAllLaundryClothingTypeOptions()
        .then(response => {
          if (Array.isArray(response)) {
            clothingTypeOptions.value = response;
          }
        })
        .catch(error => {
          console.error('加载衣物类型选项失败:', error);
        });
    };

    // 加载处理状态选项
    const loadProcessStatusOptions = () => {
      DictAPI.getDictItems('laundry_order_item_process_status')
        .then(response => {
          processStatusOptions.value = response;
        })
        .catch(error => {
          console.error('加载处理状态选项失败:', error);
        });
    };

    onMounted(() => {
      handleQuery();
      loadOrderOptions();
      loadClothingTypeOptions();
      loadProcessStatusOptions();
    });

    return {
      loading,
      removeIds,
      total,
      showFilter,
      queryParams,
      pageData,
      orderOptions,
      clothingTypeOptions,
      processStatusOptions,
      orderIndex,
      clothingTypeIndex,
      processStatusIndex,
      toggleFilter,
      onOrderChange,
      onClothingTypeChange,
      onProcessStatusChange,
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

/* 衣物明细列表 */
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

.item-card {
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

  .order-no {
    font-size: 32rpx;
    font-weight: 700;
    color: #1a1a1a;
  }

  .status {
    font-size: 28rpx;
    padding: 8rpx 20rpx;
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
